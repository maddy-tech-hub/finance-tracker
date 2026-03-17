using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;
using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Auth;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using FinanceTracker.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FinanceTracker.Infrastructure.Services;

public sealed class AuthService(
    FinanceTrackerDbContext db,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        ValidatePassword(request.Password);
        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await db.Users.AnyAsync(x => x.Email == email, cancellationToken);
        if (exists) throw new AppValidationException("Email already exists.");

        var user = new User
        {
            Email = email,
            PasswordHash = passwordHasher.Hash(request.Password),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim()
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        await SeedDefaultCategoriesAsync(user.Id, cancellationToken);

        var access = tokenService.GenerateAccessToken(user.Id, user.Email);
        var refresh = tokenService.GenerateRefreshToken();

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refresh,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenDays)
        });
        await db.SaveChangesAsync(cancellationToken);

        return new AuthResponse(access, refresh, DateTime.UtcNow.AddMinutes(jwtOptions.Value.AccessTokenMinutes), user.Id, user.Email, $"{user.FirstName} {user.LastName}");
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken)
            ?? throw new ForbiddenException("Invalid credentials.");

        if (!passwordHasher.Verify(request.Password, user.PasswordHash)) throw new ForbiddenException("Invalid credentials.");

        var access = tokenService.GenerateAccessToken(user.Id, user.Email);
        var refresh = tokenService.GenerateRefreshToken();
        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refresh,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenDays)
        });
        await db.SaveChangesAsync(cancellationToken);

        return new AuthResponse(access, refresh, DateTime.UtcNow.AddMinutes(jwtOptions.Value.AccessTokenMinutes), user.Id, user.Email, $"{user.FirstName} {user.LastName}");
    }

    public async Task<AuthResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken) || string.IsNullOrWhiteSpace(request.AccessToken))
            throw new ForbiddenException("Invalid refresh request.");

        var token = await db.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token == request.RefreshToken, cancellationToken)
            ?? throw new ForbiddenException("Invalid refresh token.");

        if (token.RevokedAtUtc.HasValue || token.ExpiresAtUtc <= DateTime.UtcNow) throw new ForbiddenException("Refresh token expired.");
        if (token.User is null) throw new ForbiddenException("Invalid refresh token state.");

        var principalUserId = ReadUserIdFromToken(request.AccessToken);
        if (principalUserId == Guid.Empty || principalUserId != token.UserId)
            throw new ForbiddenException("Token pair mismatch.");

        var access = tokenService.GenerateAccessToken(token.UserId, token.User.Email);
        var newRefresh = tokenService.GenerateRefreshToken();

        token.RevokedAtUtc = DateTime.UtcNow;
        token.ReplacedByToken = newRefresh;

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = token.UserId,
            Token = newRefresh,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenDays)
        });

        await db.SaveChangesAsync(cancellationToken);

        return new AuthResponse(access, newRefresh, DateTime.UtcNow.AddMinutes(jwtOptions.Value.AccessTokenMinutes), token.UserId, token.User.Email, $"{token.User.FirstName} {token.User.LastName}");
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (user is null) return;

        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            Token = token,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(30)
        });

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        ValidatePassword(request.NewPassword);
        var reset = await db.PasswordResetTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token == request.Token, cancellationToken)
            ?? throw new AppValidationException("Invalid reset token.");

        if (reset.ExpiresAtUtc < DateTime.UtcNow || reset.UsedAtUtc.HasValue || reset.User is null)
            throw new AppValidationException("Reset token expired or used.");

        reset.User.PasswordHash = passwordHasher.Hash(request.NewPassword);
        reset.UsedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task SeedDefaultCategoriesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var items = new[]
        {
            new Category { UserId = userId, Name = "Salary", Type = CategoryType.Income, Icon = "briefcase", ColorHex = "#16A34A", IsDefault = true },
            new Category { UserId = userId, Name = "Freelance", Type = CategoryType.Income, Icon = "wallet", ColorHex = "#059669", IsDefault = true },
            new Category { UserId = userId, Name = "Food", Type = CategoryType.Expense, Icon = "utensils", ColorHex = "#EA580C", IsDefault = true },
            new Category { UserId = userId, Name = "Transport", Type = CategoryType.Expense, Icon = "car", ColorHex = "#2563EB", IsDefault = true },
            new Category { UserId = userId, Name = "Utilities", Type = CategoryType.Expense, Icon = "bolt", ColorHex = "#7C3AED", IsDefault = true },
            new Category { UserId = userId, Name = "Shopping", Type = CategoryType.Expense, Icon = "bag", ColorHex = "#DC2626", IsDefault = true }
        };

        db.Categories.AddRange(items);
        await db.SaveChangesAsync(cancellationToken);
    }

    private static Guid ReadUserIdFromToken(string accessToken)
    {
        try
        {
            var token = new JwtSecurityTokenHandler().ReadJwtToken(accessToken);
            var value = token.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(value, out var parsed) ? parsed : Guid.Empty;
        }
        catch
        {
            return Guid.Empty;
        }
    }

    private static void ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            throw new AppValidationException("Password must be at least 8 characters.");

        if (!Regex.IsMatch(password, "[A-Z]") || !Regex.IsMatch(password, "[a-z]") || !Regex.IsMatch(password, "[0-9]"))
            throw new AppValidationException("Password must contain uppercase, lowercase and number.");
    }
}
