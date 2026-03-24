using FinanceTracker.Application.DTOs.Insights;

namespace FinanceTracker.Application.Interfaces;

public interface IHealthScoreService
{
    Task<HealthScoreResponse> GetHealthScoreAsync(CancellationToken cancellationToken);
}
