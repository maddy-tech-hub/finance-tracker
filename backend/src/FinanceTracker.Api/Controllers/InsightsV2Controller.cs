using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Insights;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v2/insights")]
public sealed class InsightsV2Controller(IHealthScoreService healthScoreService, IInsightService insightService) : ControllerBase
{
    [HttpGet("health-score")]
    public async Task<ActionResult<ApiResponse<HealthScoreResponse>>> HealthScore(CancellationToken cancellationToken) =>
        Ok(ApiResponse<HealthScoreResponse>.Ok(await healthScoreService.GetHealthScoreAsync(cancellationToken)));

    [HttpGet]
    public async Task<ActionResult<ApiResponse<InsightSummaryResponse>>> Insights(CancellationToken cancellationToken) =>
        Ok(ApiResponse<InsightSummaryResponse>.Ok(await insightService.GetInsightsAsync(cancellationToken)));
}
