using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Accounts;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Infrastructure.Common;
using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.Infrastructure.Persistence;
using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Infrastructure.Services;

public sealed class AccountService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IAccountService
{
    public async Task<IReadOnlyList<AccountResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await db.Accounts
            .Where(x => x.UserId == currentUser.UserId)
            .OrderBy(x => x.Name)
            .Select(x => new AccountResponse(x.Id, x.Name, x.Type, x.Currency, x.Balance, x.IsArchived))
            .ToListAsync(cancellationToken);
    }

    public async Task<AccountResponse> CreateAsync(AccountRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var normalizedName = request.Name.Trim().ToLowerInvariant();
        var alreadyExists = await db.Accounts.AnyAsync(
            x => x.UserId == currentUser.UserId && x.Name.ToLower() == normalizedName,
            cancellationToken);
        if (alreadyExists)
            throw new AppValidationException("Account name already exists. Use a unique name.");

        var account = new Account
        {
            UserId = currentUser.UserId,
            Name = request.Name.Trim(),
            Type = request.Type,
            Currency = request.Currency.Trim().ToUpperInvariant(),
            Balance = request.Balance
        };

        db.Accounts.Add(account);
        await db.SaveChangesAsync(cancellationToken);
        return new AccountResponse(account.Id, account.Name, account.Type, account.Currency, account.Balance, account.IsArchived);
    }

    public async Task<AccountResponse> UpdateAsync(Guid id, AccountRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var account = await db.Accounts.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Account not found.");
        var normalizedName = request.Name.Trim().ToLowerInvariant();
        var duplicateName = await db.Accounts.AnyAsync(
            x => x.UserId == currentUser.UserId && x.Id != id && x.Name.ToLower() == normalizedName,
            cancellationToken);
        if (duplicateName)
            throw new AppValidationException("Account name already exists. Use a unique name.");

        account.Name = request.Name.Trim();
        account.Type = request.Type;
        account.Currency = request.Currency.Trim().ToUpperInvariant();
        account.Balance = request.Balance;

        await db.SaveChangesAsync(cancellationToken);
        return new AccountResponse(account.Id, account.Name, account.Type, account.Currency, account.Balance, account.IsArchived);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var account = await db.Accounts.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Account not found.");

        var usedInTransactions = await db.Transactions.AnyAsync(
            x => x.UserId == currentUser.UserId && (x.AccountId == id || x.DestinationAccountId == id),
            cancellationToken);
        if (usedInTransactions)
            throw new AppValidationException("Account has transaction history. Please move transactions before deleting.");

        var usedInRecurring = await db.RecurringTransactions.AnyAsync(
            x => x.UserId == currentUser.UserId && (x.AccountId == id || x.DestinationAccountId == id),
            cancellationToken);
        if (usedInRecurring)
            throw new AppValidationException("Account is used in recurring items. Delete or edit recurring entries first.");

        db.Accounts.Remove(account);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task TransferAsync(AccountTransferRequest request, CancellationToken cancellationToken)
    {
        if (request.Amount <= 0) throw new AppValidationException("Transfer amount must be greater than zero.");
        if (request.SourceAccountId == request.DestinationAccountId) throw new AppValidationException("Source and destination cannot be same.");

        await using var trx = await db.Database.BeginTransactionAsync(cancellationToken);
        var accounts = await db.Accounts
            .Where(a => a.UserId == currentUser.UserId && (a.Id == request.SourceAccountId || a.Id == request.DestinationAccountId))
            .ToListAsync(cancellationToken);

        var source = accounts.FirstOrDefault(a => a.Id == request.SourceAccountId) ?? throw new NotFoundException("Source account not found.");
        var destination = accounts.FirstOrDefault(a => a.Id == request.DestinationAccountId) ?? throw new NotFoundException("Destination account not found.");

        if (source.Balance < request.Amount) throw new AppValidationException("Insufficient source balance.");

        source.Balance -= request.Amount;
        destination.Balance += request.Amount;

        db.Transactions.Add(new Transaction
        {
            UserId = currentUser.UserId,
            AccountId = source.Id,
            DestinationAccountId = destination.Id,
            Amount = request.Amount,
            Type = TransactionType.Transfer,
            TransactionDate = UtcDateTime.Normalize(request.TransferDate),
            Note = request.Note
        });

        await db.SaveChangesAsync(cancellationToken);
        await trx.CommitAsync(cancellationToken);
    }

    private static void Validate(AccountRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) throw new AppValidationException("Account name is required.");
        if (string.IsNullOrWhiteSpace(request.Currency)) throw new AppValidationException("Currency is required.");
    }
}
