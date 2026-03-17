# Backend (ASP.NET Core Web API)

## Overview
FinanceTracker backend exposes APIs for:
- Authentication (JWT + refresh tokens)
- Accounts
- Categories
- Transactions
- Budgets
- Goals
- Recurring transactions
- Dashboard and reporting

## Runtime Configuration
Configuration priority:
1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. Environment variables (recommended in production)

Environment profiles in this project:
- `src/FinanceTracker.Api/appsettings.json` (shared defaults)
- `src/FinanceTracker.Api/appsettings.Development.json`
- `src/FinanceTracker.Api/appsettings.Production.json` (template)

### Required environment variables (production)
- `ConnectionStrings__Postgres`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__Key`

### Optional environment variables
- `Jwt__AccessTokenMinutes`
- `Jwt__RefreshTokenDays`
- `Cors__AllowedOrigins__0`, `Cors__AllowedOrigins__1`
- `RunMigrationsOnStartup` (default `true`)
- `EnableSwagger` (default `false`)
- `UseHttpsRedirection` (default `false` in container scenarios)
- `ASPNETCORE_ENVIRONMENT`
- `ASPNETCORE_URLS`

## Migrations and Startup
- EF Core migrations are code-first and source-controlled.
- On startup, the API applies migrations automatically when `RunMigrationsOnStartup=true`.
- Startup has retry logic for DB readiness (helpful for Podman/Docker startup ordering).
- After migration, app continues normal startup flow.

## Default Category Seeding
- On successful user registration, default categories are created automatically (idempotent).
- Existing users are also backfilled on startup if defaults are missing.
- Default expense categories:
  - Food, Rent, Utilities, Transport, Entertainment, Shopping, Health, Education, Travel, Subscriptions, Miscellaneous
- Default income categories:
  - Salary, Freelance, Bonus, Investment, Gift, Refund, Other

## Local Run (No Containers)
From repository root:
```bash
dotnet restore backend/FinanceTracker.slnx --configfile NuGet.Config
dotnet run --project backend/src/FinanceTracker.Api/FinanceTracker.Api.csproj
```

Default local endpoints:
- API: `http://localhost:5213`
- Swagger (development): `http://localhost:5213/swagger`

## Podman/Docker Image Run
Build image from `backend/`:
```bash
podman build -t finance-tracker-backend .
```

Run with env vars:
```bash
podman run --rm -p 5213:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ASPNETCORE_URLS=http://+:8080 \
  -e RunMigrationsOnStartup=true \
  -e ConnectionStrings__Postgres="Host=<db-host>;Port=5432;Database=<db>;Username=<user>;Password=<pwd>" \
  -e Jwt__Issuer="FinanceTracker.Api" \
  -e Jwt__Audience="FinanceTracker.Frontend" \
  -e Jwt__Key="<secure-32-plus-char-key>" \
  finance-tracker-backend
```

## Azure Readiness Notes
- App is ready for Azure App Service or Azure Container Apps (env-driven config).
- Inject production settings via Azure App Settings / Container environment variables.
- Point `ConnectionStrings__Postgres` to Azure Database for PostgreSQL.
- Keep `RunMigrationsOnStartup=true` for simple deployments, or set it `false` and run migrations in a controlled release step.
- Keep `EnableSwagger=false` unless explicitly required for controlled environments.
