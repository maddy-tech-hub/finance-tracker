using FinanceTracker.Application.DTOs.Accounts;

namespace FinanceTracker.Application.Interfaces;

public interface IAccountService
{
    Task<IReadOnlyList<AccountResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<AccountResponse> CreateAsync(AccountRequest request, CancellationToken cancellationToken);
    Task<AccountResponse> UpdateAsync(Guid id, AccountRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task TransferAsync(AccountTransferRequest request, CancellationToken cancellationToken);
}
