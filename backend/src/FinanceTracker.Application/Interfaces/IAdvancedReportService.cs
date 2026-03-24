using FinanceTracker.Application.DTOs.Reports;

namespace FinanceTracker.Application.Interfaces;

public interface IAdvancedReportService
{
    Task<TrendsResponse> GetTrendsAsync(DateTime from, DateTime to, Guid? accountId, Guid? categoryId, CancellationToken cancellationToken);
    Task<NetWorthResponse> GetNetWorthAsync(DateTime from, DateTime to, CancellationToken cancellationToken);
}
