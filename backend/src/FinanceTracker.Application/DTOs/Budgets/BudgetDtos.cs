namespace FinanceTracker.Application.DTOs.Budgets;

public sealed record BudgetRequest(Guid CategoryId, int Month, int Year, decimal Amount);
public sealed record BudgetResponse(Guid Id, Guid CategoryId, string CategoryName, int Month, int Year, decimal Amount, decimal ActualSpend, decimal UtilizationPercent, string AlertLevel);
