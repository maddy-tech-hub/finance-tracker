# Frontend (React + TypeScript + Vite)

## Overview
Frontend stack:
- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form + Zod
- Recharts

## Environment Configuration
Frontend uses Vite environment variables at dev/build time.

Primary variable:
- `VITE_API_URL` (backend base origin, without `/api`)

Typical values:
- Local backend: `http://localhost:5213`
- Podman/Docker compose backend (host access): `http://localhost:5213`
- Cloud backend: `https://<your-api-domain>`

## Local Run
```bash
cd frontend
npm install
npm run dev
```

Default URL:
- `http://localhost:5173`

## Production Build
```bash
npm run build
npm run preview
```

## Podman/Docker Image Run
Build image from `frontend/`:
```bash
podman build -t finance-tracker-frontend --build-arg VITE_API_URL=http://localhost:5213 .
```

Run container:
```bash
podman run --rm -p 4173:80 finance-tracker-frontend
```

Nginx serves the static build with SPA fallback support.

## Azure Readiness Notes
- Frontend is static-build ready (`dist/`).
- Deploy options:
  - Azure Static Web Apps (recommended for frontend)
  - Azure Storage Static Website + CDN
  - Containerized Nginx on Azure Container Apps
- Ensure `VITE_API_URL` is set correctly during build in CI/CD.
