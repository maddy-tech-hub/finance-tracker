using FinanceTracker.Domain.Common;
using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Domain.Entities;

public sealed class RuleDefinition : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int Priority { get; set; } = 100;
    public RuleConditionType ConditionType { get; set; }
    public string? ConditionValue { get; set; }
    public decimal? AmountThreshold { get; set; }
    public RuleActionType ActionType { get; set; }
    public string? ActionValue { get; set; }

    public User? User { get; set; }
}
