using FinanceTracker.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;


namespace FinanceTracker.Infrastructure.HostedServices;

public sealed class RecurringTransactionHostedService(IServiceScopeFactory scopeFactory, ILogger<RecurringTransactionHostedService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var recurringService = scope.ServiceProvider.GetRequiredService<IRecurringService>();
                await recurringService.ProcessDueTransactionsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Recurring transaction processing failed");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
