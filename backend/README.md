# Backend (ASP.NET Core Web API)

## Overview
FinanceTracker backend provides auth, accounts, categories, transactions, budgets, goals, recurring processing, reports, and dashboard endpoints.

## Runtime Configuration
Configuration is environment-driven and can come from:
1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. Environment variables (recommended for production)

Key environment variables:
- `ConnectionStrings__Postgres`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__Key`
- `Jwt__AccessTokenMinutes`
- `Jwt__RefreshTokenDays`
- `Cors__AllowedOrigins__0`, `Cors__AllowedOrigins__1`
- `ASPNETCORE_ENVIRONMENT`
- `ASPNETCORE_URLS`

Use sample: `src/FinanceTracker.Api/.env.example`

## Migrations
- EF Core code-first migrations are source-controlled.
- Migrations are automatically applied on API startup (`Database.Migrate()`).
- Startup includes retry logic for database readiness (useful in container environments).

## Local Run
```bash
dotnet restore FinanceTracker.slnx --configfile ../NuGet.Config
dotnet run --project src/FinanceTracker.Api/FinanceTracker.Api.csproj
```

Swagger (development):
- `https://localhost:7069/swagger`

## Container Run (Podman/Docker)
Build image from `backend/`:
```bash
podman build -t finance-tracker-backend .
```

Run with env vars:
```bash
podman run --rm -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__Postgres="Host=<db-host>;Port=5432;Database=finance_tracker;Username=postgres;Password=postgres" \
  -e Jwt__Key="<secure-32-plus-char-key>" \
  finance-tracker-backend
```
