using FinanceTracker.Domain.Common;
using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Domain.Entities;

public sealed class Category : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ColorHex { get; set; } = "#4F46E5";
    public string Icon { get; set; } = "tag";
    public CategoryType Type { get; set; }
    public bool IsDefault { get; set; }

    public User? User { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
}
