# Project Management Dashboard

A mini SaaS-style dashboard for managing projects. List, search, filter, create, edit, and delete projects with status, deadline, budget, and assigned team member — backed by a REST API and PostgreSQL.

## Features

- **Project CRUD** — create, read, update, and delete projects
- **Dashboard UI** — responsive table with search and status filtering
- **Modal forms** — add and edit projects in a modal dialog
- **Delete confirmation** — confirm before removing a project
- **REST API** — JSON endpoints for projects and team members
- **Authentication** — session-based login with NextAuth.js (credentials)
- **Seeded data** — sample team members and projects for demos
- **Loading & error states** — skeletons, empty states, retry on failure

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes (REST) |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Auth | NextAuth.js (Auth.js v5) |
| Validation | Zod |

## Prerequisites

- **Node.js** 18+
- **npm** (or yarn/pnpm)
- **PostgreSQL** — local install, Docker, or [Supabase](https://supabase.com) free tier

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd project-management
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret — run `openssl rand -base64 32` |
| `AUTH_URL` | App URL, e.g. `http://localhost:3000` |
| `AUTH_DEMO_EMAIL` | Login email for credentials auth |
| `AUTH_DEMO_PASSWORD` | Login password for credentials auth |

`NEXTAUTH_SECRET` and `NEXTAUTH_URL` are optional aliases for `AUTH_SECRET` and `AUTH_URL`.

### 3. Start PostgreSQL

**Docker (recommended for local dev):**

```bash
docker run -d --name pm-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=project_management \
  -p 5432:5432 postgres:16
```

If the container already exists:

```bash
docker start pm-postgres
```

Set `DATABASE_URL` in `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project_management"
```

### 4. Database setup

```bash
npm run db:push
npm run db:seed
```

This creates the schema and seeds **10 team members** and **18 projects**.

Browse data with Prisma Studio:

```bash
npx prisma studio
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Default login** (from `.env.example`):

- Email: `admin@example.com`
- Password: `password`

## Usage

### Dashboard

1. Sign in at `/login`
2. View all projects in the table
3. **Search** by title or description
4. **Filter** by status (Active, On hold, Completed)
5. **Add Project** — opens the create modal
6. **Edit** / **Delete** — row actions on each project

### npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed sample data |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:generate` | Regenerate Prisma client |

## API Reference

All project and team-member endpoints require authentication. Unauthenticated requests return `401` with `{ "error": "Unauthorized" }`.

Sign in via the browser first, or use a session cookie from a logged-in session for `curl` testing.

### Projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/projects` | List all projects (includes `teamMember`) |
| `GET` | `/api/projects?status=ACTIVE` | Filter by status (`ACTIVE`, `ON_HOLD`, `COMPLETED`) |
| `GET` | `/api/projects?search=portal` | Search title/description (case-insensitive) |
| `POST` | `/api/projects` | Create a project |
| `GET` | `/api/projects/:id` | Get a single project |
| `PATCH` | `/api/projects/:id` | Update a project (partial) |
| `DELETE` | `/api/projects/:id` | Delete a project |

**Create / update body:**

```json
{
  "title": "New Project",
  "description": "Optional description",
  "status": "ACTIVE",
  "deadline": "2026-12-31",
  "budget": 25000,
  "teamMemberId": "<team-member-id>"
}
```

### Team Members

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/team-members` | List all team members (for assignee dropdown) |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/*` | NextAuth.js handlers (sign-in, sign-out, session) |

### Example requests

```bash
# Unauthenticated — returns 401
curl http://localhost:3000/api/projects

# List projects (requires session cookie after browser login)
curl http://localhost:3000/api/projects \
  --cookie "authjs.session-token=<your-session-token>"

# Filter active projects
curl "http://localhost:3000/api/projects?status=ACTIVE" \
  --cookie "authjs.session-token=<your-session-token>"
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   ├── projects/             # Project CRUD
│   │   └── team-members/         # Team member list
│   ├── login/                    # Login page
│   └── page.tsx                  # Dashboard (protected)
├── components/
│   ├── auth/                     # Login form, sign out
│   ├── layout/                   # Dashboard shell
│   ├── projects/                 # Table, filters, forms
│   └── ui/                       # Button, Input, Modal, etc.
├── lib/                          # Prisma, validation, formatters
└── types/                        # Shared TypeScript types
prisma/
├── schema.prisma                 # Database models
└── seed.ts                       # Sample data
```

## Screenshots

<!-- Add screenshots or a GIF of the dashboard here -->

| Dashboard | Add/Edit Modal |
|-----------|----------------|
| _Screenshot placeholder_ | _Screenshot placeholder_ |

## Deployment

Deploy the Next.js app to [Vercel](https://vercel.com) with a hosted PostgreSQL database on [Supabase](https://supabase.com).

### Production checklist

Before going live, confirm:

- [ ] `DATABASE_URL` uses the Supabase **Transaction pooler** URL (port `6543`), not the direct connection
- [ ] `AUTH_SECRET` is a strong random value (`openssl rand -base64 32`)
- [ ] `AUTH_URL` matches your production domain exactly (e.g. `https://your-app.vercel.app`, no trailing slash)
- [ ] `AUTH_DEMO_EMAIL` / `AUTH_DEMO_PASSWORD` are changed from defaults
- [ ] Schema has been pushed to production (`prisma db push` or `prisma migrate deploy`)
- [ ] Seed data loaded if you want demo projects in production
- [ ] Vercel environment variables are set for **Production** (not just Preview)

### Vercel environment variables

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | `postgresql://postgres.[ref]:[pass]@...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `AUTH_SECRET` | Yes | Output of `openssl rand -base64 32` |
| `AUTH_URL` | Yes | `https://your-app.vercel.app` |
| `AUTH_DEMO_EMAIL` | Yes | Your admin email |
| `AUTH_DEMO_PASSWORD` | Yes | Strong password |
| `NEXTAUTH_SECRET` | Optional | Same as `AUTH_SECRET` |
| `NEXTAUTH_URL` | Optional | Same as `AUTH_URL` |

### Step-by-step: Vercel + Supabase

#### 1. Supabase database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database**
3. Copy the **Transaction pooler** connection string (URI, port `6543`)
4. Append `?pgbouncer=true` if not already present

#### 2. Push schema and seed (one-time)

From your machine, using the production `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npx prisma db seed
```

For migration-based workflows in production, use `npx prisma migrate deploy` instead of `db push`.

#### 3. Deploy to Vercel

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js — `vercel.json` ensures `prisma generate` runs before build
4. Add all environment variables from the table above
5. Deploy

#### 4. Verify production

1. Open your Vercel URL — you should be redirected to `/login`
2. Sign in with your `AUTH_DEMO_EMAIL` / `AUTH_DEMO_PASSWORD`
3. Confirm projects load and CRUD works

### `vercel.json`

The included `vercel.json`:

- Runs `npm run db:generate` before `npm run build` (in addition to `postinstall`)
- Sets `Cache-Control: no-store` on API routes so authenticated responses are not cached

### Troubleshooting

| Issue | Fix |
|-------|-----|
| `MissingSecret` on deploy | Set `AUTH_SECRET` in Vercel env vars |
| `Can't reach database server` | Use Supabase **pooler** URL, not direct; check IP allowlist |
| Login works locally but not on Vercel | Set `AUTH_URL` to the exact production URL |
| Build fails on Prisma | Ensure `DATABASE_URL` is set in Vercel build env |
| Empty project list | Run `prisma db push` and `db seed` against production DB |

### Alternative hosts

The app is a standard Next.js 16 project. It can also run on Railway, Render, or any Node host that supports:

- Node.js 18+
- Environment variables for `DATABASE_URL` and auth secrets
- `npm run build` && `npm run start`

## License

Private — built as a full-stack developer assessment project.
