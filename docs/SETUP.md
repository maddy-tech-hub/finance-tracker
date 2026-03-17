# Local Deployment Guide

Use one flow at a time.

## Ports (quick reference)

### Normal local flow (`dotnet run` + Vite)
- Backend HTTP: `http://localhost:5213`
- Backend HTTPS: `https://localhost:7010`
- Frontend: `http://localhost:5173`
- PostgreSQL (local service): `localhost:5432`

### Podman flow (`podman compose`)
- Frontend: `http://localhost:4173`
- Backend: `http://localhost:8080`
- PostgreSQL (container): `localhost:5432`

## Required env vars (Production values from your side)

### Backend
- `ConnectionStrings__Postgres`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__Key` (min 32 chars)
- `Cors__AllowedOrigins__0`
- `UseHttpsRedirection`

### Frontend
- `VITE_API_URL`

## Flow A: Normal Local Run (without Podman)

### 1) Backend
From repo root:
```bash
dotnet restore backend/FinanceTracker.slnx --configfile NuGet.Config
dotnet build backend/FinanceTracker.slnx
dotnet run --project backend/src/FinanceTracker.Api
```

Backend will run on:
- `http://localhost:5213`
- `https://localhost:7010`

### 2) Frontend
Open a second terminal:
```bash
cd frontend
npm install
```

Create/update `frontend/.env`:
```text
VITE_API_URL=http://localhost:5213
```

Run frontend:
```bash
npm run dev
```

Open:
- `http://localhost:5173`

## Flow B: Podman Local Run

From repo root:
```bash
podman compose -f compose.yml up --build -d
```

Open:
- Frontend: `http://localhost:4173`
- Backend Swagger: `http://localhost:8080/swagger`

Stop:
```bash
podman compose -f compose.yml down
```

Logs:
```bash
podman compose -f compose.yml logs -f
```

## Important

- Do not run both flows together on same machine if ports conflict.
- For normal flow, frontend must point to `http://localhost:5213`.
- For podman flow, frontend image uses `VITE_API_URL` from compose build args (default `http://localhost:8080`).
