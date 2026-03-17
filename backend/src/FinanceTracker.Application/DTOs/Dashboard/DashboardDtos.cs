namespace FinanceTracker.Application.DTOs.Dashboard;

public sealed record DashboardSummaryResponse(decimal TotalBalance, decimal MonthlyIncome, decimal MonthlyExpense, decimal MonthlySavings, int ActiveGoals, int DueRecurringCount);
