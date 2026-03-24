using FinanceTracker.Application.DTOs.Insights;

namespace FinanceTracker.Application.Interfaces;

public interface IInsightService
{
    Task<InsightSummaryResponse> GetInsightsAsync(CancellationToken cancellationToken);
}
