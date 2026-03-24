using FinanceTracker.Application.DTOs.Insights;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class InsightService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IInsightService
{
    public async Task<InsightSummaryResponse> GetInsightsAsync(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var prevMonthStart = monthStart.AddMonths(-1);

        var tx = await db.Transactions
            .AsNoTracking()
            .Include(x => x.Category)
            .Where(x => x.UserId == currentUser.UserId && x.TransactionDate >= prevMonthStart)
            .ToListAsync(cancellationToken);

        var thisMonthExpenses = tx.Where(x => x.Type == TransactionType.Expense && x.TransactionDate >= monthStart).ToList();
        var prevMonthExpenses = tx.Where(x => x.Type == TransactionType.Expense && x.TransactionDate < monthStart).ToList();
        var thisMonthTxCount = tx.Count(x => x.TransactionDate >= monthStart);
        var prevMonthTxCount = tx.Count - thisMonthTxCount;
        var hasComparableMonths = thisMonthTxCount > 0 && prevMonthTxCount > 0;

        var messages = new List<InsightMessage>();

        var thisFood = thisMonthExpenses
            .Where(x => string.Equals(x.Category?.Name, "Food", StringComparison.OrdinalIgnoreCase))
            .Sum(x => x.Amount);
        var prevFood = prevMonthExpenses
            .Where(x => string.Equals(x.Category?.Name, "Food", StringComparison.OrdinalIgnoreCase))
            .Sum(x => x.Amount);

        if (hasComparableMonths && prevFood > 0)
        {
            var delta = Math.Round(((thisFood - prevFood) / prevFood) * 100m, 1);
            if (Math.Abs(delta) >= 5)
            {
                messages.Add(new InsightMessage(
                    "Food spending trend",
                    $"Food spending {(delta >= 0 ? "increased" : "decreased")} by {Math.Abs(delta)}% compared to last month.",
                    delta > 0 ? "warning" : "success"));
            }
        }

        var thisIncome = tx.Where(x => x.Type == TransactionType.Income && x.TransactionDate >= monthStart).Sum(x => x.Amount);
        var thisExpense = thisMonthExpenses.Sum(x => x.Amount);
        var prevIncome = tx.Where(x => x.Type == TransactionType.Income && x.TransactionDate < monthStart).Sum(x => x.Amount);
        var prevExpense = prevMonthExpenses.Sum(x => x.Amount);

        var thisSavings = thisIncome - thisExpense;
        var prevSavings = prevIncome - prevExpense;
        if (hasComparableMonths && thisSavings != prevSavings)
        {
            var improved = thisSavings > prevSavings;
            messages.Add(new InsightMessage(
                "Savings momentum",
                improved
                    ? $"You saved {Math.Round(thisSavings - prevSavings, 2)} more than last month."
                    : $"You saved {Math.Round(prevSavings - thisSavings, 2)} less than last month.",
                improved ? "success" : "warning"));
        }

        if (messages.Count == 0 && hasComparableMonths)
            messages.Add(new InsightMessage("No major shifts", "Your spending pattern is stable this month.", "info"));

        return new InsightSummaryResponse(messages);
    }
}
