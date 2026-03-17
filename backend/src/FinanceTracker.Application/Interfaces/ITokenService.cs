using FinanceTracker.Application.DTOs.Auth;

namespace FinanceTracker.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(Guid userId, string email);
    string GenerateRefreshToken();
    RefreshTokenResult RotateRefreshToken(RefreshTokenRequest request);
}
