using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Rules;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class RuleService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : IRuleService
{
    public async Task<IReadOnlyList<RuleResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var rows = await db.Rules
            .AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId)
            .OrderBy(x => x.Priority)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return rows.Select(Map).ToList();
    }

    public async Task<RuleResponse> CreateAsync(RuleRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var entity = new RuleDefinition
        {
            UserId = currentUser.UserId,
            Name = request.Name.Trim(),
            IsActive = request.IsActive,
            Priority = request.Priority,
            ConditionType = request.ConditionType,
            ConditionValue = request.ConditionValue?.Trim(),
            AmountThreshold = request.AmountThreshold,
            ActionType = request.ActionType,
            ActionValue = request.ActionValue?.Trim()
        };

        db.Rules.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<RuleResponse> UpdateAsync(Guid id, RuleRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var entity = await db.Rules.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Rule not found.");

        entity.Name = request.Name.Trim();
        entity.IsActive = request.IsActive;
        entity.Priority = request.Priority;
        entity.ConditionType = request.ConditionType;
        entity.ConditionValue = request.ConditionValue?.Trim();
        entity.AmountThreshold = request.AmountThreshold;
        entity.ActionType = request.ActionType;
        entity.ActionValue = request.ActionValue?.Trim();

        await db.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await db.Rules.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Rule not found.");

        db.Rules.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
    }

    private static RuleResponse Map(RuleDefinition x) =>
        new(x.Id, x.Name, x.IsActive, x.Priority, x.ConditionType, x.ConditionValue, x.AmountThreshold, x.ActionType, x.ActionValue, x.UpdatedAtUtc);

    private static void Validate(RuleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new AppValidationException("Rule name is required.");
        if (request.Priority < 1 || request.Priority > 1000)
            throw new AppValidationException("Priority must be between 1 and 1000.");
        if (request.ConditionType == RuleConditionType.AmountGreaterThan && (!request.AmountThreshold.HasValue || request.AmountThreshold <= 0))
            throw new AppValidationException("Amount threshold must be greater than zero.");
        if ((request.ConditionType == RuleConditionType.MerchantContains || request.ConditionType == RuleConditionType.CategoryEquals) && string.IsNullOrWhiteSpace(request.ConditionValue))
            throw new AppValidationException("Condition value is required for the selected condition.");
        if ((request.ActionType == RuleActionType.SetCategory || request.ActionType == RuleActionType.AddTag || request.ActionType == RuleActionType.CreateAlert) && string.IsNullOrWhiteSpace(request.ActionValue))
            throw new AppValidationException("Action value is required for the selected action.");
    }
}
