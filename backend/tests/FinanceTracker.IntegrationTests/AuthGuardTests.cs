using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace FinanceTracker.IntegrationTests;

public class AuthGuardTests : IClassFixture<AuthGuardWebApplicationFactory>
{
    private readonly AuthGuardWebApplicationFactory _factory;

    public AuthGuardTests(AuthGuardWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Dashboard_RequiresAuthentication()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/dashboard/summary");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}

public sealed class AuthGuardWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseContentRoot(ResolveApiContentRoot());

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["RunMigrationsOnStartup"] = "false",
                ["ConnectionStrings:Postgres"] = "Host=localhost;Port=5432;Database=fake;Username=fake;Password=fake",
                ["Jwt:Issuer"] = "FinanceTracker.Api",
                ["Jwt:Audience"] = "FinanceTracker.Frontend",
                ["Jwt:Key"] = "ThisIsALongEnoughTestKeyForJwt1234567890"
            });
        });
    }

    private static string ResolveApiContentRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);

        while (dir is not null)
        {
            var candidate = Path.Combine(dir.FullName, "backend", "src", "FinanceTracker.Api");
            if (Directory.Exists(candidate))
            {
                return candidate;
            }

            var altCandidate = Path.Combine(dir.FullName, "src", "FinanceTracker.Api");
            if (Directory.Exists(altCandidate))
            {
                return altCandidate;
            }

            dir = dir.Parent;
        }

        throw new DirectoryNotFoundException("Unable to locate backend/src/FinanceTracker.Api for integration test content root.");
    }
}
