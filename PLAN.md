# Mini SaaS Dashboard — Implementation Plan

A step-by-step commit plan for building a project management dashboard. Each item is one logical git commit. Work through them in order; later commits depend on earlier ones.

## Tech Stack (recommended)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 14+ (App Router)** | React frontend + API routes in one repo |
| Styling | **Tailwind CSS** | Required; fast responsive UI |
| Database | **PostgreSQL** via **Supabase** (or local Postgres + Prisma) | Meets requirement; Supabase speeds deployment |
| ORM | **Prisma** | Type-safe schema, migrations, seeding |
| API | **REST** (`/api/projects`) | Simple CRUD, easy to evaluate |
| Auth (bonus) | **NextAuth.js** or Supabase Auth | Session-based, minimal setup |
| Deploy | **Vercel** + Supabase | Free tier, fits Next.js |
| Containers (bonus) | **Docker** + docker-compose | Local full-stack dev; evaluation bonus |

---

## Bonus points

Maps each **bonus** item from the task brief to commits in this plan. Core requirements are commits **1–11**; bonus items are **12–15**.

| Bonus item | Commit(s) | Notes |
|------------|-----------|-------|
| **Authentication** (JWT or session-based) | **12** | NextAuth.js with login page and protected dashboard/API |
| **GitHub & meaningful commit history** | **1–15** (ongoing) | Follow this plan one commit at a time; you set up the remote repo and push |
| **README** (setup & usage) | **13** | Full setup guide, API reference, env vars |
| **Deployment** | **14** | Vercel + Supabase production notes |
| **Containerization** | **15** | Dockerfile + docker-compose for app + Postgres |
| **Additional features** | Optional follow-ups | Tests, CI, dark mode, pagination, etc. |

**Version control:** Each numbered step below is intended as a single, focused git commit with a clear message. You handle `git init`, remote setup, and pushes — the plan only defines *what* to commit and when.

---

## Commit Plan

### 1. Initialize Next.js project with Tailwind CSS

**Commit message:**
```
chore: initialize Next.js app with Tailwind CSS
```

**What it adds:**
- `create-next-app` scaffold (TypeScript, App Router, ESLint)
- Tailwind CSS configured (`tailwind.config`, `globals.css`)
- Basic `app/layout.tsx` and `app/page.tsx` placeholder
- `.gitignore`, `package.json`, `tsconfig.json`

**Notes:**
- Use `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- Verify with `npm run dev` — default Next.js welcome page loads

---

### 2. Add Prisma and PostgreSQL schema

**Commit message:**
```
feat(db): add Prisma schema for projects and team members
```

**What it adds:**
- `prisma/schema.prisma` with models:
  - **TeamMember** — `id`, `name`, `email` (unique)
  - **Project** — `id`, `title`, `description`, `status` (enum: `ACTIVE`, `ON_HOLD`, `COMPLETED`), `deadline` (DateTime), `budget` (Decimal/Float), `teamMemberId` (FK), `createdAt`, `updatedAt`
- `.env.example` with `DATABASE_URL` placeholder
- Prisma client setup (`lib/prisma.ts` singleton)
- `npm` scripts: `db:generate`, `db:push` or `db:migrate`

**Notes:**
- Status as Prisma enum keeps filtering consistent
- Budget as `Decimal` avoids float rounding issues

---

### 3. Database seed script with dummy data

**Commit message:**
```
feat(db): add seed script with sample projects and team members
```

**What it adds:**
- `prisma/seed.ts` — creates ~8–12 team members and ~15–20 projects across all statuses
- Varied deadlines (past, near future, far future) and budgets for realistic filtering demos
- `package.json` → `"prisma": { "seed": "tsx prisma/seed.ts" }`
- README section stub: how to run `npx prisma db push && npx prisma db seed`

**Notes:**
- No external API required; self-generated data is acceptable per spec
- Optional: fetch names from JSONPlaceholder `/users` for team member names

---

### 4. REST API — list and create projects

**Commit message:**
```
feat(api): add GET and POST /api/projects endpoints
```

**What it adds:**
- `app/api/projects/route.ts`
  - **GET** — returns all projects with `teamMember` relation; supports query params:
    - `?status=ACTIVE|ON_HOLD|COMPLETED` (filter)
    - `?search=...` (search title/description, case-insensitive)
  - **POST** — creates project; validates body with **Zod**
- `lib/validations/project.ts` — shared Zod schemas for create/update
- Consistent JSON error responses (400 validation, 500 server)

**Notes:**
- Test with `curl` or Thunder Client before building UI

---

### 5. REST API — read, update, delete single project

**Commit message:**
```
feat(api): add GET, PATCH, and DELETE /api/projects/[id] endpoints
```

**What it adds:**
- `app/api/projects/[id]/route.ts`
  - **GET** — single project by id (404 if missing)
  - **PATCH** — partial update
  - **DELETE** — remove project (204 or 200 with message)
- Reuses Zod schemas from commit 4

**Notes:**
- Completes full CRUD requirement

---

### 6. REST API — team members endpoint

**Commit message:**
```
feat(api): add GET /api/team-members endpoint
```

**What it adds:**
- `app/api/team-members/route.ts` — list all team members (for assignee dropdown in form)
- Optional: `GET /api/team-members/[id]` if needed

**Notes:**
- Keeps form data fetching separate from project mutations

---

### 7. Shared UI components and layout shell

**Commit message:**
```
feat(ui): add dashboard layout, header, and base components
```

**What it adds:**
- `app/layout.tsx` — fonts, metadata, global styles
- `components/layout/DashboardShell.tsx` — responsive shell (sidebar or top nav on mobile)
- `components/ui/` — reusable primitives: `Button`, `Input`, `Select`, `Badge`, `Modal` (or use shadcn/ui)
- Status badge color mapping (`ACTIVE` → green, `ON_HOLD` → yellow, `COMPLETED` → gray)
- Mobile-first responsive breakpoints

**Notes:**
- Optional: `npx shadcn@latest init` for polished components — mention in README
- No business logic yet; static layout only

---

### 8. Projects table with search and status filter

**Commit message:**
```
feat(ui): add projects table with search and status filtering
```

**What it adds:**
- `components/projects/ProjectsTable.tsx` — responsive table (horizontal scroll on small screens)
- `components/projects/ProjectFilters.tsx` — search input + status dropdown/tabs
- `app/page.tsx` — fetches projects from API (client or server component + `fetch`)
- Loading and empty states
- Columns: Title, Status, Deadline, Assignee, Budget, Actions

**Notes:**
- Filter can be client-side (on fetched data) or server-side (query params) — server-side preferred for scale
- Format deadline with `date-fns` or `Intl.DateTimeFormat`; format budget as currency

---

### 9. Modal form to add and edit projects

**Commit message:**
```
feat(ui): add project modal form for create and edit
```

**What it adds:**
- `components/projects/ProjectFormModal.tsx` — modal with form fields:
  - Title, Description (optional), Status, Deadline (date picker), Team Member (select), Budget
- `components/projects/ProjectForm.tsx` — shared form; used for create and edit modes
- Wire **Add Project** button → opens empty modal → POST `/api/projects`
- Wire **Edit** row action → opens pre-filled modal → PATCH `/api/projects/[id]`
- Client-side validation mirroring Zod rules; display API errors
- Refresh table after successful save (revalidate or refetch)

**Notes:**
- Use controlled inputs; disable submit while loading
- Focus trap and Escape to close modal (accessibility)

---

### 10. Delete project with confirmation

**Commit message:**
```
feat(ui): add delete project with confirmation dialog
```

**What it adds:**
- Delete button per table row
- Confirmation dialog (“Are you sure?”) before DELETE `/api/projects/[id]`
- Optimistic update or refetch after delete
- Toast or inline success/error feedback

**Notes:**
- Small, focused commit — keeps commit 9 reviewable

---

### 11. Error handling, loading states, and polish

**Commit message:**
```
feat(ui): improve loading states, error boundaries, and empty states
```

**What it adds:**
- Skeleton loaders for table while fetching
- `error.tsx` / friendly error UI for failed API calls
- Empty state when no projects match filters (“No projects found”)
- Disable filters/actions during mutations
- Minor responsive tweaks (stacked filters on mobile)

**Notes:**
- Demonstrates production-minded UX for evaluation

---

### 12. Authentication (bonus)

**Commit message:**
```
feat(auth): add session-based authentication with NextAuth
```

**What it adds:**
- NextAuth.js (or Supabase Auth) configuration
- `app/api/auth/[...nextauth]/route.ts`
- Login page `app/login/page.tsx` (credentials or OAuth — GitHub provider is a nice touch)
- Protect dashboard: middleware or server-side session check on `app/page.tsx`
- Redirect unauthenticated users to `/login`
- `.env.example` updated with `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

**Notes:**
- Bonus points item — skip if time-constrained, but high evaluation value
- API routes can optionally require session (return 401)

---

### 13. README and environment documentation

**Commit message:**
```
docs: add README with setup, usage, and API reference
```

**What it adds:**
- `README.md` with:
  - Project overview and feature list
  - Prerequisites (Node 18+, Postgres or Supabase account)
  - Setup: clone → `npm install` → copy `.env.example` → `db push` → `db seed` → `npm run dev`
  - API endpoint table (method, path, description)
  - Screenshots or GIF placeholder section
  - Tech stack summary
  - Deployment notes (Vercel + Supabase)
- `.env.example` complete with all required variables

**Notes:**
- Required for evaluation criteria (Documentation)

---

### 14. Deployment configuration (bonus)

**Commit message:**
```
chore: add Vercel deployment config and production database notes
```

**What it adds:**
- `vercel.json` if needed (usually not for standard Next.js)
- README section: deploy to Vercel, set env vars, run migrations on Supabase
- Production checklist: connection pooling (Supabase pooler URL), env vars on Vercel

**Notes:**
- Cloud deployment bonus — separate from local Docker (commit 15)
- Ensure production `DATABASE_URL` uses the pooler URL, not the direct connection

---

### 15. Docker containerization (bonus)

**Commit message:**
```
chore: add Docker and docker-compose for local development
```

**What it adds:**
- `Dockerfile` — multi-stage build for Next.js (dev and production targets)
- `docker-compose.yml` — services:
  - **app** — Next.js on port 3000
  - **db** — PostgreSQL 16 with named volume
- `.dockerignore` — exclude `node_modules`, `.next`, `.git`
- README section: `docker compose up`, run migrations/seed inside container
- Optional `docker-compose.override.yml.example` for local env tweaks

**Notes:**
- Containerization bonus — evaluators can run the full stack with one command
- `DATABASE_URL` in compose points at the `db` service hostname
- Final commit before submission (after deployment docs in commit 14)

---

## Optional follow-up commits

Extra polish beyond the brief. Pick any after commit 15 if time permits.

| Commit message | What it adds |
|----------------|--------------|
| `test: add API route integration tests` | Vitest/Jest tests for CRUD endpoints |
| `test: add component tests for project form and table` | React Testing Library smoke tests |
| `feat(ui): add dark mode toggle` | Theme switcher via Tailwind `dark:` |
| `feat(api): add pagination to GET /api/projects` | `?page=1&limit=10` with total count header |
| `feat(api): add sorting to GET /api/projects` | `?sort=deadline&order=asc` |
| `feat(ui): add budget summary stats on dashboard` | Cards: total budget, count by status |
| `ci: add GitHub Actions workflow for lint and test` | `.github/workflows/ci.yml` on push/PR |
| `chore: add ESLint and Prettier config` | Consistent formatting across the repo |
| `feat(ui): add toast notifications library` | Replace inline success/error with toasts |
| `docs: add CONTRIBUTING.md and PR template` | Contributor guidelines for evaluators |

---

## Suggested folder structure (end state)

```
project-management/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── projects/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── team-members/route.ts
│   │   │   └── auth/[...nextauth]/route.ts   # bonus
│   │   ├── login/page.tsx                      # bonus
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── projects/
│   │   └── ui/
│   └── lib/
│       ├── prisma.ts
│       └── validations/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── README.md
└── PLAN.md
```

---

## Requirements checklist

### Core requirements

| Requirement | Covered by commits |
|-------------|-------------------|
| Status, Deadline, Assignee, Budget | 2, 4, 9 |
| React/Next.js + Tailwind | 1, 7 |
| Responsive table + filter/search by status | 8 |
| Modal add/edit form | 9 |
| Node backend (API routes) | 4, 5, 6 |
| PostgreSQL | 2, 3 |
| REST CRUD | 4, 5 |
| Data seeding | 3 |
| Documentation (eval) | 13 |

### Bonus points

| Requirement | Covered by commits |
|-------------|-------------------|
| Authentication | 12 |
| GitHub / commit history | 1–15 (you commit each step) |
| README | 13 |
| Deployment | 14 |
| Containerization | 15 |
| Extra features | Optional follow-ups |

---

## How to use this plan

1. Start with commit **1** — run the scaffold command, verify dev server, then commit.
2. In each follow-up message, ask to implement the next numbered item only.
3. Do not skip ahead; each step builds on the previous.
4. Adjust stack choices (e.g. MongoDB instead of Postgres) before commit 2 if desired.
5. **Bonus commits 12–15** can be skipped if time-constrained; core deliverable is commits **1–11** plus **13** (README).
6. You handle GitHub remote setup and `git push` — this plan only defines commit contents and messages.
