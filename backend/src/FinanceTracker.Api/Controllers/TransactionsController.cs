using FinanceTracker.Api.Contracts;
using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Transactions;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/transactions")]
public sealed class TransactionsController(ITransactionService transactionService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TransactionResponse>>>> Get([FromQuery] PagedRequest query, CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<TransactionResponse>>.Ok(await transactionService.GetAllAsync(query.From, query.To, query.Search, query.AccountId, query.CategoryId, cancellationToken)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TransactionResponse>>> Create([FromBody] TransactionRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<TransactionResponse>.Ok(await transactionService.CreateAsync(request, cancellationToken), "Created"));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TransactionResponse>>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(ApiResponse<TransactionResponse>.Ok(await transactionService.GetByIdAsync(id, cancellationToken)));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TransactionResponse>>> Update(Guid id, [FromBody] TransactionRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<TransactionResponse>.Ok(await transactionService.UpdateAsync(id, request, cancellationToken), "Updated"));

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        await transactionService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Deleted"));
    }
}
