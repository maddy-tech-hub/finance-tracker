using FinanceTracker.Domain.Common;

namespace FinanceTracker.Domain.Entities;

public sealed class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public string? ReplacedByToken { get; set; }

    public User? User { get; set; }
}
