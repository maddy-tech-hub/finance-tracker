using FinanceTracker.Application.Interfaces;

namespace FinanceTracker.Infrastructure.Security;

public sealed class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
}
