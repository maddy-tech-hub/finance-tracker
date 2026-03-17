# Azure Readiness Notes

## Backend
- Configuration is environment-variable friendly (`ConnectionStrings__*`, `Jwt__*`, `Cors__*`).
- API startup applies EF migrations with retry to tolerate delayed DB readiness.
- Suitable for Azure App Service (Linux) or Azure Container Apps.

## Frontend
- Vite production build (`npm run build`) outputs static assets under `dist/`.
- Can be hosted via Azure Static Web Apps or containerized Nginx deployment.
- `VITE_API_URL` controls backend endpoint at build time.

## Database
- Swap local PostgreSQL with Azure Database for PostgreSQL by updating `ConnectionStrings__Postgres`.
- No manual schema creation needed; migrations handle schema evolution.

## Container Path
- `backend/Dockerfile` and `frontend/Dockerfile` are production-oriented.
- `compose.yml` provides a full local container reference topology.

## Production Variables Checklist
- `ConnectionStrings__Postgres`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__Key`
- `Jwt__AccessTokenMinutes`
- `Jwt__RefreshTokenDays`
- `Cors__AllowedOrigins__0` (and additional origins as needed)
- `ASPNETCORE_ENVIRONMENT=Production`
- `ASPNETCORE_URLS`
- `VITE_API_URL` (frontend build)
