using FinanceTracker.Application.DTOs.Transactions;

namespace FinanceTracker.Application.Interfaces;

public interface ITransactionService
{
    Task<IReadOnlyList<TransactionResponse>> GetAllAsync(DateTime? from, DateTime? to, string? search, Guid? accountId, Guid? categoryId, CancellationToken cancellationToken);
    Task<TransactionResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<TransactionResponse> CreateAsync(TransactionRequest request, CancellationToken cancellationToken);
    Task<TransactionResponse> UpdateAsync(Guid id, TransactionRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
