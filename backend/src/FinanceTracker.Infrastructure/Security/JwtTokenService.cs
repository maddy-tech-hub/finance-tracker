using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FinanceTracker.Application.DTOs.Auth;
using FinanceTracker.Application.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FinanceTracker.Infrastructure.Security;

public sealed class JwtTokenService(IOptions<JwtOptions> options) : ITokenService
{
    private readonly JwtOptions _options = options.Value;

    public string GenerateAccessToken(Guid userId, string email)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email)
        };

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_options.AccessTokenMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public RefreshTokenResult RotateRefreshToken(RefreshTokenRequest request)
    {
        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(request.AccessToken);
        var userId = Guid.Parse(token.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
        var email = token.Claims.First(c => c.Type == ClaimTypes.Email).Value;
        var access = GenerateAccessToken(userId, email);
        var refresh = GenerateRefreshToken();
        return new RefreshTokenResult(userId, email, access, refresh, DateTime.UtcNow.AddMinutes(_options.AccessTokenMinutes));
    }
}
