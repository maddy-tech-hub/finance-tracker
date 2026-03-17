using FinanceTracker.Application.Common;
using FinanceTracker.Application.DTOs.Categories;
using FinanceTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/categories")]
public sealed class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CategoryResponse>>>> Get(CancellationToken cancellationToken) =>
        Ok(ApiResponse<IReadOnlyList<CategoryResponse>>.Ok(await categoryService.GetAllAsync(cancellationToken)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryResponse>>> Create([FromBody] CategoryRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<CategoryResponse>.Ok(await categoryService.CreateAsync(request, cancellationToken), "Created"));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryResponse>>> Update(Guid id, [FromBody] CategoryRequest request, CancellationToken cancellationToken) =>
        Ok(ApiResponse<CategoryResponse>.Ok(await categoryService.UpdateAsync(id, request, cancellationToken), "Updated"));

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        await categoryService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Deleted"));
    }
}
