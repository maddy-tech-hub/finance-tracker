# Deployment Quick Guide

This document contains only build and deploy steps.

## 1) Production Env Vars (you must set)

### Backend (`backend/src/FinanceTracker.Api`)
- `ASPNETCORE_ENVIRONMENT=Production`
- `ConnectionStrings__Postgres`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__Key` (minimum 32 chars)
- `Cors__AllowedOrigins__0`
- `UseHttpsRedirection` (set as needed behind your reverse proxy)

### Frontend (`frontend/.env`)
- `VITE_API_URL` (public API base URL)

## 2) Normal Deployment (without Podman)

### Backend
```bash
dotnet restore backend/FinanceTracker.slnx --configfile NuGet.Config
dotnet build backend/FinanceTracker.slnx -c Release
dotnet publish backend/src/FinanceTracker.Api/FinanceTracker.Api.csproj -c Release -o backend/out
```

Run published API:
```bash
dotnet backend/out/FinanceTracker.Api.dll
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

Run frontend build (choose one):
```bash
npm run preview -- --host 0.0.0.0 --port 4173
```
or deploy `frontend/dist` using Nginx/Apache/static hosting.

## 3) Podman Deployment

> Frontend flow is same build process; backend runs in container flow.

### Full stack via compose
From repo root:
```bash
podman compose -f compose.yml up --build -d
```

View logs:
```bash
podman compose -f compose.yml logs -f
```

Stop stack:
```bash
podman compose -f compose.yml down
```

## 4) Quick Health Checks

- Backend: open `/swagger` on your backend host
- Frontend: open deployed frontend URL
- API auth check:
```bash
curl http://<backend-host>/api/auth/login -H "Content-Type: application/json" --data "{\"email\":\"<email>\",\"password\":\"<password>\"}"
```
