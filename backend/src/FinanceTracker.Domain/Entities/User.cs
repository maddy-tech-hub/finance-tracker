using FinanceTracker.Domain.Common;

namespace FinanceTracker.Domain.Entities;

public sealed class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsEmailVerified { get; set; }

    public ICollection<Account> Accounts { get; set; } = new List<Account>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<SavingsGoal> Goals { get; set; } = new List<SavingsGoal>();
    public ICollection<RecurringTransaction> RecurringTransactions { get; set; } = new List<RecurringTransaction>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
    public ICollection<RuleDefinition> Rules { get; set; } = new List<RuleDefinition>();
    public ICollection<TransactionAlert> Alerts { get; set; } = new List<TransactionAlert>();
    public ICollection<TransactionTag> TransactionTags { get; set; } = new List<TransactionTag>();
}
