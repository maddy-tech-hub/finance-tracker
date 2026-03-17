using FinanceTracker.Application.DTOs.Budgets;

namespace FinanceTracker.Application.Interfaces;

public interface IBudgetService
{
    Task<IReadOnlyList<BudgetResponse>> GetByMonthAsync(int month, int year, CancellationToken cancellationToken);
    Task<BudgetResponse> CreateAsync(BudgetRequest request, CancellationToken cancellationToken);
    Task<BudgetResponse> UpdateAsync(Guid id, BudgetRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
