using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Application.DTOs.Transactions;

public sealed record TransactionRequest(
    Guid AccountId,
    Guid? DestinationAccountId,
    Guid? CategoryId,
    TransactionType Type,
    decimal Amount,
    DateTime TransactionDate,
    string? Note);

public sealed record TransactionResponse(
    Guid Id,
    Guid AccountId,
    Guid? DestinationAccountId,
    Guid? CategoryId,
    TransactionType Type,
    decimal Amount,
    DateTime TransactionDate,
    string? Note);
