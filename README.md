# Veilant Project

A cybersecurity vulnerability monitoring dashboard built with React + TypeScript, Express + TypeScript, and PostgreSQL.

## Stack

- Front end: React + Vite + TypeScript
- API: Node.js + Express + TypeScript
- Database: PostgreSQL 16 with a persistent Docker Compose volume

## Frontend structure

- `src/App.tsx` composes the page and delegates dashboard data operations to `src/hooks/useDashboardData.ts`.
- `src/components/` contains the header, overview cards, exposure chart, asset posture, vulnerability manager/editor/table, and footer.
- `src/types.ts` defines the shared dashboard and vulnerability model types.

## Quick start

1. Copy the local environment template:
   cp .env.example .env
2. Install dependencies:
   npm install
3. Start PostgreSQL, apply the schema, seed it once, and start the app:
   npm run dev
   `npm run dev` runs the database setup before starting the API and frontend. Docker Compose must be installed and running.
4. Build for production:
   npm run build
5. Apply the schema and seed manually:
   npm run db:setup
6. Run the production server after building:
   npm start

PostgreSQL data is stored in the named `veilant-postgres` volume and survives API and container restarts. `npm run db:down` stops the containers without deleting that volume. Do not use `docker compose down -v` unless you intend to erase the database. The example credentials are for local development only.

The seed is deterministic, uses varied severity and status distributions, and only inserts data when the assets table is empty. Re-running it does not truncate or overwrite existing records, so CRUD changes remain intact. Set `DATABASE_URL` for your PostgreSQL instance; the API no longer falls back to in-memory data.

## API

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/assets`
- `GET /api/vulnerabilities`
- `GET /api/vulnerabilities/:id`
- `POST /api/vulnerabilities`
- `PUT /api/vulnerabilities/:id`
- `DELETE /api/vulnerabilities/:id`

Create and update requests accept `assetId`, `title`, `severity`, `cvss`, `status`, `owner`, `packageName`, `lastSeen`, and `dueDate`.

`GET /api/health` reports PostgreSQL connectivity as `{"status":"ok","database":{"status":"connected"}}`; it returns HTTP 503 and a disconnected database status when PostgreSQL is unavailable.

## Deploying to Render

The root `render.yaml` Blueprint describes a Render web service and PostgreSQL database. In Render, create a new Blueprint Instance from this GitHub repository and select the `main` branch. Render will build the frontend and API, run the database schema and sample seed on service startup, then serve both the dashboard and API from the public web service URL.

The startup seed only inserts records when the assets table is empty, so restarting the service does not overwrite existing data. The free Render PostgreSQL plan is intended for evaluation and its database expires after the provider's retention period; use a paid persistent database for a long-lived demo. Free web services may spin down when idle and take time to wake.
