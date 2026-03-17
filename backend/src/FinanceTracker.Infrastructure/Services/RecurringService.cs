using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Recurring;
using FinanceTracker.Application.DTOs.Transactions;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Infrastructure.Common;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class RecurringService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IRecurringService
{
    public async Task<IReadOnlyList<RecurringResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await db.RecurringTransactions
            .Where(x => x.UserId == currentUser.UserId)
            .OrderBy(x => x.NextRunDate)
            .Select(x => Map(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<RecurringResponse> CreateAsync(RecurringRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var startDateUtc = UtcDateTime.Normalize(request.StartDate);
        var nextRunDateUtc = UtcDateTime.Normalize(request.NextRunDate);
        var endDateUtc = UtcDateTime.Normalize(request.EndDate);

        var recurring = new RecurringTransaction
        {
            UserId = currentUser.UserId,
            AccountId = request.AccountId,
            DestinationAccountId = request.DestinationAccountId,
            CategoryId = request.CategoryId,
            Type = request.Type,
            Frequency = request.Frequency,
            Amount = request.Amount,
            StartDate = startDateUtc,
            NextRunDate = nextRunDateUtc,
            EndDate = endDateUtc,
            Note = request.Note,
            IsPaused = request.IsPaused
        };

        db.RecurringTransactions.Add(recurring);
        await db.SaveChangesAsync(cancellationToken);
        return Map(recurring);
    }

    public async Task<RecurringResponse> UpdateAsync(Guid id, RecurringRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var startDateUtc = UtcDateTime.Normalize(request.StartDate);
        var nextRunDateUtc = UtcDateTime.Normalize(request.NextRunDate);
        var endDateUtc = UtcDateTime.Normalize(request.EndDate);

        var recurring = await db.RecurringTransactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Recurring transaction not found.");

        recurring.AccountId = request.AccountId;
        recurring.DestinationAccountId = request.DestinationAccountId;
        recurring.CategoryId = request.CategoryId;
        recurring.Type = request.Type;
        recurring.Frequency = request.Frequency;
        recurring.Amount = request.Amount;
        recurring.StartDate = startDateUtc;
        recurring.NextRunDate = nextRunDateUtc;
        recurring.EndDate = endDateUtc;
        recurring.Note = request.Note;
        recurring.IsPaused = request.IsPaused;

        await db.SaveChangesAsync(cancellationToken);
        return Map(recurring);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var recurring = await db.RecurringTransactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Recurring transaction not found.");

        db.RecurringTransactions.Remove(recurring);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task ProcessDueTransactionsAsync(CancellationToken cancellationToken)
    {
        var due = await db.RecurringTransactions
            .Where(x => !x.IsPaused && x.NextRunDate <= DateTime.UtcNow && (!x.EndDate.HasValue || x.EndDate >= DateTime.UtcNow))
            .OrderBy(x => x.NextRunDate)
            .ToListAsync(cancellationToken);

        foreach (var item in due)
        {
            var scopeUser = new SystemUserContext(item.UserId);
            var txService = new TransactionService(db, scopeUser);

            var guard = 0;
            while (item.NextRunDate <= DateTime.UtcNow && guard < 60)
            {
                var scheduleDate = item.NextRunDate;
                var exists = await db.Transactions.AnyAsync(
                    t => t.RecurringTransactionId == item.Id && t.TransactionDate.Date == scheduleDate.Date,
                    cancellationToken);

                if (!exists)
                {
                    var created = await txService.CreateAsync(
                        new TransactionRequest(item.AccountId, item.DestinationAccountId, item.CategoryId, item.Type, item.Amount, scheduleDate, item.Note),
                        cancellationToken);

                    var createdTx = await db.Transactions.FirstAsync(
                        x => x.Id == created.Id && x.UserId == item.UserId,
                        cancellationToken);

                    createdTx.RecurringTransactionId = item.Id;
                    createdTx.IsRecurringGenerated = true;
                }

                item.NextRunDate = NextDate(scheduleDate, item.Frequency);
                guard++;
                if (item.EndDate.HasValue && item.NextRunDate > item.EndDate.Value)
                {
                    break;
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static DateTime NextDate(DateTime current, RecurrenceFrequency frequency) => frequency switch
    {
        RecurrenceFrequency.Daily => current.AddDays(1),
        RecurrenceFrequency.Weekly => current.AddDays(7),
        RecurrenceFrequency.Monthly => current.AddMonths(1),
        RecurrenceFrequency.Yearly => current.AddYears(1),
        _ => current.AddMonths(1)
    };

    private static void Validate(RecurringRequest request)
    {
        if (request.Amount <= 0) throw new AppValidationException("Amount must be greater than zero.");
        if (request.NextRunDate < request.StartDate) throw new AppValidationException("Next run date cannot be before start date.");
        if (request.EndDate.HasValue && request.EndDate.Value < request.StartDate) throw new AppValidationException("End date cannot be before start date.");

        if (request.Type == TransactionType.Transfer)
        {
            if (!request.DestinationAccountId.HasValue)
                throw new AppValidationException("Transfer recurring item needs destination account.");
            if (request.AccountId == request.DestinationAccountId.Value)
                throw new AppValidationException("Source and destination accounts must differ.");
        }
        else if (!request.CategoryId.HasValue)
        {
            throw new AppValidationException("Category required for non-transfer recurring item.");
        }
    }

    private static RecurringResponse Map(RecurringTransaction x) => new(x.Id, x.AccountId, x.DestinationAccountId, x.CategoryId, x.Type, x.Frequency, x.Amount, x.NextRunDate, x.IsPaused, x.Note);

    private sealed class SystemUserContext(Guid userId) : ICurrentUserService
    {
        public Guid UserId { get; } = userId;
    }
}
