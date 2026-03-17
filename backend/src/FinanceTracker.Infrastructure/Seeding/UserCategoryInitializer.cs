using FinanceTracker.Domain.Entities;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Seeding;

public sealed class UserCategoryInitializer(FinanceTrackerDbContext db) : IUserCategoryInitializer
{
    public async Task<int> EnsureDefaultCategoriesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var existing = await db.Categories
            .Where(x => x.UserId == userId)
            .Select(x => new { x.Name, x.Type })
            .ToListAsync(cancellationToken);

        var existingSet = existing
            .Select(x => $"{(int)x.Type}:{x.Name}".ToLowerInvariant())
            .ToHashSet();

        var itemsToAdd = DefaultCategoryCatalog.Items
            .Where(x => !existingSet.Contains($"{(int)x.Type}:{x.Name}".ToLowerInvariant()))
            .Select(x => new Category
            {
                UserId = userId,
                Name = x.Name,
                Type = x.Type,
                ColorHex = x.ColorHex,
                Icon = x.Icon,
                IsDefault = true
            })
            .ToList();

        if (itemsToAdd.Count == 0)
        {
            return 0;
        }

        db.Categories.AddRange(itemsToAdd);
        await db.SaveChangesAsync(cancellationToken);
        return itemsToAdd.Count;
    }
}

