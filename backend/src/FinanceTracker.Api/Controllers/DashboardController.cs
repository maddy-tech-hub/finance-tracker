using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Dashboard;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<DashboardSummaryResponse>>> Summary(CancellationToken cancellationToken) =>
        Ok(ApiResponse<DashboardSummaryResponse>.Ok(await dashboardService.GetSummaryAsync(cancellationToken)));
}
