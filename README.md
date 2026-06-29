# RusTrack

> Discover Russia step by step.

RusTrack is a travel-tracking PWA that turns exploring the country into a map you
uncover as you go. The map of Russia starts hidden; each region you visit gets
**revealed**, building a personal heatmap of where you've been. It pairs a
mobile-first Next.js front end with a NestJS + PostGIS back end, real-time
updates over WebSockets, and VK sign-in.

## Features

- **Reveal map** — regions unlock as you travel, with a personal coverage heatmap
- **Geolocation tracks** stored and queried with PostGIS spatial indexes
- **Community layer** — share and discover places
- **Real-time** updates via Socket.IO
- **VK OAuth** sign-in with JWT in httpOnly cookies
- **i18n** — Russian, English and Chinese
- **PWA** — installable, offline-aware

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind, React Query, Zustand, VK Maps / Mappable (Yandex Maps JS API v3) |
| Backend | NestJS 11, PostgreSQL + PostGIS, Redis, Socket.IO |
| Auth | VK OAuth, JWT (access + refresh) in httpOnly cookies |
| Infra | Docker Compose (Postgres/PostGIS, Redis, MinIO/S3) |

See [`RUSTRACK_ARCHITECTURE.md`](RUSTRACK_ARCHITECTURE.md) for the full system
design and [`DEPLOY.md`](DEPLOY.md) for production deployment.

## Quick start

1. **Configure environment**

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```

   Fill in your VK app credentials, JWT secrets and the Yandex Maps API key.

2. **Start infrastructure** (Postgres/PostGIS, Redis, S3)

   ```bash
   docker compose up -d
   ```

3. **Run migrations** (in order)

   ```
   backend/src/database/migrations/001_init.sql
   backend/src/database/migrations/002_postgis.sql
   backend/src/database/migrations/003_indexes.sql
   backend/src/database/seeds/regions.sql
   ```

4. **Start the backend**

   ```bash
   cd backend && npm install && npm run start:dev
   ```

5. **Start the frontend**

   ```bash
   cd frontend && npm install && npm run dev
   ```

- API base URL: `http://localhost:3001/api/v1`
- Frontend: `http://localhost:3000`

## Configuration

Key environment variables (see the `.env.example` files for the full list):

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_VK_MAPS_API_KEY` | frontend | Map rendering (VK Maps / Mappable) |
| `VK_APP_ID`, `VK_APP_SECRET`, `VK_SERVICE_KEY` | backend | VK OAuth |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | backend | Token signing |
| `DB_*`, `REDIS_*`, `S3_*` | backend | Datastores |

## License

[MIT](LICENSE) © George Zhurik
