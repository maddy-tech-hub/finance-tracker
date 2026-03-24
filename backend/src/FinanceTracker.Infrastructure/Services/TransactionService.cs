using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Transactions;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Infrastructure.Common;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class TransactionService(FinanceTrackerDbContext db, ICurrentUserService currentUser, IRuleEngineService? ruleEngine = null) : ITransactionService
{
    public async Task<IReadOnlyList<TransactionResponse>> GetAllAsync(DateTime? from, DateTime? to, string? search, Guid? accountId, Guid? categoryId, CancellationToken cancellationToken)
    {
        from = UtcDateTime.Normalize(from);
        to = UtcDateTime.Normalize(to);

        var query = db.Transactions.AsNoTracking().Where(t => t.UserId == currentUser.UserId);
        if (from.HasValue) query = query.Where(x => x.TransactionDate.Date >= from.Value.Date);
        if (to.HasValue) query = query.Where(x => x.TransactionDate.Date <= to.Value.Date);
        if (accountId.HasValue) query = query.Where(x => x.AccountId == accountId.Value || x.DestinationAccountId == accountId.Value);
        if (categoryId.HasValue) query = query.Where(x => x.CategoryId == categoryId.Value);
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(x => x.Note != null && x.Note.ToLower().Contains(search.ToLower()));

        var items = await query.OrderByDescending(x => x.TransactionDate).ToListAsync(cancellationToken);
        return items.Select(Map).ToList();
    }

    public async Task<TransactionResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var tx = await db.Transactions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Transaction not found.");

        return Map(tx);
    }

    public async Task<TransactionResponse> CreateAsync(TransactionRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var transactionDateUtc = UtcDateTime.Normalize(request.TransactionDate);

        await using var trx = await db.Database.BeginTransactionAsync(cancellationToken);
        var entity = new Transaction
        {
            UserId = currentUser.UserId,
            AccountId = request.AccountId,
            DestinationAccountId = request.DestinationAccountId,
            CategoryId = request.CategoryId,
            Type = request.Type,
            Amount = request.Amount,
            Note = request.Note,
            TransactionDate = transactionDateUtc
        };

        await ApplyImpactAsync(entity, cancellationToken);
        db.Transactions.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        if (ruleEngine is not null)
        {
            await ruleEngine.ApplyOnTransactionCreateAsync(entity, cancellationToken);
        }

        await trx.CommitAsync(cancellationToken);

        return Map(entity);
    }

    public async Task<TransactionResponse> UpdateAsync(Guid id, TransactionRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var transactionDateUtc = UtcDateTime.Normalize(request.TransactionDate);

        await using var trx = await db.Database.BeginTransactionAsync(cancellationToken);

        var existing = await db.Transactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Transaction not found.");

        await ReverseImpactAsync(existing, cancellationToken);
        existing.AccountId = request.AccountId;
        existing.DestinationAccountId = request.DestinationAccountId;
        existing.CategoryId = request.CategoryId;
        existing.Type = request.Type;
        existing.Amount = request.Amount;
        existing.TransactionDate = transactionDateUtc;
        existing.Note = request.Note;
        await ApplyImpactAsync(existing, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        await trx.CommitAsync(cancellationToken);

        return Map(existing);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await using var trx = await db.Database.BeginTransactionAsync(cancellationToken);
        var existing = await db.Transactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Transaction not found.");

        await ReverseImpactAsync(existing, cancellationToken);
        db.Transactions.Remove(existing);
        await db.SaveChangesAsync(cancellationToken);
        await trx.CommitAsync(cancellationToken);
    }

    private async Task ApplyImpactAsync(Transaction tx, CancellationToken cancellationToken)
    {
        var src = await db.Accounts.FirstOrDefaultAsync(x => x.Id == tx.AccountId && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new AppValidationException("Account not found.");

        if (tx.Type == TransactionType.Transfer)
        {
            if (!tx.DestinationAccountId.HasValue) throw new AppValidationException("Transfer needs destination account.");
            var dest = await db.Accounts.FirstOrDefaultAsync(x => x.Id == tx.DestinationAccountId.Value && x.UserId == currentUser.UserId, cancellationToken)
                ?? throw new AppValidationException("Destination account not found.");
            if (src.Balance < tx.Amount) throw new AppValidationException("Insufficient balance.");
            src.Balance -= tx.Amount;
            dest.Balance += tx.Amount;
            return;
        }

        if (!tx.CategoryId.HasValue) throw new AppValidationException("Category required for non-transfer transactions.");
        if (tx.Type == TransactionType.Expense)
        {
            if (src.Balance < tx.Amount) throw new AppValidationException("Insufficient balance.");
            src.Balance -= tx.Amount;
        }
        else
        {
            src.Balance += tx.Amount;
        }
    }

    private async Task ReverseImpactAsync(Transaction tx, CancellationToken cancellationToken)
    {
        var src = await db.Accounts.FirstOrDefaultAsync(x => x.Id == tx.AccountId && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new AppValidationException("Account not found while reversing.");

        if (tx.Type == TransactionType.Transfer)
        {
            var dest = await db.Accounts.FirstOrDefaultAsync(x => x.Id == tx.DestinationAccountId && x.UserId == currentUser.UserId, cancellationToken)
                ?? throw new AppValidationException("Destination account not found while reversing.");
            src.Balance += tx.Amount;
            dest.Balance -= tx.Amount;
            return;
        }

        if (tx.Type == TransactionType.Expense) src.Balance += tx.Amount;
        else src.Balance -= tx.Amount;
    }

    private static void Validate(TransactionRequest request)
    {
        if (request.Amount <= 0) throw new AppValidationException("Amount must be greater than 0.");
        if (request.AccountId == Guid.Empty) throw new AppValidationException("Account is required.");
        if (request.Type == TransactionType.Transfer && request.AccountId == request.DestinationAccountId) throw new AppValidationException("Transfer accounts must differ.");
        if (request.Type != TransactionType.Transfer && !request.CategoryId.HasValue) throw new AppValidationException("Category is required.");
        if (request.Type == TransactionType.Transfer && !request.DestinationAccountId.HasValue) throw new AppValidationException("Destination account is required.");
    }

    private static TransactionResponse Map(Transaction x) => new(x.Id, x.AccountId, x.DestinationAccountId, x.CategoryId, x.Type, x.Amount, x.TransactionDate, x.Note);
}
