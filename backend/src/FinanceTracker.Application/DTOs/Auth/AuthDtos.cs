namespace FinanceTracker.Application.DTOs.Auth;

public sealed record RegisterRequest(string Email, string Password, string FirstName, string LastName);
public sealed record LoginRequest(string Email, string Password);
public sealed record RefreshTokenRequest(string AccessToken, string RefreshToken);
public sealed record ForgotPasswordRequest(string Email);
public sealed record ResetPasswordRequest(string Token, string NewPassword);
public sealed record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAtUtc, Guid UserId, string Email, string FullName);
public sealed record RefreshTokenResult(Guid UserId, string Email, string AccessToken, string NewRefreshToken, DateTime ExpiresAtUtc);
