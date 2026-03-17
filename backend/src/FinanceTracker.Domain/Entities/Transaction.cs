using FinanceTracker.Domain.Common;
using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Domain.Entities;

public sealed class Transaction : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public Guid? DestinationAccountId { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? RecurringTransactionId { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string? Note { get; set; }
    public DateTime TransactionDate { get; set; }
    public bool IsRecurringGenerated { get; set; }

    public User? User { get; set; }
    public Account? Account { get; set; }
    public Account? DestinationAccount { get; set; }
    public Category? Category { get; set; }
    public RecurringTransaction? RecurringTransaction { get; set; }
}
