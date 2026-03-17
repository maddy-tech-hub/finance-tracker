using FluentAssertions;
using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Categories;
using FinanceTracker.Application.DTOs.Goals;
using FinanceTracker.Application.DTOs.Recurring;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Domain.Enums;
using FinanceTracker.Infrastructure.Persistence;
using FinanceTracker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FinanceTracker.UnitTests;

public class ServiceValidationTests
{
    [Fact]
    public async Task GoalCreate_ShouldReject_NonPositiveTargetAmount()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();
        var service = new GoalService(db, new StubCurrentUserService(userId));

        Func<Task> act = () => service.CreateAsync(
            new GoalRequest("Emergency", 0m, 0m, null, null),
            CancellationToken.None);

        await act.Should().ThrowAsync<AppValidationException>()
            .WithMessage("Target amount must be greater than zero.");
    }

    [Fact]
    public async Task RecurringCreate_ShouldReject_MissingCategory_ForExpense()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();
        var service = new RecurringService(db, new StubCurrentUserService(userId));

        var request = new RecurringRequest(
            Guid.NewGuid(),
            null,
            null,
            TransactionType.Expense,
            RecurrenceFrequency.Monthly,
            1200m,
            DateTime.UtcNow.Date,
            DateTime.UtcNow.Date,
            null,
            "Rent",
            false);

        Func<Task> act = () => service.CreateAsync(request, CancellationToken.None);

        await act.Should().ThrowAsync<AppValidationException>()
            .WithMessage("Category required for non-transfer recurring item.");
    }

    [Fact]
    public async Task RecurringCreate_ShouldReject_WhenNextRunBeforeStartDate()
    {
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();
        var service = new RecurringService(db, new StubCurrentUserService(userId));

        var startDate = DateTime.UtcNow.Date;
        var request = new RecurringRequest(
            Guid.NewGuid(),
            null,
            Guid.NewGuid(),
            TransactionType.Expense,
            RecurrenceFrequency.Monthly,
            1200m,
            startDate,
            startDate.AddDays(-1),
            null,
            "Rent",
            false);

        Func<Task> act = () => service.CreateAsync(request, CancellationToken.None);

        await act.Should().ThrowAsync<AppValidationException>()
            .WithMessage("Next run date cannot be before start date.");
    }

    [Fact]
    public async Task CategoryList_ShouldReturnOnlyCurrentUserCategories()
    {
        var userId = Guid.NewGuid();
        var anotherUserId = Guid.NewGuid();

        await using var db = CreateDbContext();
        db.Categories.AddRange(
            new Category
            {
                UserId = userId,
                Name = "Salary",
                Type = CategoryType.Income,
                ColorHex = "#00AA00",
                Icon = "wallet"
            },
            new Category
            {
                UserId = anotherUserId,
                Name = "Other",
                Type = CategoryType.Expense,
                ColorHex = "#FF0000",
                Icon = "tag"
            });
        await db.SaveChangesAsync();

        var service = new CategoryService(db, new StubCurrentUserService(userId));
        var result = await service.GetAllAsync(CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Should().BeEquivalentTo(new CategoryResponse(result[0].Id, "Salary", CategoryType.Income, "#00AA00", "wallet", false));
    }

    private static FinanceTrackerDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<FinanceTrackerDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new FinanceTrackerDbContext(options);
    }

    private sealed class StubCurrentUserService(Guid userId) : ICurrentUserService
    {
        public Guid UserId { get; } = userId;
    }
}
