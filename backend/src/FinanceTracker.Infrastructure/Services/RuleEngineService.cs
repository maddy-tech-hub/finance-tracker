using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class RuleEngineService(FinanceTrackerDbContext db) : IRuleEngineService
{
    public async Task ApplyOnTransactionCreateAsync(Transaction transaction, CancellationToken cancellationToken)
    {
        var rules = await db.Rules
            .Where(x => x.UserId == transaction.UserId && x.IsActive)
            .OrderBy(x => x.Priority)
            .ToListAsync(cancellationToken);

        if (rules.Count == 0)
            return;

        var categoryChanged = false;
        foreach (var rule in rules)
        {
            if (!Matches(transaction, rule))
                continue;

            switch (rule.ActionType)
            {
                case RuleActionType.SetCategory:
                    if (categoryChanged || transaction.Type == TransactionType.Transfer || string.IsNullOrWhiteSpace(rule.ActionValue))
                        break;

                    if (Guid.TryParse(rule.ActionValue, out var categoryId))
                    {
                        var category = await db.Categories.FirstOrDefaultAsync(
                            x => x.Id == categoryId && x.UserId == transaction.UserId,
                            cancellationToken);

                        if (category is not null)
                        {
                            transaction.CategoryId = category.Id;
                            categoryChanged = true;
                        }
                    }
                    break;

                case RuleActionType.CreateAlert:
                    db.TransactionAlerts.Add(new TransactionAlert
                    {
                        UserId = transaction.UserId,
                        TransactionId = transaction.Id,
                        Message = rule.ActionValue ?? "Rule alert",
                        Severity = transaction.Amount >= 5000 ? AlertSeverity.Critical : AlertSeverity.Warning
                    });
                    break;

                case RuleActionType.AddTag:
                    if (!string.IsNullOrWhiteSpace(rule.ActionValue))
                    {
                        var tag = rule.ActionValue.Trim().ToLowerInvariant();
                        var exists = await db.TransactionTags.AnyAsync(
                            x => x.TransactionId == transaction.Id && x.Tag == tag,
                            cancellationToken);
                        if (!exists)
                        {
                            db.TransactionTags.Add(new TransactionTag
                            {
                                UserId = transaction.UserId,
                                TransactionId = transaction.Id,
                                Tag = tag
                            });
                        }
                    }
                    break;
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static bool Matches(Transaction tx, RuleDefinition rule)
    {
        return rule.ConditionType switch
        {
            RuleConditionType.MerchantContains =>
                !string.IsNullOrWhiteSpace(rule.ConditionValue) &&
                (tx.Note ?? string.Empty).Contains(rule.ConditionValue, StringComparison.OrdinalIgnoreCase),

            RuleConditionType.AmountGreaterThan =>
                rule.AmountThreshold.HasValue && tx.Amount > rule.AmountThreshold.Value,

            RuleConditionType.CategoryEquals =>
                tx.CategoryId.HasValue &&
                Guid.TryParse(rule.ConditionValue, out var parsedCategoryId) &&
                tx.CategoryId.Value == parsedCategoryId,

            _ => false
        };
    }
}
