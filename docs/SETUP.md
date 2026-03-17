# Personal Finance Tracker - Final Setup & Run Guide

This guide is specific to the generated project at:
`D:\\Repositories\\finance-tracker`

## 1) Prerequisites
Already installed on this machine:
- PostgreSQL 18.3
- Podman 5.7.1
- .NET SDK 10.0.104
- Node.js v22.11.0

Optional but recommended:
- Git
- VS Code or Visual Studio 2022
- Postman / Insomnia (for API testing)

## 2) Project Structure Overview
At repo root:
- `backend/` ASP.NET Core Web API solution (`FinanceTracker.slnx`) and tests
- `frontend/` React + TypeScript + Vite app
- `docs/` architecture, Azure readiness, and setup docs
- `compose.yml` optional full-stack Podman/Docker compose
- `.env.example` compose environment template
- `NuGet.Config` NuGet source config
- `README.md` project overview and quick run

## 3) PostgreSQL Database Setup (Local)
If PostgreSQL service is not already running, start it first.

### 3.1 Start PostgreSQL
Windows options (any one):
1. `services.msc` -> find PostgreSQL service -> Start
2. Or from command line (if configured as a service):
   - `net start postgresql-x64-18` (service name may vary)

### 3.2 Create database
Using `psql` (replace user if needed):
```bash
psql -U postgres -h localhost -p 5432
```
Then:
```sql
CREATE DATABASE finance_tracker_dev;
\q
```

### 3.3 Verify connection
```bash
psql -U postgres -h localhost -p 5432 -d finance_tracker_dev -c "SELECT now();"
```

### 3.4 Where to set connection string
Update either:
- `backend/src/FinanceTracker.Api/appsettings.Development.json`
- or environment variable `ConnectionStrings__Postgres`

Expected local default format:
```text
Host=localhost;Port=5432;Database=finance_tracker_dev;Username=postgres;Password=postgres
```

## 4) Backend Setup
From repository root:

### 4.1 Restore packages
```bash
dotnet restore backend/FinanceTracker.slnx --configfile NuGet.Config
```

### 4.2 Configure backend settings
Check these in `backend/src/FinanceTracker.Api/appsettings.Development.json`:
- `ConnectionStrings:Postgres`
- `Jwt:Issuer`
- `Jwt:Audience`
- `Jwt:Key` (minimum 32 characters)
- `Cors:AllowedOrigins`

You can also use env variables from:
- `backend/src/FinanceTracker.Api/.env.example`

### 4.3 Migrations behavior
- EF Core code-first migrations are already in source.
- Migrations are automatically applied on startup (`Database.Migrate()` with retry).
- Manual migration execution is not required for normal startup.

### 4.4 Run backend
```bash
dotnet run --project backend/src/FinanceTracker.Api
```

### 4.5 Verify backend
- Swagger (development): `https://localhost:7069/swagger`
- Quick API sanity check:
  - `GET /api/dashboard/summary` should return `401 Unauthorized` without token (this is expected and confirms API is running + auth enforced).

## 5) Frontend Setup
From repository root:

### 5.1 Install dependencies
```bash
cd frontend
npm install
```

### 5.2 Configure frontend environment
Create `.env` in `frontend/` from example:
- `frontend/.env.example`

Set:
```text
VITE_API_URL=https://localhost:7069
```
(Use `http://localhost:8080` only for containerized backend flow.)

### 5.3 Run frontend
```bash
npm run dev
```

### 5.4 Verify frontend
Open:
- `http://localhost:5173`

Check:
- Login/Signup pages render
- After authentication, app shell and dashboard load
- API calls succeed (no CORS/network errors in browser console)

## 6) Full Local Run Flow (Recommended Order)
1. Start PostgreSQL service
2. Ensure DB exists: `finance_tracker_dev`
3. Start backend:
   - `dotnet run --project backend/src/FinanceTracker.Api`
4. Start frontend:
   - `cd frontend && npm run dev`
5. Open app at `http://localhost:5173`
6. Test core flow:
   - Sign up
   - Login
   - Add account(s)
   - Add transactions
   - Visit dashboard/reports/goals/budgets/recurring

## 7) Optional Podman Run Flow
Podman is optional. Local non-container run remains fully supported.

### 7.1 Prepare env
From repo root:
```bash
copy .env.example .env
```
(or create `.env` manually)

Set at least:
- `JWT_KEY` to a secure 32+ character key

### 7.2 Start full stack
```bash
podman compose -f compose.yml up --build
```

### 7.3 Verify containerized endpoints
- Frontend: `http://localhost:4173`
- Backend: `http://localhost:8080`
- Postgres: `localhost:5432`

Notes:
- In compose flow, backend uses container Postgres (`Host=postgres`).
- `UseHttpsRedirection` is disabled by default in compose to avoid HTTP redirect loops.

## 8) Troubleshooting

### DB connection errors
- Confirm PostgreSQL service is running
- Confirm DB exists (`finance_tracker_dev`)
- Validate `ConnectionStrings__Postgres`
- Ensure credentials/user permissions are correct

### Port conflicts
- Backend local: 7069/5000 range (ASP.NET profile dependent)
- Frontend local: 5173
- Compose backend: 8080
- Compose frontend: 4173
- Postgres: 5432

If occupied, stop conflicting process or change port config.

### CORS errors
- Add frontend origin to `Cors:AllowedOrigins` in backend config
- Local frontend usually needs `http://localhost:5173`
- Compose frontend usually needs `http://localhost:4173`

### JWT/auth issues
- Ensure `Jwt:Key` is set and at least 32 chars
- Ensure backend and frontend point to same backend URL
- If stale tokens exist, clear browser local storage and login again

### Migration issues
- Check DB user privileges for schema create/alter
- Review backend startup logs for migration retry failures
- Confirm connection string targets the intended DB

### Frontend API URL issues
- Verify `frontend/.env` -> `VITE_API_URL`
- For local backend: `https://localhost:7069`
- For compose backend: `http://localhost:8080`
- Restart Vite dev server after env changes

## 9) Demo-Ready Checklist
Before presenting:
- [ ] Backend starts cleanly and migrations apply
- [ ] Frontend builds/runs with no console errors
- [ ] Signup + login work
- [ ] Add transaction flow works (topbar quick add + transactions page)
- [ ] Dashboard shows updated metrics
- [ ] Budgets/goals/recurring/reports pages load and reflect data
- [ ] Swagger opens and key protected endpoints return expected auth behavior
- [ ] `.env` and secrets are not committed

## 10) Notes Specific to This Project
- Architecture is layered backend + feature-structured frontend.
- EF Core migrations are startup-applied; no manual table creation.
- Containerization is optional and Podman-compatible.
- Root compose stack is configured for postgres + backend + frontend.

