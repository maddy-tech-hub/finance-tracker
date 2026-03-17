using FinanceTracker.Application.Common;
using FluentAssertions;

namespace FinanceTracker.UnitTests;

public class ApiResponseTests
{
    [Fact]
    public void Ok_ShouldCreateSuccessResponse()
    {
        var response = ApiResponse<int>.Ok(42, "done");

        response.Success.Should().BeTrue();
        response.Data.Should().Be(42);
        response.Message.Should().Be("done");
    }

    [Fact]
    public void Fail_ShouldCreateFailureResponse()
    {
        var response = ApiResponse<string>.Fail("error");

        response.Success.Should().BeFalse();
        response.Message.Should().Be("error");
    }
}
