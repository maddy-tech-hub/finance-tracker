using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Categories;
using FinanceTracker.Application.Interfaces;
using FinanceTracker.Domain.Entities;
using FinanceTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Infrastructure.Services;

public sealed class CategoryService(FinanceTrackerDbContext db, ICurrentUserService currentUser) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await db.Categories
            .Where(x => x.UserId == currentUser.UserId)
            .OrderBy(x => x.Type)
            .ThenBy(x => x.Name)
            .Select(x => new CategoryResponse(x.Id, x.Name, x.Type, x.ColorHex, x.Icon, x.IsDefault))
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryResponse> CreateAsync(CategoryRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var exists = await db.Categories.AnyAsync(x => x.UserId == currentUser.UserId && x.Name == request.Name && x.Type == request.Type, cancellationToken);
        if (exists) throw new AppValidationException("Category already exists.");

        var category = new Category
        {
            UserId = currentUser.UserId,
            Name = request.Name.Trim(),
            Type = request.Type,
            ColorHex = request.ColorHex,
            Icon = request.Icon
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync(cancellationToken);
        return new CategoryResponse(category.Id, category.Name, category.Type, category.ColorHex, category.Icon, category.IsDefault);
    }

    public async Task<CategoryResponse> UpdateAsync(Guid id, CategoryRequest request, CancellationToken cancellationToken)
    {
        Validate(request);
        var category = await db.Categories.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Category not found.");

        category.Name = request.Name.Trim();
        category.Type = request.Type;
        category.ColorHex = request.ColorHex;
        category.Icon = request.Icon;

        await db.SaveChangesAsync(cancellationToken);
        return new CategoryResponse(category.Id, category.Name, category.Type, category.ColorHex, category.Icon, category.IsDefault);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var category = await db.Categories.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Category not found.");

        if (category.IsDefault) throw new AppValidationException("Default categories cannot be deleted.");
        db.Categories.Remove(category);
        await db.SaveChangesAsync(cancellationToken);
    }

    private static void Validate(CategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) throw new AppValidationException("Category name is required.");
    }
}
