using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Goals;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class GoalService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IGoalService
{
    public async Task<IReadOnlyList<GoalResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await db.Goals
            .Where(x => x.UserId == currentUser.UserId)
            .OrderBy(x => x.TargetDate)
            .Select(x => new GoalResponse(x.Id, x.Name, x.TargetAmount, x.CurrentAmount, x.TargetDate, x.LinkedAccountId, x.TargetAmount == 0 ? 0 : Math.Round((x.CurrentAmount / x.TargetAmount) * 100, 2)))
            .ToListAsync(cancellationToken);
    }

    public async Task<GoalResponse> CreateAsync(GoalRequest request, CancellationToken cancellationToken)
    {
        ValidateGoal(request);
        var goal = new SavingsGoal
        {
            UserId = currentUser.UserId,
            Name = request.Name.Trim(),
            TargetAmount = request.TargetAmount,
            CurrentAmount = request.CurrentAmount,
            LinkedAccountId = request.LinkedAccountId,
            TargetDate = request.TargetDate
        };

        db.Goals.Add(goal);
        await db.SaveChangesAsync(cancellationToken);
        return Map(goal);
    }

    public async Task<GoalResponse> UpdateAsync(Guid id, GoalRequest request, CancellationToken cancellationToken)
    {
        ValidateGoal(request);
        var goal = await db.Goals.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Goal not found.");

        goal.Name = request.Name.Trim();
        goal.TargetAmount = request.TargetAmount;
        goal.CurrentAmount = request.CurrentAmount;
        goal.TargetDate = request.TargetDate;
        goal.LinkedAccountId = request.LinkedAccountId;

        await db.SaveChangesAsync(cancellationToken);
        return Map(goal);
    }

    public async Task<GoalResponse> ContributeAsync(Guid id, decimal amount, CancellationToken cancellationToken)
    {
        if (amount <= 0) throw new AppValidationException("Contribution must be positive.");
        await using var trx = await db.Database.BeginTransactionAsync(cancellationToken);

        var goal = await db.Goals.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Goal not found.");

        if (goal.LinkedAccountId.HasValue)
        {
            var account = await db.Accounts.FirstOrDefaultAsync(x => x.Id == goal.LinkedAccountId.Value && x.UserId == currentUser.UserId, cancellationToken)
                ?? throw new AppValidationException("Linked account missing.");
            if (account.Balance < amount) throw new AppValidationException("Contribution exceeds linked account balance.");
            account.Balance -= amount;
        }

        goal.CurrentAmount += amount;
        await db.SaveChangesAsync(cancellationToken);
        await trx.CommitAsync(cancellationToken);
        return Map(goal);
    }

    public async Task<GoalResponse> WithdrawAsync(Guid id, decimal amount, CancellationToken cancellationToken)
    {
        if (amount <= 0) throw new AppValidationException("Withdrawal must be positive.");
        await using var trx = await db.Database.BeginTransactionAsync(cancellationToken);

        var goal = await db.Goals.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Goal not found.");

        if (goal.CurrentAmount < amount) throw new AppValidationException("Insufficient goal balance.");
        goal.CurrentAmount -= amount;

        if (goal.LinkedAccountId.HasValue)
        {
            var account = await db.Accounts.FirstOrDefaultAsync(x => x.Id == goal.LinkedAccountId.Value && x.UserId == currentUser.UserId, cancellationToken)
                ?? throw new AppValidationException("Linked account missing.");
            account.Balance += amount;
        }

        await db.SaveChangesAsync(cancellationToken);
        await trx.CommitAsync(cancellationToken);
        return Map(goal);
    }

    private static GoalResponse Map(SavingsGoal x)
    {
        var pct = x.TargetAmount == 0 ? 0 : Math.Round((x.CurrentAmount / x.TargetAmount) * 100, 2);
        return new GoalResponse(x.Id, x.Name, x.TargetAmount, x.CurrentAmount, x.TargetDate, x.LinkedAccountId, pct);
    }

    private static void ValidateGoal(GoalRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) throw new AppValidationException("Goal name is required.");
        if (request.TargetAmount <= 0) throw new AppValidationException("Target amount must be greater than zero.");
        if (request.CurrentAmount < 0) throw new AppValidationException("Current amount cannot be negative.");
    }
}
