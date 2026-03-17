using FinanceTracker.Domain.Enums;

namespace FinanceTracker.Application.DTOs.Categories;

public sealed record CategoryRequest(string Name, CategoryType Type, string ColorHex, string Icon);
public sealed record CategoryResponse(Guid Id, string Name, CategoryType Type, string ColorHex, string Icon, bool IsDefault);
