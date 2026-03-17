# Frontend (React + TypeScript + Vite)

## Overview
The frontend is a Vite React app using:
- React Router
- TanStack Query
- Axios (JWT + refresh interceptor)
- React Hook Form + Zod
- Recharts

## Environment
Use `.env.example` as reference:
- `VITE_API_URL` (backend origin, e.g. `http://localhost:8080` for containerized backend)

Vite reads variables at build/dev time.

## Local Run
```bash
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

## Container Run (Podman/Docker)
Build image from `frontend/`:
```bash
podman build -t finance-tracker-frontend --build-arg VITE_API_URL=http://localhost:8080 .
```

Run:
```bash
podman run --rm -p 4173:80 finance-tracker-frontend
```

The app is served by Nginx in container mode.
