using FinanceTracker.Application.DTOs.Insights;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class HealthScoreService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IHealthScoreService
{
    public async Task<HealthScoreResponse> GetHealthScoreAsync(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var previousMonthStart = monthStart.AddMonths(-1);
        var historyStart = monthStart.AddMonths(-5);

        var tx = await db.Transactions
            .AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId && x.TransactionDate >= historyStart)
            .ToListAsync(cancellationToken);

        var monthlyIncome = tx
            .Where(x => x.Type == TransactionType.Income && x.TransactionDate >= monthStart)
            .Sum(x => x.Amount);
        var monthlyExpense = tx
            .Where(x => x.Type == TransactionType.Expense && x.TransactionDate >= monthStart)
            .Sum(x => x.Amount);
        var monthlySavings = monthlyIncome - monthlyExpense;

        var transactionCount = tx.Count;
        var savingsRateHasData = monthlyIncome > 0;
        var savingsRate = savingsRateHasData ? Math.Clamp(monthlySavings / monthlyIncome, -1m, 1m) : 0m;
        var savingsRateScore = savingsRateHasData
            ? Math.Round(Math.Clamp((savingsRate + 0.1m) / 0.5m, 0m, 1m) * 30m, 2)
            : 0m;

        var expensesByMonth = tx
            .Where(x => x.Type == TransactionType.Expense)
            .GroupBy(x => new { x.TransactionDate.Year, x.TransactionDate.Month })
            .Select(g => g.Sum(x => x.Amount))
            .OrderBy(x => x)
            .ToList();

        var expenseStabilityHasData = expensesByMonth.Count >= 2;
        decimal expenseStabilityScore;
        if (!expenseStabilityHasData)
        {
            expenseStabilityScore = 0m;
        }
        else
        {
            var avg = expensesByMonth.Average();
            if (avg <= 0)
            {
                expenseStabilityScore = 20m;
            }
            else
            {
                var variance = expensesByMonth.Average(x => Math.Pow((double)(x - avg), 2));
                var stdDev = (decimal)Math.Sqrt(variance);
                var cv = avg == 0 ? 0 : stdDev / avg;
                expenseStabilityScore = Math.Round(Math.Clamp(1 - cv, 0m, 1m) * 20m, 2);
            }
        }

        var budgets = await db.Budgets
            .AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId && x.Month == now.Month && x.Year == now.Year)
            .ToListAsync(cancellationToken);

        var budgetAdherenceHasData = budgets.Count > 0;
        decimal budgetAdherenceScore;
        if (!budgetAdherenceHasData)
        {
            budgetAdherenceScore = 0m;
        }
        else
        {
            var spendByCategory = tx
                .Where(x => x.Type == TransactionType.Expense && x.TransactionDate >= monthStart && x.CategoryId.HasValue)
                .GroupBy(x => x.CategoryId!.Value)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.Amount));

            var adherenceParts = budgets.Select(b =>
            {
                var spend = spendByCategory.GetValueOrDefault(b.CategoryId, 0m);
                if (b.Amount <= 0) return 0m;
                var usage = spend / b.Amount;
                return usage <= 1m ? 1m : Math.Clamp(1.5m - usage, 0m, 1m);
            }).ToList();

            var avgAdherence = adherenceParts.Count > 0 ? adherenceParts.Average() : 0m;
            budgetAdherenceScore = Math.Round(avgAdherence * 25m, 2);
        }

        var totalBalance = await db.Accounts
            .AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId)
            .Select(x => (decimal?)x.Balance)
            .SumAsync(cancellationToken) ?? 0m;

        var recentMonthlyExpense = tx
            .Where(x => x.Type == TransactionType.Expense && x.TransactionDate >= previousMonthStart)
            .GroupBy(x => new { x.TransactionDate.Year, x.TransactionDate.Month })
            .Select(g => g.Sum(x => x.Amount))
            .DefaultIfEmpty(0m)
            .Average();

        var cashBufferHasData = recentMonthlyExpense > 0;
        var cashBufferMonths = cashBufferHasData ? totalBalance / recentMonthlyExpense : 0m;
        var cashBufferScore = cashBufferHasData
            ? Math.Round(Math.Clamp(cashBufferMonths / 6m, 0m, 1m) * 25m, 2)
            : 0m;

        var factors = new List<HealthScoreFactor>
        {
            new(
                "savings-rate",
                "Savings Rate",
                savingsRateScore,
                30m,
                savingsRateHasData ? (savingsRateScore >= 21m ? "Strong" : savingsRateScore >= 12m ? "Moderate" : "Needs attention") : "Insufficient data",
                savingsRateHasData ? $"Current monthly savings rate: {Math.Round(savingsRate * 100m, 1)}%" : "Add at least one income transaction this month to calculate savings rate"),
            new(
                "expense-stability",
                "Expense Stability",
                expenseStabilityScore,
                20m,
                expenseStabilityHasData ? (expenseStabilityScore >= 14m ? "Stable" : expenseStabilityScore >= 8m ? "Mixed" : "Volatile") : "Insufficient data",
                expenseStabilityHasData ? "Based on month-over-month expense volatility" : "Need expense transactions across at least 2 months"),
            new(
                "budget-adherence",
                "Budget Adherence",
                budgetAdherenceScore,
                25m,
                budgetAdherenceHasData ? (budgetAdherenceScore >= 17m ? "On track" : budgetAdherenceScore >= 10m ? "Watch" : "Over budget") : "Not configured",
                budgetAdherenceHasData ? "Based on current-month budget utilization" : "Create at least one monthly budget to activate this factor"),
            new(
                "cash-buffer",
                "Cash Buffer",
                cashBufferScore,
                25m,
                cashBufferHasData ? (cashBufferScore >= 17m ? "Resilient" : cashBufferScore >= 10m ? "Limited" : "Thin") : "Insufficient data",
                cashBufferHasData ? $"Estimated cash runway: {Math.Round(cashBufferMonths, 1)} month(s)" : "Need recent expense history to estimate runway")
        };

        var missingFactorCount = factors.Count(x => x.Status is "Insufficient data" or "Not configured");
        var isProvisional = transactionCount < 8 || missingFactorCount > 0;
        var provisionalReason = BuildProvisionalReason(transactionCount, missingFactorCount);

        var totalScore = Math.Round(factors.Sum(x => x.Score), 2);
        var suggestions = BuildSuggestions(
            savingsRate,
            cashBufferMonths,
            budgetAdherenceScore,
            expenseStabilityScore,
            transactionCount,
            budgetAdherenceHasData,
            missingFactorCount);

        return new HealthScoreResponse(
            totalScore,
            100m,
            factors,
            suggestions,
            DateTime.UtcNow,
            isProvisional,
            provisionalReason,
            transactionCount);
    }

    private static string? BuildProvisionalReason(int transactionCount, int missingFactorCount)
    {
        if (transactionCount == 0)
            return "No transactions found yet. Your score will become meaningful after your first few entries.";

        if (missingFactorCount > 0)
            return "This is a provisional score. Some factors need more data or setup to become fully reliable.";

        if (transactionCount < 8)
            return "This is an early score based on limited history. Confidence improves as more transactions are added.";

        return null;
    }

    private static IReadOnlyList<string> BuildSuggestions(
        decimal savingsRate,
        decimal cashBufferMonths,
        decimal budgetAdherenceScore,
        decimal expenseStabilityScore,
        int transactionCount,
        bool hasBudgetAdherenceData,
        int missingFactorCount)
    {
        var result = new List<string>();
        if (transactionCount == 0)
        {
            return
            [
                "Add your first income and expense transactions to unlock a meaningful health score.",
                "Set at least one monthly budget so adherence can be measured.",
                "Keep account balances updated to improve cash-buffer estimation."
            ];
        }

        if (missingFactorCount > 0)
        {
            if (!hasBudgetAdherenceData)
                result.Add("Create at least one monthly budget to unlock budget adherence scoring.");
            result.Add("Keep logging transactions weekly so trend-based factors become more reliable.");
        }

        if (savingsRate < 0.15m)
            result.Add("Try automating a fixed transfer after income to improve your monthly savings rate.");
        if (cashBufferMonths < 2m)
            result.Add("Build an emergency buffer targeting at least 2 months of expenses.");
        if (budgetAdherenceScore < 12m)
            result.Add("Review categories crossing budget limits and tighten high-variance categories.");
        if (expenseStabilityScore < 10m)
            result.Add("Recurring bills are stable, so focus on reducing discretionary spending spikes.");

        if (result.Count == 0)
            result.Add("You are on a healthy trajectory. Keep consistent tracking and budget discipline.");

        return result;
    }
}
