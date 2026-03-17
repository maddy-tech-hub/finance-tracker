FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["FinanceTracker.slnx", "./"]
COPY ["src/FinanceTracker.Api/FinanceTracker.Api.csproj", "src/FinanceTracker.Api/"]
COPY ["src/FinanceTracker.Application/FinanceTracker.Application.csproj", "src/FinanceTracker.Application/"]
COPY ["src/FinanceTracker.Domain/FinanceTracker.Domain.csproj", "src/FinanceTracker.Domain/"]
COPY ["src/FinanceTracker.Infrastructure/FinanceTracker.Infrastructure.csproj", "src/FinanceTracker.Infrastructure/"]
RUN dotnet restore "src/FinanceTracker.Api/FinanceTracker.Api.csproj"

COPY . .
RUN dotnet publish "src/FinanceTracker.Api/FinanceTracker.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV UseHttpsRedirection=false

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "FinanceTracker.Api.dll"]
