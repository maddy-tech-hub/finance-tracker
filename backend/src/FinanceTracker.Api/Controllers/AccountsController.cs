using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Accounts;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/accounts")]
public sealed class AccountsController(IAccountService accountService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AccountResponse>>>> Get(CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<AccountResponse>>.Ok(await accountService.GetAllAsync(cancellationToken)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AccountResponse>>> Create([FromBody] AccountRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<AccountResponse>.Ok(await accountService.CreateAsync(request, cancellationToken), "Created"));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AccountResponse>>> Update(Guid id, [FromBody] AccountRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<AccountResponse>.Ok(await accountService.UpdateAsync(id, request, cancellationToken), "Updated"));

    [HttpPost("transfer")]
    public async Task<ActionResult<ApiResponse<object>>> Transfer([FromBody] AccountTransferRequest request, CancellationToken cancellationToken)
    {
        await accountService.TransferAsync(request, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Transfer completed"));
    }
}
