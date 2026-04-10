# RusTrack

Fullstack baseline implementation based on `RUSTRACK_ARCHITECTURE.md`.

## Stack
- Frontend: Next.js 16, App Router, TypeScript, Tailwind, React Query, Zustand, Yandex Maps
- Backend: NestJS 11, PostgreSQL/PostGIS, Redis, Socket.IO, JWT auth with httpOnly cookies

## Quick start
1. Copy env files:
   - `cp frontend/.env.local.example frontend/.env.local`
   - `cp backend/.env.example backend/.env`
2. Start infra:
   - `docker compose up -d`
3. Start backend:
   - `cd backend && npm run start:dev`
4. Start frontend:
   - `cd frontend && npm run dev`

## Migrations
Run SQL files in order:
- `backend/src/database/migrations/001_init.sql`
- `backend/src/database/migrations/002_postgis.sql`
- `backend/src/database/migrations/003_indexes.sql`
- `backend/src/database/seeds/regions.sql`

## API base url
- `http://localhost:3001/api/v1`


## Frontend env
- `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` - API key for Yandex Maps JS API v3
