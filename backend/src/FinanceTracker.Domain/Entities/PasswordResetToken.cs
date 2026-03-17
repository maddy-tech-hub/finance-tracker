using FinanceTracker.Domain.Common;

namespace FinanceTracker.Domain.Entities;

public sealed class PasswordResetToken : BaseEntity
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? UsedAtUtc { get; set; }

    public User? User { get; set; }
}
