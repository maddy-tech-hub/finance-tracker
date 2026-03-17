namespace FinanceTracker.Infrastructure.Seeding;

public interface IUserCategoryInitializer
{
    Task<int> EnsureDefaultCategoriesAsync(Guid userId, CancellationToken cancellationToken);
}

