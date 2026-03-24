using FinanceTracker.Domain.Common;

namespace FinanceTracker.Domain.Entities;

public sealed class TransactionTag : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid TransactionId { get; set; }
    public string Tag { get; set; } = string.Empty;

    public User? User { get; set; }
    public Transaction? Transaction { get; set; }
}
