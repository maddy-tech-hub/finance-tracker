using FinanceTracker.Application.DTOs.Dashboard;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class DashboardService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IDashboardService
{
    public async Task<DashboardSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken)
    {
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthEnd = monthStart.AddMonths(1);

        var totalBalance = await db.Accounts
            .Where(x => x.UserId == currentUser.UserId)
            .Select(x => (decimal?)x.Balance)
            .SumAsync(cancellationToken) ?? 0m;

        var monthlyIncome = await db.Transactions
            .Where(x => x.UserId == currentUser.UserId && x.Type == TransactionType.Income && x.TransactionDate >= monthStart && x.TransactionDate < monthEnd)
            .Select(x => (decimal?)x.Amount)
            .SumAsync(cancellationToken) ?? 0m;

        var monthlyExpense = await db.Transactions
            .Where(x => x.UserId == currentUser.UserId && x.Type == TransactionType.Expense && x.TransactionDate >= monthStart && x.TransactionDate < monthEnd)
            .Select(x => (decimal?)x.Amount)
            .SumAsync(cancellationToken) ?? 0m;

        var activeGoals = await db.Goals.CountAsync(x => x.UserId == currentUser.UserId && x.CurrentAmount < x.TargetAmount, cancellationToken);
        var dueRecurring = await db.RecurringTransactions.CountAsync(x => x.UserId == currentUser.UserId && !x.IsPaused && x.NextRunDate <= DateTime.UtcNow, cancellationToken);

        return new DashboardSummaryResponse(totalBalance, monthlyIncome, monthlyExpense, monthlyIncome - monthlyExpense, activeGoals, dueRecurring);
    }
}

