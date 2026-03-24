namespace FinanceTracker.Application.DTOs.Insights;

public sealed record HealthScoreFactor(string Key, string Label, decimal Score, decimal MaxScore, string Status, string Detail);
public sealed record HealthScoreResponse(
    decimal TotalScore,
    decimal MaxScore,
    IReadOnlyList<HealthScoreFactor> Factors,
    IReadOnlyList<string> Suggestions,
    DateTime GeneratedAtUtc,
    bool IsProvisional = false,
    string? ProvisionalReason = null,
    int DataPointsUsed = 0);

public sealed record InsightMessage(string Title, string Message, string Tone);
public sealed record InsightSummaryResponse(IReadOnlyList<InsightMessage> Messages);
