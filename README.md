# Personal Finance Tracker

Production-friendly hackathon finance app built with:
- Backend: ASP.NET Core Web API (C#)
- Frontend: React + TypeScript + Vite
- Database: PostgreSQL
- ORM: EF Core (code-first, startup auto-migrate)

## Highlights
- JWT auth + refresh token rotation
- Financially safe transaction handling (atomic transfer/balance updates)
- Budget monitoring and goal tracking
- Recurring transaction processor
- Reports and dashboard insights
- Local + containerized + Azure-ready configuration model

## Repository Structure
- `backend/` ASP.NET Core layered solution + tests + Dockerfile
- `frontend/` React app + Dockerfile + Nginx config
- `compose.yml` Podman/Docker compose for full stack
- `docs/` architecture and deployment notes

## Prerequisites
- .NET SDK 10+
- Node.js 20+
- PostgreSQL 16+
- Podman (optional) or Docker (optional)

## Local Setup (No Containers)
From the new project root path:
`D:\\Repositories\\finance-tracker`

1. Configure backend settings in `backend/src/FinanceTracker.Api/appsettings.Development.json`.
2. Backend:
   ```bash
   dotnet restore backend/FinanceTracker.slnx --configfile NuGet.Config
   dotnet run --project backend/src/FinanceTracker.Api/FinanceTracker.Api.csproj
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open:
   - Frontend: `http://localhost:5173`
   - Backend Swagger: `https://localhost:7069/swagger`

## Environment Variables
Use examples:
- Root compose env: `.env.example`
- Backend env sample: `backend/src/FinanceTracker.Api/.env.example`
- Frontend env sample: `frontend/.env.example`

Important variables:
- `ConnectionStrings__Postgres`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__Key`
- `Cors__AllowedOrigins__*`
- `VITE_API_URL`

## EF Core Migrations
- Code-first migrations are included in source.
- API applies migrations automatically at startup.
- Startup includes retry logic to handle DB readiness in container environments.

## Podman / Compose Run (Optional)
1. Copy `.env.example` to `.env` (optional, defaults exist).
2. Run stack:
   ```bash
   podman compose -f compose.yml up --build
   ```
   (Docker equivalent works too: `docker compose -f compose.yml up --build`)
3. Open:
   - Frontend: `http://localhost:4173`
   - Backend: `http://localhost:8080`
   - PostgreSQL: `localhost:5432`

## Azure Readiness Notes
- Backend is environment-driven; App Service/Container Apps can inject all required vars.
- Frontend is static-build ready (Vite output served by Nginx or Static Web Apps path).
- PostgreSQL can be swapped to Azure Database for PostgreSQL via `ConnectionStrings__Postgres`.
- Container path is ready using `backend/Dockerfile`, `frontend/Dockerfile`, and `compose.yml`.
- Startup auto-migrations are enabled; for strict production governance, consider gated rollout process for migrations.

## Demo Steps (3-5 min)
1. Sign up and sign in.
2. Add accounts and transactions from quick-add flow.
3. Show dashboard hero metrics and recurring due indicator.
4. Add budgets and goals to demonstrate progress + alerts.
5. Show recurring schedule and report charts.

## Notes
- Architecture and stack intentionally unchanged.
- Containerization is optional; local non-container run remains fully supported.


## Setup Guide
For complete step-by-step setup and run instructions, see:
- docs/SETUP.md


