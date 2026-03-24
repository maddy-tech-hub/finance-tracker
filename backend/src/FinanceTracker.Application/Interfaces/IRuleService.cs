using FinanceTracker.Application.DTOs.Rules;

namespace FinanceTracker.Application.Interfaces;

public interface IRuleService
{
    Task<IReadOnlyList<RuleResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<RuleResponse> CreateAsync(RuleRequest request, CancellationToken cancellationToken);
    Task<RuleResponse> UpdateAsync(Guid id, RuleRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
