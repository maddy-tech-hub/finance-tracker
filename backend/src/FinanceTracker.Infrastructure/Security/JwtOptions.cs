namespace FinanceTracker.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = "FinanceTracker";
    public string Audience { get; set; } = "FinanceTracker.Client";
    public string Key { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 30;
    public int RefreshTokenDays { get; set; } = 14;
}
