using FinanceTracker.Domain.Common;
using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Domain.Entities;

public sealed class RecurringTransaction : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public Guid? DestinationAccountId { get; set; }
    public Guid? CategoryId { get; set; }
    public TransactionType Type { get; set; }
    public RecurrenceFrequency Frequency { get; set; }
    public decimal Amount { get; set; }
    public string? Note { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime NextRunDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsPaused { get; set; }

    public User? User { get; set; }
    public Account? Account { get; set; }
    public Account? DestinationAccount { get; set; }
    public Category? Category { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
