namespace FinanceTracker.Application.DTOs.Forecast;

public sealed record ForecastMonthResponse(decimal CurrentBalance, decimal ProjectedEndOfMonthBalance, decimal ExpectedIncome, decimal ExpectedExpense, decimal SafeToSpend, bool AtRiskOfNegativeBalance, string Explanation);
public sealed record ForecastDailyPoint(DateTime Date, decimal ProjectedBalance);
public sealed record ForecastDailyResponse(IReadOnlyList<ForecastDailyPoint> Points);
