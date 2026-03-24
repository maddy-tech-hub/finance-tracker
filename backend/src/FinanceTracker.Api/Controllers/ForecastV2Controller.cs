using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Forecast;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v2/forecast")]
public sealed class ForecastV2Controller(IForecastService forecastService) : ControllerBase
{
    [HttpGet("month")]
    public async Task<ActionResult<ApiResponse<ForecastMonthResponse>>> Month(CancellationToken cancellationToken) =>
        Ok(ApiResponse<ForecastMonthResponse>.Ok(await forecastService.GetMonthForecastAsync(cancellationToken)));

    [HttpGet("daily")]
    public async Task<ActionResult<ApiResponse<ForecastDailyResponse>>> Daily(CancellationToken cancellationToken) =>
        Ok(ApiResponse<ForecastDailyResponse>.Ok(await forecastService.GetDailyForecastAsync(cancellationToken)));
}
