using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Reports;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v2/reports")]
public sealed class ReportsV2Controller(IAdvancedReportService advancedReportService) : ControllerBase
{
    [HttpGet("trends")]
    public async Task<ActionResult<ApiResponse<TrendsResponse>>> Trends([FromQuery] DateTime from, [FromQuery] DateTime to, [FromQuery] Guid? accountId, [FromQuery] Guid? categoryId, CancellationToken cancellationToken) =>
        Ok(ApiResponse<TrendsResponse>.Ok(await advancedReportService.GetTrendsAsync(from, to, accountId, categoryId, cancellationToken)));

    [HttpGet("net-worth")]
    public async Task<ActionResult<ApiResponse<NetWorthResponse>>> NetWorth([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(ApiResponse<NetWorthResponse>.Ok(await advancedReportService.GetNetWorthAsync(from, to, cancellationToken)));
}
