using FinanceTracker.Domain.Common;

namespace FinanceTracker.Domain.Entities;

public sealed class SavingsGoal : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid? LinkedAccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime? TargetDate { get; set; }

    public User? User { get; set; }
    public Account? LinkedAccount { get; set; }
}
