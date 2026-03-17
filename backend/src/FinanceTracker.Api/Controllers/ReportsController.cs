using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Reports;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/reports")]
public sealed class ReportsController(IReportService reportService) : ControllerBase
{
    [HttpGet("category-spend")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CategorySpendReportItem>>>> CategorySpend([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<CategorySpendReportItem>>.Ok(await reportService.CategorySpendAsync(from, to, cancellationToken)));

    [HttpGet("income-vs-expense")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<IncomeVsExpenseReportItem>>>> IncomeVsExpense([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<IncomeVsExpenseReportItem>>.Ok(await reportService.IncomeVsExpenseAsync(from, to, cancellationToken)));

    [HttpGet("account-balance-trend")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AccountBalanceTrendItem>>>> AccountBalanceTrend([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<AccountBalanceTrendItem>>.Ok(await reportService.AccountBalanceTrendAsync(from, to, cancellationToken)));

    [HttpGet("savings-progress")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SavingsProgressItem>>>> SavingsProgress(CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<SavingsProgressItem>>.Ok(await reportService.SavingsProgressAsync(cancellationToken)));

    [HttpGet("export/csv")]
    public async Task<FileContentResult> ExportCsv([FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken cancellationToken)
    {
        var csv = await reportService.ExportCsvAsync(from, to, cancellationToken);
        return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", "finance-report.csv");
    }
}
