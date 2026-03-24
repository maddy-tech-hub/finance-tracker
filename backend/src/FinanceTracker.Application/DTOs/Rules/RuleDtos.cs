using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Application.DTOs.Rules;

public sealed record RuleRequest(
    string Name,
    bool IsActive,
    int Priority,
    RuleConditionType ConditionType,
    string? ConditionValue,
    decimal? AmountThreshold,
    RuleActionType ActionType,
    string? ActionValue);

public sealed record RuleResponse(
    Guid Id,
    string Name,
    bool IsActive,
    int Priority,
    RuleConditionType ConditionType,
    string? ConditionValue,
    decimal? AmountThreshold,
    RuleActionType ActionType,
    string? ActionValue,
    DateTime UpdatedAtUtc);
