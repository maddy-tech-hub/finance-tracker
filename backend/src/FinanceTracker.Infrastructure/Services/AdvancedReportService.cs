using FinanceTracker.Application.DTOs.Reports;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Common;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class AdvancedReportService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IAdvancedReportService
{
    public async Task<TrendsResponse> GetTrendsAsync(DateTime from, DateTime to, Guid? accountId, Guid? categoryId, CancellationToken cancellationToken)
    {
        from = UtcDateTime.Normalize(from);
        to = UtcDateTime.Normalize(to);

        var query = db.Transactions.AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId && x.TransactionDate >= from && x.TransactionDate <= to);

        if (accountId.HasValue)
            query = query.Where(x => x.AccountId == accountId.Value || x.DestinationAccountId == accountId.Value);
        if (categoryId.HasValue)
            query = query.Where(x => x.CategoryId == categoryId.Value);

        var rows = await query
            .Select(x => new
            {
                x.TransactionDate,
                x.Type,
                x.Amount,
                CategoryName = x.Category != null ? x.Category.Name : null
            })
            .ToListAsync(cancellationToken);

        var monthly = rows
            .GroupBy(x => new { x.TransactionDate.Year, x.TransactionDate.Month })
            .OrderBy(g => g.Key.Year)
            .ThenBy(g => g.Key.Month)
            .Select(g =>
            {
                var income = g.Where(x => x.Type == TransactionType.Income).Sum(x => x.Amount);
                var expense = g.Where(x => x.Type == TransactionType.Expense).Sum(x => x.Amount);
                var savingsRate = income > 0 ? Math.Round(((income - expense) / income) * 100m, 2) : 0m;
                return new TrendPoint($"{g.Key.Year}-{g.Key.Month:D2}", income, expense, savingsRate);
            })
            .ToList();

        var categoryTrend = rows
            .Where(x => x.Type == TransactionType.Expense && !string.IsNullOrWhiteSpace(x.CategoryName))
            .GroupBy(x => new { x.TransactionDate.Year, x.TransactionDate.Month, Category = x.CategoryName! })
            .OrderBy(g => g.Key.Year)
            .ThenBy(g => g.Key.Month)
            .ThenByDescending(g => g.Sum(x => x.Amount))
            .Select(g => new CategoryTrendPoint($"{g.Key.Year}-{g.Key.Month:D2}", g.Key.Category, g.Sum(x => x.Amount)))
            .Take(180)
            .ToList();

        return new TrendsResponse(monthly, categoryTrend);
    }

    public async Task<NetWorthResponse> GetNetWorthAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        from = UtcDateTime.Normalize(from).Date;
        to = UtcDateTime.Normalize(to).Date;

        if (to < from)
            (from, to) = (to, from);

        var now = DateTime.UtcNow.Date;
        var currentBalance = await db.Accounts
            .AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId)
            .Select(x => (decimal?)x.Balance)
            .SumAsync(cancellationToken) ?? 0m;

        var tx = await db.Transactions
            .AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId && x.TransactionDate.Date >= from && x.TransactionDate.Date <= now)
            .Select(x => new { Day = x.TransactionDate.Date, x.Type, x.Amount })
            .ToListAsync(cancellationToken);

        var dailyNet = tx
            .GroupBy(x => x.Day)
            .ToDictionary(
                g => g.Key,
                g => g.Sum(item => item.Type switch
                {
                    TransactionType.Income => item.Amount,
                    TransactionType.Expense => -item.Amount,
                    _ => 0m
                }));

        var afterToFlow = dailyNet
            .Where(x => x.Key > to)
            .Sum(x => x.Value);

        var netWorthAtTo = currentBalance - afterToFlow;
        var points = new List<NetWorthPoint>();

        var cursorWorth = netWorthAtTo;
        for (var day = to; day >= from; day = day.AddDays(-1))
        {
            points.Add(new NetWorthPoint(day, cursorWorth));
            cursorWorth -= dailyNet.GetValueOrDefault(day, 0m);
        }
        points.Reverse();

        var start = points.Count > 0 ? points[0].NetWorth : 0m;
        var end = points.Count > 0 ? points[^1].NetWorth : 0m;
        var changeAmount = end - start;
        var changePercent = start == 0 ? 0 : Math.Round((changeAmount / start) * 100m, 2);

        return new NetWorthResponse(points, changeAmount, changePercent);
    }
}
