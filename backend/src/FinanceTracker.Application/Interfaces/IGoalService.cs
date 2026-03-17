using FinanceTracker.Application.DTOs.Goals;

namespace FinanceTracker.Application.Interfaces;

public interface IGoalService
{
    Task<IReadOnlyList<GoalResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<GoalResponse> CreateAsync(GoalRequest request, CancellationToken cancellationToken);
    Task<GoalResponse> UpdateAsync(Guid id, GoalRequest request, CancellationToken cancellationToken);
    Task<GoalResponse> ContributeAsync(Guid id, decimal amount, CancellationToken cancellationToken);
    Task<GoalResponse> WithdrawAsync(Guid id, decimal amount, CancellationToken cancellationToken);
}
