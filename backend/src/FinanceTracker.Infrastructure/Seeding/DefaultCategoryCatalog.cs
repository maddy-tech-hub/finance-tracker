using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Infrastructure.Seeding;

public static class DefaultCategoryCatalog
{
    public static readonly IReadOnlyList<DefaultCategoryDefinition> Items =
    [
        new("Food", CategoryType.Expense, "#F97316", "utensils"),
        new("Rent", CategoryType.Expense, "#DC2626", "home"),
        new("Utilities", CategoryType.Expense, "#3B82F6", "bolt"),
        new("Transport", CategoryType.Expense, "#0EA5E9", "car"),
        new("Entertainment", CategoryType.Expense, "#8B5CF6", "film"),
        new("Shopping", CategoryType.Expense, "#EC4899", "shopping-bag"),
        new("Health", CategoryType.Expense, "#EF4444", "heart"),
        new("Education", CategoryType.Expense, "#6366F1", "book-open"),
        new("Travel", CategoryType.Expense, "#14B8A6", "plane"),
        new("Subscriptions", CategoryType.Expense, "#7C3AED", "repeat"),
        new("Miscellaneous", CategoryType.Expense, "#64748B", "circle"),

        new("Salary", CategoryType.Income, "#16A34A", "briefcase"),
        new("Freelance", CategoryType.Income, "#059669", "laptop"),
        new("Bonus", CategoryType.Income, "#22C55E", "gift"),
        new("Investment", CategoryType.Income, "#0D9488", "trending-up"),
        new("Gift", CategoryType.Income, "#10B981", "package"),
        new("Refund", CategoryType.Income, "#2DD4BF", "rotate-ccw"),
        new("Other", CategoryType.Income, "#65A30D", "wallet")
    ];
}

public sealed record DefaultCategoryDefinition(string Name, CategoryType Type, string ColorHex, string Icon);

