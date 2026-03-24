namespace FinanceTracker.Application.DTOs.Reports;

public sealed record TrendPoint(string Period, decimal Income, decimal Expense, decimal SavingsRate);
public sealed record CategoryTrendPoint(string Period, string CategoryName, decimal Amount);
public sealed record TrendsResponse(IReadOnlyList<TrendPoint> IncomeExpenseTrend, IReadOnlyList<CategoryTrendPoint> CategoryTrend);

public sealed record NetWorthPoint(DateTime Date, decimal NetWorth);
public sealed record NetWorthResponse(IReadOnlyList<NetWorthPoint> Points, decimal ChangeAmount, decimal ChangePercent);
