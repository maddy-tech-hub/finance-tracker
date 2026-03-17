using FinanceTracker.Domain.Common;
using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Domain.Entities;

public sealed class Account : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public string Currency { get; set; } = "INR";
    public decimal Balance { get; set; }
    public bool IsArchived { get; set; }

    public User? User { get; set; }
    public ICollection<Transaction> SourceTransactions { get; set; } = new List<Transaction>();
    public ICollection<Transaction> DestinationTransactions { get; set; } = new List<Transaction>();
    public ICollection<SavingsGoal> LinkedGoals { get; set; } = new List<SavingsGoal>();
}
