using FinanceTracker.Application.DTOs.Forecast;

namespace FinanceTracker.Application.Interfaces;

public interface IForecastService
{
    Task<ForecastMonthResponse> GetMonthForecastAsync(CancellationToken cancellationToken);
    Task<ForecastDailyResponse> GetDailyForecastAsync(CancellationToken cancellationToken);
}
