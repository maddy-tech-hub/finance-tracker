using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Application.DTOs.Accounts;

public sealed record AccountRequest(string Name, AccountType Type, string Currency, decimal Balance);
public sealed record AccountResponse(Guid Id, string Name, AccountType Type, string Currency, decimal Balance, bool IsArchived);
public sealed record AccountTransferRequest(Guid SourceAccountId, Guid DestinationAccountId, decimal Amount, DateTime TransferDate, string? Note);
