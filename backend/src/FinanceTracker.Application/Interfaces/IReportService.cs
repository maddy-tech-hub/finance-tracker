using FinanceTracker.Application.DTOs.Reports;

namespace FinanceTracker.Application.Interfaces;

public interface IReportService
{
    Task<IReadOnlyList<CategorySpendReportItem>> CategorySpendAsync(DateTime from, DateTime to, CancellationToken cancellationToken);
    Task<IReadOnlyList<IncomeVsExpenseReportItem>> IncomeVsExpenseAsync(DateTime from, DateTime to, CancellationToken cancellationToken);
    Task<IReadOnlyList<AccountBalanceTrendItem>> AccountBalanceTrendAsync(DateTime from, DateTime to, CancellationToken cancellationToken);
    Task<IReadOnlyList<SavingsProgressItem>> SavingsProgressAsync(CancellationToken cancellationToken);
    Task<string> ExportCsvAsync(DateTime from, DateTime to, CancellationToken cancellationToken);
}
