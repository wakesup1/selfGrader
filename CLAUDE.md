@AGENTS.md

# NoGrader — Project Blueprint

> **Purpose:** This file is the single source of truth for building NoGrader, a full-stack online code execution and grading platform. It is written for an AI coding agent (Sonnet 4.6) to follow step-by-step. Read this entire document before writing any code.

---

## 1. Project Overview

**NoGrader** is a competitive programming judge (like LeetCode/DMOJ) where users sign up, solve algorithmic problems in a Monaco code editor, and receive instant verdicts from a self-hosted Judge0 instance. The platform tracks scores, maintains a leaderboard, and provides an admin interface for problem management.

### Core User Flows

1. **Guest** → Browses problems list and leaderboard (read-only)
2. **Authenticated User** → Solves problems, views their submissions, climbs the leaderboard
3. **Admin** → Creates/edits/deletes problems and test cases, views all submissions

### Live Infrastructure

| Service | URL | Internal (server-to-server) | Notes |
|---------|-----|----------------------------|-------|
| Judge0 API | `https://api.nograder.dev` | `http://localhost:2358` | Self-hosted via Cloudflare Tunnel |
| Web App | `https://web.nograder.dev` | `http://localhost:3000` | Next.js via Cloudflare Tunnel |
| Supabase | Cloud-hosted | — | Auth + PostgreSQL + RLS |

**CRITICAL:** Server-side code (API routes, services) MUST call Judge0 at `http://localhost:2358` — never through the public tunnel. The public URL exists only for browser-facing links and Cloudflare routing.

---

## 2. Tech Stack (Locked — Do Not Substitute)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x (see `AGENTS.md`) |
| Language | TypeScript | 5.x |
| Styling | Custom CSS variables + Tailwind CSS | 4.x (`@theme inline` blocks, NOT `tailwind.config.js`) |
| UI Components | Custom cafe-themed components | `src/components/` |
| Code Editor | Monaco Editor | `@monaco-editor/react` |
| Auth & Database | Supabase (Auth + PostgreSQL + RLS) | `@supabase/ssr` + `@supabase/supabase-js` |
| Code Execution | Judge0 CE | v1.13.1, self-hosted |
| Validation | Zod | 4.x |
| Icons | Lucide React | `lucide-react` |
| Fonts | Fraunces (serif) + DM Sans (body) + JetBrains Mono (code) | Via CSS `@import` |

**No Prisma.** The project uses the Supabase SDK directly. Do not add Prisma.

---

## 3. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=          # Server-only, for admin operations

# Judge0
JUDGE0_URL=http://localhost:2358    # Server-only internal URL (NEVER the public tunnel)
JUDGE0_API_KEY=                     # Optional: RapidAPI key (leave blank for self-hosted)
JUDGE0_API_HOST=                    # Optional: RapidAPI host header
NEXT_PUBLIC_JUDGE0_URL=https://api.nograder.dev  # Public URL (for display/links only)

# Site
NEXT_PUBLIC_SITE_URL=https://web.nograder.dev    # Used for Supabase auth email redirects
```

**Rules:**
- `JUDGE0_URL` is `http://localhost:2358` — server-side only, never exposed to client
- `NEXT_PUBLIC_SITE_URL` must match the production domain for auth email redirects to work
- Supabase URL and anon key are public; service role key is server-only

---

## 4. Project Architecture & Folder Structure

```
grader/
├── CLAUDE.md                          # This file — the canonical project blueprint
├── AGENTS.md                          # Next.js version warning
├── middleware.ts                       # Supabase session refresh (delegates to lib/supabase/middleware.ts)
├── config.yml                         # Cloudflare Tunnel config
├── .env                               # Environment variables
├── judge0-v1.13.1/                    # Self-hosted Judge0 Docker config
│   └── judge0.conf
├── supabase/
│   └── grader_schema.sql              # Complete DB schema + RLS + triggers
│
├── src/
│   ├── services/                      # ★ Business logic layer (server-only)
│   │   ├── judge0.ts                  # Judge0 HTTP client: submitCode, pollResult, mapVerdict
│   │   ├── grading.ts                 # Orchestration: run all test cases → persist submission
│   │   └── problems.ts               # Admin CRUD: createProblem, updateProblem, isAdmin
│   │
│   ├── actions/                       # ★ Next.js Server Actions
│   │   ├── auth.ts                    # signIn, signUp, signOut (form actions)
│   │   └── submissions.ts            # gradeCode (alternative to API route)
│   │
│   ├── lib/
│   │   ├── supabase/                  # Supabase client factory
│   │   │   ├── client.ts             # Browser client (createBrowserClient)
│   │   │   ├── server.ts             # Server client (cookies, empty-catch setAll)
│   │   │   ├── admin.ts              # Admin client (service role, bypasses RLS)
│   │   │   └── middleware.ts          # Session refresh (re-creates response in setAll)
│   │   ├── constants.ts               # Language map, starter code, SUBMISSION_STATUS
│   │   ├── types.ts                   # Problem, TestCase, Profile, Submission
│   │   └── utils.ts                   # normalizeOutput, cn, createSlug, STATUS_LABEL
│   │
│   ├── app/
│   │   ├── layout.tsx                 # Root layout: fonts, SiteHeader
│   │   ├── page.tsx                   # Dashboard: hero + submit box + problems table
│   │   ├── globals.css                # Full cafe design system (CSS variables + utility classes)
│   │   ├── auth/page.tsx              # Login/signup form
│   │   ├── problems/
│   │   │   ├── page.tsx               # Problem list with ProblemsTableFull + user stats
│   │   │   └── [id]/page.tsx          # Problem detail: description tabs + editor + testcases
│   │   ├── submissions/
│   │   │   ├── page.tsx               # All submissions with filter tabs
│   │   │   └── [id]/page.tsx          # Receipt-style submission detail + tc rows + code pane
│   │   ├── leaderboard/page.tsx       # Hall of Fame: coffee cards / podium / ledger layouts
│   │   ├── admin/problems/
│   │   │   ├── page.tsx               # Admin problem list
│   │   │   ├── new/page.tsx           # Create problem form
│   │   │   └── [id]/edit/page.tsx     # Edit problem form
│   │   └── api/                       # ★ Thin route handlers (parse → delegate to services)
│   │       ├── grade/route.ts         # POST: parse → gradeSubmission() → respond
│   │       ├── my-submissions/route.ts # GET: user's submissions for a problem
│   │       └── admin/problems/
│   │           ├── route.ts           # POST: createProblem()
│   │           └── [id]/route.ts      # PATCH: updateProblem()
│   │
│   └── components/
│       ├── site-header.tsx            # Sticky nav with auth state + signOut action
│       ├── auth-form.tsx              # Email/password form (uses window.location.href for redirect)
│       ├── problem-editor.tsx         # Monaco + testcase animation panel
│       ├── problem-desc-tabs.tsx      # Problem/examples/submissions tabs
│       ├── problems-table-full.tsx    # Problem table with filters + search + progress bars
│       ├── dashboard-hero.tsx         # Cup illustration + stats
│       ├── dashboard-submit-box.tsx   # File upload + problem selector
│       ├── dashboard-submissions.tsx  # User's recent submissions (client, fetches via API)
│       ├── submissions-list.tsx       # All submissions with filter tabs
│       ├── leaderboard-table.tsx      # Coffee cards / podium / ledger switcher
│       ├── admin-problem-form.tsx     # Create/edit problem form
│       └── ui/                        # Base UI primitives
```

### Architecture Principles

1. **Services** (`src/services/`) contain all business logic. They are server-only, have no HTTP/Next.js dependencies, and return plain objects.
2. **API Routes** (`src/app/api/`) are thin handlers: validate input → check auth → call a service → return JSON.
3. **Server Actions** (`src/actions/`) are the same pattern but callable from client components via `useFormState` or `useTransition`.
4. **Client Components** never import from `src/services/` or `src/lib/supabase/server.ts`. They communicate via API routes or Server Actions.

---

## 5. Database Schema

The database uses **Supabase PostgreSQL** with Row Level Security (RLS). The complete schema is in `supabase/grader_schema.sql`.

### Tables

#### `profiles`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `username` | text | UNIQUE, length 3–30 |
| `total_score` | integer | Default 0, auto-updated by trigger |
| `solved_count` | integer | Default 0, auto-updated by trigger |
| `is_admin` | boolean | Default false |
| `created_at` | timestamptz | Default `now()` |

#### `problems`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | bigserial | PK |
| `title` | text | NOT NULL |
| `slug` | text | UNIQUE |
| `description` | text | NOT NULL (supports Markdown) |
| `constraints` | text | Default '' |
| `difficulty` | text | CHECK: 'Easy', 'Medium', 'Hard' |
| `points` | integer | Default 100, CHECK > 0 |
| `time_limit` | integer | Default 2 (seconds) |
| `memory_limit` | integer | Default 256 (MB) |
| `is_published` | boolean | Default true |
| `created_by` | uuid | FK → `profiles(id)` ON DELETE SET NULL |
| `created_at` | timestamptz | Default `now()` |

#### `test_cases`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | bigserial | PK |
| `problem_id` | bigint | FK → `problems(id)` ON DELETE CASCADE |
| `input` | text | Default '' |
| `expected_output` | text | NOT NULL |
| `is_sample` | boolean | Default false |
| `created_at` | timestamptz | Default `now()` |

#### `submissions`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | bigserial | PK |
| `user_id` | uuid | FK → `profiles(id)` ON DELETE CASCADE |
| `problem_id` | bigint | FK → `problems(id)` ON DELETE CASCADE |
| `code` | text | NOT NULL |
| `language_id` | integer | NOT NULL (Judge0 language ID) |
| `status` | text | NOT NULL (AC, WA, TLE, RE, CE, ERR, JUDGE0_OFFLINE) |
| `score` | integer | Default 0 |
| `passed_count` | integer | Default 0 |
| `total_count` | integer | Default 0 |
| `execution_time` | numeric | Nullable (seconds) |
| `memory` | integer | Nullable (KB) |
| `created_at` | timestamptz | Default `now()` |

#### `user_problem_stats`
| Column | Type | Constraints |
|--------|------|-------------|
| `user_id` | uuid | PK (composite), FK → `profiles(id)` |
| `problem_id` | bigint | PK (composite), FK → `problems(id)` |
| `best_score` | integer | Default 0 |
| `is_solved` | boolean | Default false |
| `solved_at` | timestamptz | Nullable |

### Database Triggers

1. **`on_auth_user_created`** — After INSERT on `auth.users`: auto-creates a `profiles` row with username from metadata or fallback `user_{id_prefix}`
2. **`trg_update_user_stats_after_submission`** — After INSERT on `submissions`: upserts `user_problem_stats` (keeps best score, marks solved), then recalculates `profiles.total_score` and `profiles.solved_count`

### Row Level Security Policies

| Table | Policy | Rule |
|-------|--------|------|
| `profiles` | Select | Public read |
| `problems` | Select | Published problems are public; unpublished visible only to admins |
| `submissions` | Select | Public read |
| `submissions` | Insert | Users can only insert their own (`auth.uid() = user_id`) |
| `user_problem_stats` | Select | Public read |
| `test_cases` | **No public policy** | Only accessible via admin client (service role key) |

---

## 6. Services Layer

### 6.1 `src/services/judge0.ts` — Judge0 HTTP Client

All Judge0 communication goes through this module. No other file should call Judge0 directly.

```
submitCode(payload) → string (token)
pollResult(token)   → Judge0Result
mapVerdict(result)  → "AC" | "WA" | "TLE" | "CE" | "RE" | "ERR"
```

- Uses **async submit + poll** (NOT `?wait=true`) for reliability
- `AbortSignal.timeout(8000)` on every HTTP call
- Maps status by **numeric ID first** (3=AC, 4=WA, 5=TLE, 6=CE, 7-12=RE), string fallback second
- Judge0 status IDs 1 and 2 = "In Queue"/"Processing" — keep polling (max 25 × 1s)

### 6.2 `src/services/grading.ts` — Submission Orchestrator

```
gradeSubmission(req) → { status, score, passed, total, message? }
recordOfflineSubmission(req, totalCount) → void
```

- Fetches problem + test cases via admin client (bypasses RLS)
- Runs test cases sequentially; stops on first failure
- Score = `Math.round((problem.points * passed) / total)`
- Persists submission to DB (triggers update `user_problem_stats` and `profiles`)

### 6.3 `src/services/problems.ts` — Problem CRUD

```
createProblem(input) → number (id)
updateProblem(id, input) → void
isAdmin(userId) → boolean
```

- Admin client for all writes
- Callers MUST verify `isAdmin()` before mutating

---

## 7. API Contracts

### 7.1 `POST /api/grade` — Grade a Submission

Thin handler: parse → auth → `gradeSubmission()` → respond.

**Request:** `{ problemId: number, code: string, languageId: number }`

**Responses:**
- `200` — `{ status, score, passed, total, message? }`
- `401` — Not authenticated
- `404` — Problem not found
- `400` — No test cases / invalid request
- `503` — Judge0 offline (submission recorded with `JUDGE0_OFFLINE`)

### 7.2 `POST /api/admin/problems` — Create Problem

**Auth:** `is_admin = true`

**Request:** `{ title, description, constraints, difficulty, points, time_limit, memory_limit, testCases[] }`

### 7.3 `PATCH /api/admin/problems/[id]` — Update Problem

Same schema as create, plus `is_published: boolean`.

### 7.4 `GET /api/my-submissions?problemId=N` — User's Submissions

Returns `{ submissions: SubmissionRow[] | null }` (null = not authenticated).

---

## 8. Supabase Client Patterns

### Four client types in `src/lib/supabase/`:

| File | Used In | RLS | Cookie Handling |
|------|---------|-----|-----------------|
| `client.ts` | Client components (`"use client"`) | Yes | Browser-managed |
| `server.ts` | Server components, server actions | Yes | Empty try-catch in `setAll` |
| `admin.ts` | Services (grading, problems) | **Bypassed** | None (service role) |
| `middleware.ts` | `middleware.ts` root | Yes | Re-creates `NextResponse` in `setAll` |

### Middleware Cookie Pattern (CRITICAL)

The middleware `setAll` must re-assign `supabaseResponse` inside the callback:

```ts
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
  supabaseResponse = NextResponse.next({ request }); // ← re-create from mutated request
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  );
}
```

Without the re-assignment, refreshed session cookies are lost and users get randomly logged out.

---

## 9. Auth Flow

**Provider:** Supabase Auth with email/password.

### Signup
1. User fills email + password + username on `/auth?mode=signup`
2. `supabase.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: SITE_URL } })`
3. Trigger creates `profiles` row
4. **Hard redirect** via `window.location.href = "/problems"` (NOT `router.push`)

### Login
1. `supabase.auth.signInWithPassword({ email, password })`
2. **Hard redirect** via `window.location.href = "/problems"`

### Why `window.location.href` instead of `router.push`
Next.js App Router soft navigation does not re-run middleware. After setting auth cookies, a hard navigation is required so middleware processes the new session. Without this, users appear logged out after login on production (Cloudflare Tunnel).

### Sign Out
- Server Action: `supabase.auth.signOut()` + `redirect("/")`
- In `site-header.tsx`, used as a form action

### Supabase Dashboard Configuration
The following redirect URLs must be whitelisted in the Supabase Dashboard under Authentication → URL Configuration:
- `https://web.nograder.dev/**`
- `http://localhost:3000/**`

---

## 10. Key Implementation Constraints

1. **Next.js 16:** Read `node_modules/next/dist/docs/` before assuming any API pattern.
2. **Tailwind v4:** `@theme inline` blocks in CSS, not `tailwind.config.js`.
3. **No Prisma:** Supabase SDK only. Do not add Prisma.
4. **No NextAuth:** Supabase Auth only.
5. **Judge0 is localhost:** `JUDGE0_URL=http://localhost:2358`. Never use the public tunnel URL in server code.
6. **Services are the single source of business logic.** API routes and Server Actions are thin wrappers.
7. **Client components never import server-only modules.** If a client component needs data, it fetches from an API route or receives it as props from a server component.
8. **`dashboard-submissions.tsx` is a client component** that fetches via `/api/my-submissions`. It was originally a server component but that caused a build error (imported `server.ts` inside a `"use client"` boundary).
9. **Sequential test case execution.** On first failure, stop. Score is proportional to passed count.
10. **Admin operations use service role key.** Always verify `isAdmin()` from `src/services/problems.ts` before calling any admin service function.

---

## 11. Design System

# nograder — design reference

This is the **finalized design** for the cafe-chill style grading platform.
Before implementing anything, **read these files as the Source of Truth**:

- `nograder.html` — entry point, app shell, routing, tweaks protocol
- `styles.css` — all design tokens (CSS variables), component classes
- `data.js` — data schemas (problems, submissions, hall of fame, announcements, user)
- `components/Shell.jsx` — Topbar, BrandMark, Chip, Progress, Toast, CodePane, CupIllustration
- `components/Dashboard.jsx` — hero + submit box + problems table + announcements
- `components/ProblemPage.jsx` — PDF viewer / tabs / editor / live testcase progress
- `components/Submissions.jsx` — list + receipt-style detail
- `components/HallOfFame.jsx` — 3 layouts (grid / podium / list)
- `components/PostProblem.jsx` — admin form (PDF upload or inline markdown)

## Strict Rules — Do Not Change
- **Palette:** Use CSS variables in `styles.css` (`--bg`, `--ink`, `--sage-dark`, `--amber`, `--clay`, `--kraft`) — default accent = **clay**.
- **Fonts:** Fraunces (display/serif), DM Sans (body 450), JetBrains Mono (code/stats), IBM Plex Sans Thai Looped (Thai language support).
- **Metaphor:** menu / receipt / roast / brewing — consistent tone across all pages.
- **Density:** spacious, 1px lines color `--line`, subtle shadows.
- **Typography Hierarchy:** page-title = Fraunces 56px, card headings = Fraunces 20–26px, kicker = mono 10.5px uppercase tracked.

## Hall of Fame: Default = List, Accent = Clay

## Feature Scope (6 Pages)
1. **Dashboard** — greeting hero, submit box, problem menu (filter by topic/difficulty/search), announcements panel.
2. **Problems** — full menu (reuse `ProblemsTable` from Dashboard).
3. **Problem Detail** — header + your-tab card + PDF viewer (default) or inline statement + editor + 10 testcases with live progress animation.
4. **Submissions** — filters (Brewed/Steeping/Burnt), table, click-through to detail page.
5. **Submission Detail** — receipt header + verdict hero + testcases + code + compiler message.
6. **Hall of Fame** — tweakable via 3 layouts: list (default), podium, and coffee-card grid.
7. **Post Problem** — PDF upload mode (default) or write inline, testcase editor, judging settings, and checklist.

## Required Interactions (Do Not Remove)
- **Submit:** Animate 10 testcases sequentially → display toast verdict.
- **Toast Stack:** Top-right placement, 3 types: ok (sage), wrong (clay), info (amber).
- **Tweaks Panel:** Bottom-right corner. Toggle HoF layout + accent color; must persist via `localStorage`.
- **Navigation:** Nav + view + problem/submission selection must persist via `localStorage`.

## Deployment Guidelines (Porting to Production)
- Replace mock data in `data.js` with actual API calls.
- **Submit Box:** Use real `POST` requests. Utilize SSE/WebSockets for real-time testcase progress.
- **PDF Viewer:** Currently a placeholder — implement using `pdf.js` or `<iframe>`.
- **Styling:** Reuse existing CSS component classes; avoid rewriting styles from scratch.
---

## 12. Code Style & Conventions

- **Imports:** `@/` path alias (maps to `src/`)
- **Components:** PascalCase filenames, named exports
- **API routes:** `export async function POST/GET/PATCH(request: Request)` — thin, delegates to services
- **Error handling:** Zod at API boundaries, try/catch for external calls (Judge0)
- **State management:** `useState` only, no global stores
- **Data fetching in Server Components:** Call Supabase directly with `await`
- **Data fetching in Client Components:** `fetch()` to API routes or `useEffect` with browser Supabase client
- **No `any` types**
- **Styling:** CSS variables + utility classes in `globals.css`, inline `style` props for layout
