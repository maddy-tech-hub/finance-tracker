using FinanceTracker.Application.DTOs.Recurring;

namespace FinanceTracker.Application.Interfaces;

public interface IRecurringService
{
    Task<IReadOnlyList<RecurringResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<RecurringResponse> CreateAsync(RecurringRequest request, CancellationToken cancellationToken);
    Task<RecurringResponse> UpdateAsync(Guid id, RecurringRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task ProcessDueTransactionsAsync(CancellationToken cancellationToken);
}
