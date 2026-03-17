using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Goals;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/goals")]
public sealed class GoalsController(IGoalService goalService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<GoalResponse>>>> Get(CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<GoalResponse>>.Ok(await goalService.GetAllAsync(cancellationToken)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<GoalResponse>>> Create([FromBody] GoalRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<GoalResponse>.Ok(await goalService.CreateAsync(request, cancellationToken), "Created"));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<GoalResponse>>> Update(Guid id, [FromBody] GoalRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<GoalResponse>.Ok(await goalService.UpdateAsync(id, request, cancellationToken), "Updated"));

    [HttpPost("{id:guid}/contribute")]
    public async Task<ActionResult<ApiResponse<GoalResponse>>> Contribute(Guid id, [FromBody] GoalActionRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<GoalResponse>.Ok(await goalService.ContributeAsync(id, request.Amount, cancellationToken), "Contribution successful"));

    [HttpPost("{id:guid}/withdraw")]
    public async Task<ActionResult<ApiResponse<GoalResponse>>> Withdraw(Guid id, [FromBody] GoalActionRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<GoalResponse>.Ok(await goalService.WithdrawAsync(id, request.Amount, cancellationToken), "Withdrawal successful"));
}
