using FluentAssertions;
using FinanceTracker.Application.DTOs.Recurring;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using FinanceTracker.Infrastructure.Seeding;
using FinanceTracker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;

namespace FinanceTracker.UnitTests;

public class V2ServiceTests
{
    [Fact]
    public async Task HealthScore_ShouldReturnBoundedScore()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();

        db.Accounts.Add(new Account { UserId = userId, Name = "Main", Currency = "INR", Type = AccountType.Bank, Balance = 50000m });
        db.Transactions.AddRange(
            new Transaction { UserId = userId, AccountId = db.Accounts.Local.First().Id, Type = TransactionType.Income, Amount = 100000m, TransactionDate = DateTime.UtcNow.AddDays(-5) },
            new Transaction { UserId = userId, AccountId = db.Accounts.Local.First().Id, Type = TransactionType.Expense, Amount = 50000m, TransactionDate = DateTime.UtcNow.AddDays(-3) }
        );
        await db.SaveChangesAsync();

        var service = new HealthScoreService(db, new StubCurrentUserService(userId));
        var result = await service.GetHealthScoreAsync(CancellationToken.None);

        result.TotalScore.Should().BeGreaterThanOrEqualTo(0m);
        result.TotalScore.Should().BeLessThanOrEqualTo(100m);
        result.Factors.Should().NotBeEmpty();
    }

    [Fact]
    public async Task HealthScore_NewUser_ShouldReturnProvisionalSetupState()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();

        db.Accounts.Add(new Account { UserId = userId, Name = "Main", Currency = "INR", Type = AccountType.Bank, Balance = 0m });
        await db.SaveChangesAsync();

        var service = new HealthScoreService(db, new StubCurrentUserService(userId));
        var result = await service.GetHealthScoreAsync(CancellationToken.None);

        result.IsProvisional.Should().BeTrue();
        result.DataPointsUsed.Should().Be(0);
        result.TotalScore.Should().Be(0m);
        result.ProvisionalReason.Should().NotBeNullOrWhiteSpace();
        result.Factors.Should().OnlyContain(x => x.Score == 0m);
    }

    [Fact]
    public async Task Forecast_ShouldReturnDailyPoints()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();
        var account = new Account { UserId = userId, Name = "Main", Currency = "INR", Type = AccountType.Bank, Balance = 10000m };
        db.Accounts.Add(account);
        await db.SaveChangesAsync();

        var service = new ForecastService(db, new StubCurrentUserService(userId));
        var daily = await service.GetDailyForecastAsync(CancellationToken.None);
        var month = await service.GetMonthForecastAsync(CancellationToken.None);

        daily.Points.Should().NotBeEmpty();
        month.SafeToSpend.Should().BeGreaterThanOrEqualTo(0m);
    }

    [Fact]
    public async Task RuleEngine_ShouldApplyTagAndAlert()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();
        var account = new Account { UserId = userId, Name = "Main", Currency = "INR", Type = AccountType.Bank, Balance = 50000m };
        db.Accounts.Add(account);
        var category = new Category { UserId = userId, Name = "Transport", Type = CategoryType.Expense, ColorHex = "#000", Icon = "car" };
        db.Categories.Add(category);
        await db.SaveChangesAsync();

        db.Rules.AddRange(
            new RuleDefinition
            {
                UserId = userId,
                Name = "Uber -> Transport",
                IsActive = true,
                Priority = 1,
                ConditionType = RuleConditionType.MerchantContains,
                ConditionValue = "uber",
                ActionType = RuleActionType.SetCategory,
                ActionValue = category.Id.ToString()
            },
            new RuleDefinition
            {
                UserId = userId,
                Name = "High value alert",
                IsActive = true,
                Priority = 2,
                ConditionType = RuleConditionType.AmountGreaterThan,
                AmountThreshold = 5000m,
                ActionType = RuleActionType.CreateAlert,
                ActionValue = "High amount"
            },
            new RuleDefinition
            {
                UserId = userId,
                Name = "Tag food",
                IsActive = true,
                Priority = 3,
                ConditionType = RuleConditionType.MerchantContains,
                ConditionValue = "uber",
                ActionType = RuleActionType.AddTag,
                ActionValue = "monthly-food"
            }
        );
        await db.SaveChangesAsync();

        var tx = new Transaction
        {
            UserId = userId,
            AccountId = account.Id,
            Type = TransactionType.Expense,
            Amount = 7000m,
            TransactionDate = DateTime.UtcNow,
            Note = "Uber ride"
        };
        db.Transactions.Add(tx);
        await db.SaveChangesAsync();

        var engine = new RuleEngineService(db);
        await engine.ApplyOnTransactionCreateAsync(tx, CancellationToken.None);

        tx.CategoryId.Should().Be(category.Id);
        (await db.TransactionAlerts.CountAsync()).Should().Be(1);
        (await db.TransactionTags.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task AdvancedReports_ShouldReturnTrendsAndNetWorth()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();
        var account = new Account { UserId = userId, Name = "Main", Currency = "INR", Type = AccountType.Bank, Balance = 12000m };
        db.Accounts.Add(account);
        await db.SaveChangesAsync();

        db.Transactions.AddRange(
            new Transaction { UserId = userId, AccountId = account.Id, Type = TransactionType.Income, Amount = 20000m, TransactionDate = DateTime.UtcNow.AddDays(-20) },
            new Transaction { UserId = userId, AccountId = account.Id, Type = TransactionType.Expense, Amount = 8000m, TransactionDate = DateTime.UtcNow.AddDays(-15) }
        );
        await db.SaveChangesAsync();

        var service = new AdvancedReportService(db, new StubCurrentUserService(userId));
        var trends = await service.GetTrendsAsync(DateTime.UtcNow.AddMonths(-1), DateTime.UtcNow, null, null, CancellationToken.None);
        var netWorth = await service.GetNetWorthAsync(DateTime.UtcNow.AddDays(-20), DateTime.UtcNow, CancellationToken.None);

        trends.IncomeExpenseTrend.Should().NotBeEmpty();
        netWorth.Points.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Insights_NewUser_ShouldReturnNoMessages()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();

        db.Accounts.Add(new Account { UserId = userId, Name = "Main", Currency = "INR", Type = AccountType.Bank, Balance = 0m });
        await db.SaveChangesAsync();

        var service = new InsightService(db, new StubCurrentUserService(userId));
        var result = await service.GetInsightsAsync(CancellationToken.None);

        result.Messages.Should().BeEmpty();
    }

    [Fact]
    public async Task Insights_ComparableMonthsWithNoShift_ShouldReturnStableMessage()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();
        var account = new Account { UserId = userId, Name = "Main", Currency = "INR", Type = AccountType.Bank, Balance = 10000m };
        db.Accounts.Add(account);
        await db.SaveChangesAsync();

        var now = DateTime.UtcNow;
        var thisMonthDate = new DateTime(now.Year, now.Month, 10, 0, 0, 0, DateTimeKind.Utc);
        var prevMonthDate = thisMonthDate.AddMonths(-1);

        db.Transactions.AddRange(
            new Transaction { UserId = userId, AccountId = account.Id, Type = TransactionType.Income, Amount = 10000m, TransactionDate = prevMonthDate, Note = "Salary prev" },
            new Transaction { UserId = userId, AccountId = account.Id, Type = TransactionType.Expense, Amount = 4000m, TransactionDate = prevMonthDate.AddDays(1), Note = "Spend prev" },
            new Transaction { UserId = userId, AccountId = account.Id, Type = TransactionType.Income, Amount = 10000m, TransactionDate = thisMonthDate, Note = "Salary curr" },
            new Transaction { UserId = userId, AccountId = account.Id, Type = TransactionType.Expense, Amount = 4000m, TransactionDate = thisMonthDate.AddDays(1), Note = "Spend curr" }
        );
        await db.SaveChangesAsync();

        var service = new InsightService(db, new StubCurrentUserService(userId));
        var result = await service.GetInsightsAsync(CancellationToken.None);

        result.Messages.Should().ContainSingle();
        result.Messages[0].Title.Should().Be("No major shifts");
    }

    [Fact]
    public async Task AccountCreate_WithOpeningBalance_ShouldCreateOpeningBalanceTransaction()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();

        db.Categories.Add(new Category
        {
            UserId = userId,
            Name = "Other",
            Type = CategoryType.Income,
            IsDefault = true,
            ColorHex = "#16A34A",
            Icon = "wallet"
        });
        await db.SaveChangesAsync();

        var service = new AccountService(db, new StubCurrentUserService(userId), new StubUserCategoryInitializer(db));
        var created = await service.CreateAsync(new("Salary", AccountType.Bank, "INR", 5000m), CancellationToken.None);

        created.Balance.Should().Be(5000m);

        var tx = await db.Transactions.SingleAsync(x => x.UserId == userId);
        tx.AccountId.Should().Be(created.Id);
        tx.Type.Should().Be(TransactionType.Income);
        tx.Amount.Should().Be(5000m);
        tx.Note.Should().Be("Opening balance");
    }

    [Fact]
    public async Task AccountUpdate_WithBalanceDelta_ShouldCreateBalanceAdjustmentTransaction()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();

        db.Categories.AddRange(
            new Category
            {
                UserId = userId,
                Name = "Other",
                Type = CategoryType.Income,
                IsDefault = true,
                ColorHex = "#16A34A",
                Icon = "wallet"
            },
            new Category
            {
                UserId = userId,
                Name = "Miscellaneous",
                Type = CategoryType.Expense,
                IsDefault = true,
                ColorHex = "#64748B",
                Icon = "circle"
            });
        await db.SaveChangesAsync();

        var service = new AccountService(db, new StubCurrentUserService(userId), new StubUserCategoryInitializer(db));
        var created = await service.CreateAsync(new("Main", AccountType.Bank, "INR", 1000m), CancellationToken.None);

        await service.UpdateAsync(created.Id, new("Main", AccountType.Bank, "INR", 750m), CancellationToken.None);

        var account = await db.Accounts.SingleAsync(x => x.Id == created.Id);
        account.Balance.Should().Be(750m);

        var all = await db.Transactions.Where(x => x.UserId == userId).OrderBy(x => x.CreatedAtUtc).ToListAsync();
        all.Should().HaveCount(2);
        all.Last().Type.Should().Be(TransactionType.Expense);
        all.Last().Amount.Should().Be(250m);
        all.Last().Note.Should().Be("Balance adjustment");
    }

    [Fact]
    public async Task RecurringCreate_DueNow_ShouldGenerateTransactionImmediately()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();

        var account = new Account
        {
            UserId = userId,
            Name = "Main",
            Currency = "INR",
            Type = AccountType.Bank,
            Balance = 1000m
        };
        var category = new Category
        {
            UserId = userId,
            Name = "Rent",
            Type = CategoryType.Expense,
            IsDefault = true,
            ColorHex = "#64748B",
            Icon = "home"
        };
        db.Accounts.Add(account);
        db.Categories.Add(category);
        await db.SaveChangesAsync();

        var service = new RecurringService(db, new StubCurrentUserService(userId));
        var dueNow = DateTime.UtcNow.AddMinutes(-1);

        var created = await service.CreateAsync(
            new RecurringRequest(
                account.Id,
                null,
                category.Id,
                TransactionType.Expense,
                RecurrenceFrequency.Daily,
                100m,
                dueNow,
                dueNow,
                null,
                "Test recurring",
                false),
            CancellationToken.None);

        var generated = await db.Transactions
            .Where(x => x.UserId == userId && x.RecurringTransactionId == created.Id)
            .ToListAsync();

        generated.Should().HaveCount(1);
        generated[0].IsRecurringGenerated.Should().BeTrue();
        generated[0].Amount.Should().Be(100m);
    }

    [Fact]
    public async Task RecurringResume_DueNow_ShouldGenerateTransaction()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();

        var account = new Account
        {
            UserId = userId,
            Name = "Main",
            Currency = "INR",
            Type = AccountType.Bank,
            Balance = 1000m
        };
        var category = new Category
        {
            UserId = userId,
            Name = "Salary",
            Type = CategoryType.Income,
            IsDefault = true,
            ColorHex = "#16A34A",
            Icon = "wallet"
        };
        db.Accounts.Add(account);
        db.Categories.Add(category);
        await db.SaveChangesAsync();

        var service = new RecurringService(db, new StubCurrentUserService(userId));
        var dueNow = DateTime.UtcNow.AddMinutes(-1);

        var recurring = await service.CreateAsync(
            new RecurringRequest(
                account.Id,
                null,
                category.Id,
                TransactionType.Income,
                RecurrenceFrequency.Daily,
                200m,
                dueNow,
                dueNow,
                null,
                "Paused recurring",
                true),
            CancellationToken.None);

        var beforeResume = await db.Transactions.CountAsync(x => x.UserId == userId && x.RecurringTransactionId == recurring.Id);
        beforeResume.Should().Be(0);

        await service.UpdateAsync(
            recurring.Id,
            new RecurringRequest(
                account.Id,
                null,
                category.Id,
                TransactionType.Income,
                RecurrenceFrequency.Daily,
                200m,
                dueNow,
                dueNow,
                null,
                "Paused recurring",
                false),
            CancellationToken.None);

        var afterResume = await db.Transactions.CountAsync(x => x.UserId == userId && x.RecurringTransactionId == recurring.Id);
        afterResume.Should().Be(1);
    }

    private static FinanceTrackerDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<FinanceTrackerDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new FinanceTrackerDbContext(options);
    }

    private sealed class StubCurrentUserService(Guid userId) : ICurrentUserService
    {
        public Guid UserId { get; } = userId;
    }

    private sealed class StubUserCategoryInitializer(FinanceTrackerDbContext db) : IUserCategoryInitializer
    {
        public async Task<int> EnsureDefaultCategoriesAsync(Guid userId, CancellationToken cancellationToken)
        {
            var existing = await db.Categories.AnyAsync(x => x.UserId == userId, cancellationToken);
            if (existing)
            {
                return 0;
            }

            db.Categories.AddRange(
                new Category
                {
                    UserId = userId,
                    Name = "Other",
                    Type = CategoryType.Income,
                    IsDefault = true,
                    ColorHex = "#16A34A",
                    Icon = "wallet"
                },
                new Category
                {
                    UserId = userId,
                    Name = "Miscellaneous",
                    Type = CategoryType.Expense,
                    IsDefault = true,
                    ColorHex = "#64748B",
                    Icon = "circle"
                });

            await db.SaveChangesAsync(cancellationToken);
            return 2;
        }
    }
}
