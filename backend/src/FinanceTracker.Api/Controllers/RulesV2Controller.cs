using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Rules;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v2/rules")]
public sealed class RulesV2Controller(IRuleService ruleService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<RuleResponse>>>> Get(CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<RuleResponse>>.Ok(await ruleService.GetAllAsync(cancellationToken)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RuleResponse>>> Create([FromBody] RuleRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<RuleResponse>.Ok(await ruleService.CreateAsync(request, cancellationToken), "Created"));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RuleResponse>>> Update(Guid id, [FromBody] RuleRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<RuleResponse>.Ok(await ruleService.UpdateAsync(id, request, cancellationToken), "Updated"));

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        await ruleService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Deleted"));
    }
}
