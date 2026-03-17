using System.Security.Claims;
using FinanceTracker.Application.Interfaces;

namespace FinanceTracker.Api.Security;

public sealed class CurrentUserService(IHttpContextAccessor accessor) : ICurrentUserService
{
    public Guid UserId
    {
        get
        {
            var id = accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(id, out var parsed) ? parsed : Guid.Empty;
        }
    }
}
