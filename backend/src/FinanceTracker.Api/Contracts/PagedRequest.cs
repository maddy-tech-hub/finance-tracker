namespace FinanceTracker.Api.Contracts;

public sealed record PagedRequest(DateTime? From, DateTime? To, string? Search, Guid? AccountId, Guid? CategoryId);
