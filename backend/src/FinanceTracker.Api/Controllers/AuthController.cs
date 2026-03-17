using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Auth;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FinanceTracker.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(request, cancellationToken);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Registered"));
    }

    [EnableRateLimiting("login")]
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Logged in"));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Refresh([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.RefreshAsync(request, cancellationToken);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Refreshed"));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<object>>> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        await authService.ForgotPasswordAsync(request, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "If the email exists, a reset token is issued."));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await authService.ResetPasswordAsync(request, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Password reset successful"));
    }
}
