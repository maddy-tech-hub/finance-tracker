using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Recurring;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/recurring")]
public sealed class RecurringController(IRecurringService recurringService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<RecurringResponse>>>> Get(CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<RecurringResponse>>.Ok(await recurringService.GetAllAsync(cancellationToken)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RecurringResponse>>> Create([FromBody] RecurringRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<RecurringResponse>.Ok(await recurringService.CreateAsync(request, cancellationToken), "Created"));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RecurringResponse>>> Update(Guid id, [FromBody] RecurringRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<RecurringResponse>.Ok(await recurringService.UpdateAsync(id, request, cancellationToken), "Updated"));

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        await recurringService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Deleted"));
    }
}
