using FinanceTracker.Domain.Entities;

namespace FinanceTracker.Application.Interfaces;

public interface IRuleEngineService
{
    Task ApplyOnTransactionCreateAsync(Transaction transaction, CancellationToken cancellationToken);
}
