using System.Net;
using FinanceTracker.Application.Common;

namespace FinanceTracker.Api.Middleware;

public sealed class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            context.Response.ContentType = "application/json";

            var (status, message) = ex switch
            {
                AppValidationException => (HttpStatusCode.BadRequest, ex.Message),
                NotFoundException => (HttpStatusCode.NotFound, ex.Message),
                ForbiddenException => (HttpStatusCode.Unauthorized, ex.Message),
                _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
            };

            context.Response.StatusCode = (int)status;
            await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(message));
        }
    }
}
