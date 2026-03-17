# Personal Finance Tracker

Finance app for accounts, transactions, budgets, goals, recurring entries, and reports.

## Project Overview
Personal Finance Tracker helps users manage:
- accounts and balances
- transactions (income, expense, transfer)
- monthly budgets
- savings goals
- recurring payments/income
- dashboard metrics and reports

## Tech Stack
- Backend: ASP.NET Core Web API (C#)
- Frontend: React + TypeScript + Vite
- Database: PostgreSQL
- ORM: Entity Framework Core (code-first migrations)
- Auth: JWT + refresh tokens

## Repository Structure
- `backend/` API and tests
- `frontend/` React app
- `compose.yml` full-stack Podman/Docker setup

## Local Setup (No Containers)
Prerequisites:
- .NET SDK 10+
- Node.js 20+
- PostgreSQL 16+

1. Backend
```bash
dotnet restore backend/FinanceTracker.slnx --configfile NuGet.Config
dotnet run --project backend/src/FinanceTracker.Api/FinanceTracker.Api.csproj
```

2. Frontend
```bash
cd frontend
npm install
npm run dev
```

3. Open
- Frontend: `http://localhost:5173`
- API: `http://localhost:5213`
- Swagger (Development): `http://localhost:5213/swagger`

## Podman / Compose Run (Optional)
Prerequisites:
- Podman + podman-compose (or Docker + docker compose)

1. Start stack
```bash
podman compose -f compose.yml up --build
```

2. Open
- Frontend: `http://localhost:4173`
- API (host): `http://localhost:5213`
- PostgreSQL: `localhost:5432`

## Module Docs
- Backend guide: `backend/README.md`
- Frontend guide: `frontend/README.md`
