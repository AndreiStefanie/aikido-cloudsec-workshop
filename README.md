# aikido-cloudsec-workshop

Monorepo for the **Fix it, snooze it, ignore it** CloudSec Village workshop hosted by Aikido Security.

## Stack

- `apps/player`: attendee-facing Vue 3 + Vite + Tailwind app
- `apps/admin`: admin Vue 3 + Vite + Tailwind app
- `apps/api`: Node.js + TypeScript + Express backend
- `packages/shared`: shared game/domain types
- `apps/api/src/db/schema.sql`: Postgres schema for production deployment

## Product shape

The first version includes:

- Challenge join and resume flow using a persistent session token
- Scenario-by-scenario prioritization gameplay
- Action scoring, ownership scoring, and streak bonus scoring
- Immediate answer feedback with rationale and impact explanation
- Real-time leaderboard polling
- Admin dashboard with basic-auth-protected challenge/session management
- Seeded scenarios for the workshop brief

## Brand direction

The UI is tuned to the Aikido overview palette referenced by the user:

- Navy: `#010124`, `#1A1D3A`
- Violet: `#6551F3`
- Light canvas: `#F5F7FA`
- Mint: `#10B981`, `#B8E0C8`

The workshop is presented as **hosted by Aikido Security** without turning the attendee flow into a product promo.

## Local setup

1. Install dependencies with `pnpm install`
2. Copy `.env.example` to `.env`
3. Start the apps you need:
   - `pnpm dev:api`
   - `pnpm dev:player`
   - `pnpm dev:admin`

Default local URLs:

- Player app: `http://localhost:5173`
- Admin app: `http://localhost:5174`
- API: `http://localhost:4000`

## Runtime behavior

- Without `DATABASE_URL`, the API uses seeded in-memory data so the workshop can be demoed immediately.
- With `DATABASE_URL`, the app is structured for Postgres-backed persistence. The production schema lives in [schema.sql](/Users/andrei/projects/aikido/aikido-cloudsec-workshop/apps/api/src/db/schema.sql).
- Admin auth is HTTP Basic Auth backed by `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- Player session resume is device-friendly through `localStorage`, while the backend token model supports cross-challenge reuse later.

## API routes

### Player

- `POST /api/player/join`
- `POST /api/player/resume`
- `GET /api/player/current-scenario`
- `POST /api/player/decision`

### Leaderboard

- `GET /api/leaderboard/:challengeSlug`

### Admin

- `GET /api/admin/dashboard`
- `POST /api/admin/challenges`
- `PUT /api/admin/challenges/:challengeId`
- `POST /api/admin/challenges/:challengeId/scenarios`
- `PUT /api/admin/challenges/:challengeId/scenarios/:scenarioId`

## Deployment notes

The target deployment is AWS Elastic Beanstalk.

- Build the monorepo with `pnpm build`
- Serve the backend with `pnpm --filter @workshop/api start:prod`
- Deploy the built frontend assets separately or behind the same ALB/CDN, depending on the final AWS layout
- Use RDS Postgres and apply [schema.sql](/Users/andrei/projects/aikido/aikido-cloudsec-workshop/apps/api/src/db/schema.sql)
- Use the Procfile at [infra/elastic-beanstalk/Procfile](/Users/andrei/projects/aikido/aikido-cloudsec-workshop/infra/elastic-beanstalk/Procfile) for the API environment

## Gaps to finish next

- Complete the Postgres repository adapter in [postgresRepository.ts](/Users/andrei/projects/aikido/aikido-cloudsec-workshop/apps/api/src/modules/sessions/postgresRepository.ts)
- Replace manual join slug/password entry with a QR or short-code landing flow
- Expand the admin editor for multi-resource scenarios and scenario reordering
- Add the future graph visualization beside the current resource table
