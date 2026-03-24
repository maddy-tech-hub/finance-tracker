using FinanceTracker.Domain.Common;
using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Domain.Entities;

public sealed class TransactionAlert : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid TransactionId { get; set; }
    public string Message { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; } = AlertSeverity.Warning;

    public User? User { get; set; }
    public Transaction? Transaction { get; set; }
}
