namespace FinanceTracker.Application.DTOs.Goals;

public sealed record GoalRequest(string Name, decimal TargetAmount, decimal CurrentAmount, DateTime? TargetDate, Guid? LinkedAccountId);
public sealed record GoalActionRequest(decimal Amount);
public sealed record GoalResponse(Guid Id, string Name, decimal TargetAmount, decimal CurrentAmount, DateTime? TargetDate, Guid? LinkedAccountId, decimal ProgressPercent);
