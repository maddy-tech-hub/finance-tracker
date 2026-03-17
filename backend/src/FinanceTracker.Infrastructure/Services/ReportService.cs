using System.Text;
using FinanceTracker.Application.DTOs.Reports;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Infrastructure.Common;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class ReportService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IReportService
{
    public async Task<IReadOnlyList<CategorySpendReportItem>> CategorySpendAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        from = UtcDateTime.Normalize(from);
        to = UtcDateTime.Normalize(to);

        var rows = await db.Transactions
            .Where(x => x.UserId == currentUser.UserId && x.Type == TransactionType.Expense && x.TransactionDate >= from && x.TransactionDate <= to && x.Category != null)
            .GroupBy(x => x.Category!.Name)
            .Select(g => new
            {
                CategoryName = g.Key,
                TotalAmount = g.Sum(t => t.Amount)
            })
            .OrderByDescending(x => x.TotalAmount)
            .ToListAsync(cancellationToken);

        return rows.Select(x => new CategorySpendReportItem(x.CategoryName, x.TotalAmount)).ToList();
    }

    public async Task<IReadOnlyList<IncomeVsExpenseReportItem>> IncomeVsExpenseAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        from = UtcDateTime.Normalize(from);
        to = UtcDateTime.Normalize(to);

        var data = await db.Transactions
            .Where(x => x.UserId == currentUser.UserId && x.TransactionDate >= from && x.TransactionDate <= to)
            .GroupBy(x => new { x.TransactionDate.Year, x.TransactionDate.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Income = g.Where(x => x.Type == TransactionType.Income).Sum(x => x.Amount),
                Expense = g.Where(x => x.Type == TransactionType.Expense).Sum(x => x.Amount)
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync(cancellationToken);

        return data
            .Select(x => new IncomeVsExpenseReportItem($"{x.Year}-{x.Month:D2}", x.Income, x.Expense))
            .ToList();
    }

    public async Task<IReadOnlyList<AccountBalanceTrendItem>> AccountBalanceTrendAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        to = UtcDateTime.Normalize(to);

        var accounts = await db.Accounts
            .Where(x => x.UserId == currentUser.UserId)
            .Select(x => new AccountBalanceTrendItem(x.Name, to, x.Balance))
            .ToListAsync(cancellationToken);
        return accounts;
    }

    public async Task<IReadOnlyList<SavingsProgressItem>> SavingsProgressAsync(CancellationToken cancellationToken)
    {
        return await db.Goals
            .Where(x => x.UserId == currentUser.UserId)
            .Select(x => new SavingsProgressItem(x.Name, x.CurrentAmount, x.TargetAmount, x.TargetAmount == 0 ? 0 : Math.Round((x.CurrentAmount / x.TargetAmount) * 100, 2)))
            .ToListAsync(cancellationToken);
    }

    public async Task<string> ExportCsvAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        from = UtcDateTime.Normalize(from);
        to = UtcDateTime.Normalize(to);

        var rows = await db.Transactions
            .Where(x => x.UserId == currentUser.UserId && x.TransactionDate >= from && x.TransactionDate <= to)
            .OrderByDescending(x => x.TransactionDate)
            .Select(x => new { x.TransactionDate, x.Type, x.Amount, x.Note })
            .ToListAsync(cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("Date,Type,Amount,Note");
        foreach (var row in rows)
        {
            var cleanNote = (row.Note ?? string.Empty).Replace(',', ';').Replace('\n', ' ');
            sb.AppendLine($"{row.TransactionDate:yyyy-MM-dd},{row.Type},{row.Amount},{cleanNote}");
        }

        return sb.ToString();
    }
}
