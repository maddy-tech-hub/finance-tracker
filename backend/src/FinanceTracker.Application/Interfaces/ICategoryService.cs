using FinanceTracker.Application.DTOs.Categories;

namespace FinanceTracker.Application.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<CategoryResponse> CreateAsync(CategoryRequest request, CancellationToken cancellationToken);
    Task<CategoryResponse> UpdateAsync(Guid id, CategoryRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
