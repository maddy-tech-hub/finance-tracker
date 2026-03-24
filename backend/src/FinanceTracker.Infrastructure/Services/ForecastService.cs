using FinanceTracker.Application.DTOs.Forecast;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class ForecastService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IForecastService
{
    public async Task<ForecastMonthResponse> GetMonthForecastAsync(CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var endOfMonth = new DateTime(today.Year, today.Month, DateTime.DaysInMonth(today.Year, today.Month), 0, 0, 0, DateTimeKind.Utc);
        var daysRemaining = Math.Max((endOfMonth - today).Days + 1, 1);

        var currentBalance = await db.Accounts
            .AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId)
            .Select(x => (decimal?)x.Balance)
            .SumAsync(cancellationToken) ?? 0m;

        var lookbackStart = today.AddDays(-60);
        var tx = await db.Transactions
            .AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId && x.TransactionDate >= lookbackStart)
            .ToListAsync(cancellationToken);

        var historicalIncomePerDay = tx.Where(x => x.Type == TransactionType.Income).Sum(x => x.Amount) / 60m;
        var historicalExpensePerDay = tx.Where(x => x.Type == TransactionType.Expense).Sum(x => x.Amount) / 60m;

        var recurringDue = await db.RecurringTransactions
            .AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId && !x.IsPaused && x.NextRunDate.Date >= today && x.NextRunDate.Date <= endOfMonth)
            .ToListAsync(cancellationToken);

        var recurringIncome = recurringDue.Where(x => x.Type == TransactionType.Income).Sum(x => x.Amount);
        var recurringExpense = recurringDue.Where(x => x.Type == TransactionType.Expense).Sum(x => x.Amount);

        var expectedIncome = Math.Round((historicalIncomePerDay * daysRemaining) + recurringIncome, 2);
        var expectedExpense = Math.Round((historicalExpensePerDay * daysRemaining) + recurringExpense, 2);
        var projectedEnd = Math.Round(currentBalance + expectedIncome - expectedExpense, 2);
        var safeToSpend = Math.Round(Math.Max(projectedEnd, 0m) / daysRemaining, 2);

        return new ForecastMonthResponse(
            currentBalance,
            projectedEnd,
            expectedIncome,
            expectedExpense,
            safeToSpend,
            projectedEnd < 0,
            "Projection combines recent daily averages with scheduled recurring transactions.");
    }

    public async Task<ForecastDailyResponse> GetDailyForecastAsync(CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var endOfMonth = new DateTime(today.Year, today.Month, DateTime.DaysInMonth(today.Year, today.Month), 0, 0, 0, DateTimeKind.Utc);

        var month = await GetMonthForecastAsync(cancellationToken);
        var days = Math.Max((endOfMonth - today).Days + 1, 1);
        var dailyNet = (month.ExpectedIncome - month.ExpectedExpense) / days;

        var recurring = await db.RecurringTransactions
            .AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId && !x.IsPaused && x.NextRunDate.Date >= today && x.NextRunDate.Date <= endOfMonth)
            .Select(x => new { Date = x.NextRunDate.Date, x.Type, x.Amount })
            .ToListAsync(cancellationToken);

        var recurringByDay = recurring
            .GroupBy(x => x.Date)
            .ToDictionary(
                g => g.Key,
                g => g.Sum(x => x.Type switch
                {
                    TransactionType.Income => x.Amount,
                    TransactionType.Expense => -x.Amount,
                    _ => 0m
                }));

        var points = new List<ForecastDailyPoint>();
        var balance = month.CurrentBalance;
        for (var day = today; day <= endOfMonth; day = day.AddDays(1))
        {
            balance += dailyNet;
            balance += recurringByDay.GetValueOrDefault(day, 0m);
            points.Add(new ForecastDailyPoint(day, Math.Round(balance, 2)));
        }

        return new ForecastDailyResponse(points);
    }
}
