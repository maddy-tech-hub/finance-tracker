using FinanceTracker.Application.DTOs.Dashboard;

namespace FinanceTracker.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken);
}
