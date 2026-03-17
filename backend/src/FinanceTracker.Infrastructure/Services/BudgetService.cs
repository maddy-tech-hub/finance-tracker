using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Budgets;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class BudgetService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IBudgetService
{
    public async Task<IReadOnlyList<BudgetResponse>> GetByMonthAsync(int month, int year, CancellationToken cancellationToken)
    {
        var budgets = await db.Budgets
            .Where(x => x.UserId == currentUser.UserId && x.Month == month && x.Year == year)
            .Include(x => x.Category)
            .ToListAsync(cancellationToken);

        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);

        var spendByCategory = await db.Transactions
            .Where(t => t.UserId == currentUser.UserId && t.Type == TransactionType.Expense && t.TransactionDate >= start && t.TransactionDate < end && t.CategoryId.HasValue)
            .GroupBy(t => t.CategoryId!.Value)
            .Select(g => new { CategoryId = g.Key, Total = g.Sum(x => x.Amount) })
            .ToDictionaryAsync(x => x.CategoryId, x => x.Total, cancellationToken);

        return budgets.Select(x =>
        {
            var actual = spendByCategory.GetValueOrDefault(x.CategoryId, 0m);
            var percent = x.Amount == 0 ? 0 : Math.Round((actual / x.Amount) * 100, 2);
            var alert = percent >= 120 ? "Critical" : percent >= 100 ? "Exceeded" : percent >= 80 ? "Warning" : "OnTrack";
            return new BudgetResponse(x.Id, x.CategoryId, x.Category?.Name ?? "N/A", x.Month, x.Year, x.Amount, actual, percent, alert);
        }).ToList();
    }

    public async Task<BudgetResponse> CreateAsync(BudgetRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var exists = await db.Budgets.AnyAsync(x => x.UserId == currentUser.UserId && x.Month == request.Month && x.Year == request.Year && x.CategoryId == request.CategoryId, cancellationToken);
        if (exists) throw new AppValidationException("Budget already exists for category in this month.");

        var budget = new Budget
        {
            UserId = currentUser.UserId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Month = request.Month,
            Year = request.Year
        };

        db.Budgets.Add(budget);
        await db.SaveChangesAsync(cancellationToken);
        var category = await db.Categories.FirstOrDefaultAsync(x => x.Id == budget.CategoryId, cancellationToken);
        return new BudgetResponse(budget.Id, budget.CategoryId, category?.Name ?? "N/A", budget.Month, budget.Year, budget.Amount, 0, 0, "OnTrack");
    }

    public async Task<BudgetResponse> UpdateAsync(Guid id, BudgetRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var budget = await db.Budgets.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Budget not found.");

        budget.CategoryId = request.CategoryId;
        budget.Month = request.Month;
        budget.Year = request.Year;
        budget.Amount = request.Amount;

        await db.SaveChangesAsync(cancellationToken);
        return new BudgetResponse(budget.Id, budget.CategoryId, budget.Category?.Name ?? "N/A", budget.Month, budget.Year, budget.Amount, 0, 0, "OnTrack");
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var budget = await db.Budgets.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Budget not found.");

        db.Budgets.Remove(budget);
        await db.SaveChangesAsync(cancellationToken);
    }

    private static void Validate(BudgetRequest request)
    {
        if (request.Amount <= 0) throw new AppValidationException("Budget amount must be greater than zero.");
        if (request.Month is < 1 or > 12) throw new AppValidationException("Month must be 1-12.");
        if (request.Year is < 2000 or > 2100) throw new AppValidationException("Year is invalid.");
    }
}
