namespace FinanceTracker.Application.DTOs.Reports;

public sealed record CategorySpendReportItem(string CategoryName, decimal TotalAmount);
public sealed record IncomeVsExpenseReportItem(string Period, decimal Income, decimal Expense);
public sealed record AccountBalanceTrendItem(string AccountName, DateTime Date, decimal Balance);
public sealed record SavingsProgressItem(string GoalName, decimal CurrentAmount, decimal TargetAmount, decimal ProgressPercent);
