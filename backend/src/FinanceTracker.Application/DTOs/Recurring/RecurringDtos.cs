using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Application.DTOs.Recurring;

public sealed record RecurringRequest(Guid AccountId, Guid? DestinationAccountId, Guid? CategoryId, TransactionType Type, RecurrenceFrequency Frequency, decimal Amount, DateTime StartDate, DateTime NextRunDate, DateTime? EndDate, string? Note, bool IsPaused);
public sealed record RecurringResponse(Guid Id, Guid AccountId, Guid? DestinationAccountId, Guid? CategoryId, TransactionType Type, RecurrenceFrequency Frequency, decimal Amount, DateTime NextRunDate, bool IsPaused, string? Note);
