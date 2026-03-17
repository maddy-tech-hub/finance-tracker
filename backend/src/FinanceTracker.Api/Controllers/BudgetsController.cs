using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Budgets;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/budgets")]
public sealed class BudgetsController(IBudgetService budgetService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BudgetResponse>>>> Get([FromQuery] int month, [FromQuery] int year, CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<BudgetResponse>>.Ok(await budgetService.GetByMonthAsync(month, year, cancellationToken)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<BudgetResponse>>> Create([FromBody] BudgetRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<BudgetResponse>.Ok(await budgetService.CreateAsync(request, cancellationToken), "Created"));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<BudgetResponse>>> Update(Guid id, [FromBody] BudgetRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<BudgetResponse>.Ok(await budgetService.UpdateAsync(id, request, cancellationToken), "Updated"));

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        await budgetService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Deleted"));
    }
}
