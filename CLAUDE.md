@AGENTS.md

# NoGrader — Project Blueprint

> **Purpose:** This file is the single source of truth for building NoGrader, a full-stack online code execution and grading platform. It is written for an AI coding agent (Sonnet) to follow step-by-step. Read this entire document before writing any code.

---

## 1. Project Overview

**NoGrader** is a competitive programming judge (like LeetCode/DMOJ) where users sign up, solve algorithmic problems in a Monaco code editor, and receive instant verdicts from a self-hosted Judge0 instance. The platform tracks scores, maintains a leaderboard, and provides an admin interface for problem management.

### Core User Flows

1. **Guest** → Browses problems list and leaderboard (read-only)
2. **Authenticated User** → Solves problems, views their submissions, climbs the leaderboard
3. **Admin** → Creates/edits/deletes problems and test cases, views all submissions

### Live Infrastructure

| Service | URL | Notes |
|---------|-----|-------|
| Judge0 API | `https://nograder.dev` | Self-hosted via Cloudflare Tunnel, port 2358 locally |
| Web App | `https://web.nograder.dev` | Next.js on port 3000, tunneled via Cloudflare |
| Supabase | Cloud-hosted | Auth + PostgreSQL + RLS |

---

## 2. Tech Stack (Locked — Do Not Substitute)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x (see `AGENTS.md` — read Next.js docs in `node_modules/next/dist/docs/` before writing any code) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x (uses `@theme inline` blocks in CSS, NOT `tailwind.config.js`) |
| UI Components | Custom (shadcn-style) | Located in `src/components/ui/` |
| Code Editor | Monaco Editor | `@monaco-editor/react` |
| Resizable Panels | `react-resizable-panels` | For split-screen editor layout |
| Auth & Database | Supabase (Auth + PostgreSQL + RLS) | `@supabase/ssr` + `@supabase/supabase-js` |
| Code Execution | Judge0 CE | v1.13.1, self-hosted |
| Validation | Zod | 4.x |
| Icons | Lucide React | `lucide-react` |
| Fonts | Space Grotesk (sans) + JetBrains Mono (mono) | Google Fonts via CSS import |

---

## 3. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=          # Server-only, for admin operations

# Judge0
JUDGE0_URL=https://nograder.dev     # Base URL, NO trailing slash
JUDGE0_API_KEY=                     # Optional: RapidAPI key (for hosted Judge0)
JUDGE0_API_HOST=                    # Optional: RapidAPI host header
```

**Rules:**
- `JUDGE0_URL` is server-only (no `NEXT_PUBLIC_` prefix) — never expose it to the client
- All Judge0 calls happen server-side in API routes
- Supabase URL and anon key are public; service role key is server-only

---

## 4. Project Architecture & Folder Structure

```
grader/
├── CLAUDE.md                          # This file
├── AGENTS.md                          # Next.js version warning
├── middleware.ts                       # Supabase session refresh
├── config.yml                         # Cloudflare Tunnel config
├── judge0-v1.13.1/                    # Self-hosted Judge0 Docker config
│   └── judge0.conf
├── supabase/
│   └── grader_schema.sql              # Complete DB schema + RLS + triggers
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout: fonts, SiteHeader, dark bg
│   │   ├── page.tsx                   # Landing page (hero + feature cards)
│   │   ├── globals.css                # Tailwind + CSS variables + custom theme
│   │   ├── auth/
│   │   │   └── page.tsx               # Login / Signup toggle form
│   │   ├── problems/
│   │   │   ├── page.tsx               # Problem list (table with difficulty badges)
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Problem detail: description + editor + console
│   │   ├── submissions/
│   │   │   ├── page.tsx               # All submissions list (filterable)
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Single submission detail (code + verdict)
│   │   ├── leaderboard/
│   │   │   └── page.tsx               # Ranked user table
│   │   ├── admin/
│   │   │   └── problems/
│   │   │       └── new/
│   │   │           └── page.tsx       # Create problem form
│   │   └── api/
│   │       ├── grade/
│   │       │   └── route.ts           # POST: grade submission against all test cases
│   │       ├── submissions/
│   │       │   └── grade/
│   │       │       └── route.ts       # Legacy/alternate grade endpoint
│   │       └── admin/
│   │           └── problems/
│   │               └── route.ts       # POST: create problem + test cases (admin only)
│   ├── components/
│   │   ├── site-header.tsx            # Sticky nav with auth state
│   │   ├── auth-form.tsx              # Email/password form (login + signup modes)
│   │   ├── problem-list.tsx           # Problem table component
│   │   ├── problem-editor.tsx         # Monaco + console split-screen
│   │   ├── dashboard-submissions.tsx  # Recent submissions table on problem page
│   │   ├── leaderboard-table.tsx      # Leaderboard rankings
│   │   ├── admin-problem-form.tsx     # Problem creation form
│   │   └── ui/                        # Base UI primitives (shadcn-style)
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   └── lib/
│       ├── constants.ts               # Language map, starter code, status codes
│       ├── types.ts                   # TypeScript types (Problem, TestCase, etc.)
│       ├── judge0.ts                  # Judge0 HTTP helper (runJudge0, mapStatus)
│       ├── utils.ts                   # normalizeOutput, cn, etc.
│       └── supabase/
│           ├── client.ts              # Browser client (createBrowserClient)
│           ├── server.ts              # Server client (createServerClient + cookies)
│           ├── admin.ts               # Admin client (service role key, no RLS)
│           └── middleware.ts          # Session refresh middleware helper
```

---

## 5. Database Schema

The database uses **Supabase PostgreSQL** with Row Level Security (RLS). The complete schema is in `supabase/grader_schema.sql`. Here is the logical model:

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
| `is_sample` | boolean | Default false (sample cases are shown to users) |
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

## 6. API Contracts

### 6.1 `POST /api/grade` — Grade a Submission

**Purpose:** Receives user code, runs it against all test cases via Judge0, records the submission, returns the verdict.

**Auth:** Requires authenticated Supabase session (checked via `supabase.auth.getUser()`).

**Request Body:**
```json
{
  "problemId": 1,
  "code": "print(int(input()) + int(input()))",
  "languageId": 71
}
```

**Validation:** Zod schema — `problemId` (positive int), `code` (non-empty string), `languageId` (int).

**Server Logic:**
1. Verify user is authenticated
2. Fetch problem (points, time_limit, memory_limit) using admin client
3. Fetch all test cases for the problem using admin client (test cases are hidden from RLS)
4. For each test case, sequentially:
   a. POST to Judge0: `${JUDGE0_URL}/submissions?base64_encoded=false` (async, returns token)
   b. Poll `${JUDGE0_URL}/submissions/${token}?base64_encoded=false` until status is not processing (max 25 polls, 1s interval)
   c. Compare normalized stdout to expected output
   d. On first failure (WA/TLE/RE/CE), stop and record the failure status
5. Calculate score: `Math.round((problem.points * passed) / total)`
6. Insert submission into DB via admin client (triggers auto-update `user_problem_stats` and `profiles`)
7. Return verdict

**Success Response (200):**
```json
{
  "status": "AC",
  "score": 100,
  "passed": 5,
  "total": 5
}
```

**Failure Response (200 with non-AC status):**
```json
{
  "status": "WA",
  "score": 60,
  "passed": 3,
  "total": 5,
  "message": "Wrong Answer on test case 4"
}
```

**Error Responses:**
- `401` — Not authenticated
- `404` — Problem not found
- `400` — No test cases / invalid request
- `503` — Judge0 offline (submission still recorded with status `JUDGE0_OFFLINE`)
- `500` — Internal error

### 6.2 `POST /api/admin/problems` — Create a Problem (Admin)

**Auth:** Requires authenticated user with `is_admin = true`.

**Request Body:**
```json
{
  "title": "A+B Problem",
  "slug": "a-plus-b",
  "description": "Given two integers, output their sum.",
  "constraints": "1 <= A, B <= 10^9",
  "difficulty": "Easy",
  "points": 100,
  "time_limit": 2,
  "memory_limit": 256,
  "testCases": [
    { "input": "1 2", "expected_output": "3", "is_sample": true },
    { "input": "100 200", "expected_output": "300", "is_sample": false }
  ]
}
```

### 6.3 Judge0 Integration Details

**Submission payload sent to Judge0:**
```json
{
  "source_code": "<user code>",
  "language_id": 71,
  "stdin": "<test case input>",
  "cpu_time_limit": 2,
  "memory_limit": 262144
}
```

**Notes:**
- `memory_limit` is sent in **KB** to Judge0 (DB stores MB, multiply by 1024)
- `base64_encoded=false` — we send plain text, not base64
- The grading flow uses **async submit + poll** (not `?wait=true`) for reliability
- Judge0 status IDs 1 and 2 mean "In Queue" and "Processing" — keep polling
- Status mapping: `Accepted` → AC, `Wrong Answer` → WA, `Time Limit Exceeded` → TLE, `Compilation Error` → CE, `Runtime Error` / `SIGSEGV` → RE

**Supported Languages:**
| Judge0 ID | Language | Monaco Mode |
|-----------|----------|-------------|
| 71 | Python 3 | `python` |
| 54 | C++17 | `cpp` |
| 62 | Java 17 | `java` |

---

## 7. UI/UX Design System

### 7.1 Color Palette (Dark Mode Only)

The app is **dark-mode only**. Colors are defined as CSS variables in `globals.css`:

```
Background:      #090b10  (--background)       — Deep navy-black
Background Soft: #0f131b  (--background-soft)  — Slightly lighter for cards
Foreground:      #eef3ff  (--foreground)        — Near-white text
Muted:           #93a0ba  (--muted)             — Secondary text
Accent:          #22d3ee  (--accent)            — Cyan-400 for highlights, brand
```

**Extended Palette (use Tailwind classes):**
| Purpose | Tailwind Class | Hex |
|---------|---------------|-----|
| Card borders | `border-zinc-800` | ~#27272a |
| Card backgrounds | `bg-zinc-950` or `bg-slate-950` | ~#09090b |
| Hover states | `hover:bg-zinc-800` | ~#27272a |
| Input borders | `border-slate-700` | ~#334155 |
| Input bg | `bg-slate-900` | ~#0f172a |
| Primary button | `bg-blue-600 hover:bg-blue-700` | #2563eb |
| Success (AC) | `text-green-500` | #22c55e |
| Error (RE/CE) | `text-red-500` | #ef4444 |
| Warning (WA/TLE) | `text-amber-500` | #f59e0b |
| Info (score) | `text-blue-400` | #60a5fa |
| Brand accent | `text-cyan-300` | #67e8f9 |

**Background Effects:**
The body has layered radial gradients for a subtle glow effect:
- Cyan glow at top-left (15%, -20%)
- Emerald glow at bottom-right (85%, 120%)

### 7.2 Typography

| Element | Font | Tailwind Class |
|---------|------|---------------|
| Body / UI text | Space Grotesk | `font-sans` (set in `@theme inline`) |
| Code / terminal | JetBrains Mono | `font-mono` (set in `@theme inline`) |
| Hero heading | Space Grotesk | `text-4xl md:text-5xl font-black tracking-tight` |
| Section labels | Space Grotesk | `text-sm uppercase tracking-[0.2em] text-cyan-300` |
| Nav links | Space Grotesk | `text-sm text-zinc-300` |
| Code editor | JetBrains Mono 14px | Monaco `fontSize: 14` option |

### 7.3 Layout Rules

#### Global Layout
- **Max width:** `max-w-6xl` centered with `mx-auto px-6`
- **Header:** Sticky top, `bg-zinc-950/80 backdrop-blur`, border-bottom `border-zinc-800/70`
- **Main content:** `flex flex-1 flex-col` to fill viewport height
- **No footer** — minimal design

#### Problem Page Layout (Split-Screen)
The problem page (`/problems/[id]`) uses a **horizontal split-screen**:
- **Left panel (60%):** Monaco code editor with dark theme
- **Right panel (40%):** Console/terminal output area
- **Resize handle:** Draggable via `react-resizable-panels`, styled `bg-slate-800`
- **Toolbar above editor:** Language selector dropdown + "Run Code" button
- **Total height:** `h-[80vh]` with `overflow-hidden`

#### Problem Detail Page Structure
The problem detail page should display:
1. **Problem description section** — Title, difficulty badge, points, time/memory limits, description (Markdown), constraints, sample test cases
2. **Editor section** — The split-screen `ProblemEditor` component
3. **Submissions section** — Recent submissions for this problem by the current user (via `DashboardSubmissions`)

#### Card Design
- Border: `border-zinc-800`
- Background: `bg-gradient-to-br from-zinc-950 via-zinc-900` (hero) or flat `bg-zinc-950`
- Shadow: `shadow-[0_0_40px_rgba(34,211,238,0.12)]` for hero card
- Rounded: `rounded-2xl` (hero) or `rounded-xl` (standard)

#### Difficulty Badges
| Difficulty | Colors |
|-----------|--------|
| Easy | `bg-green-500/10 text-green-400 border-green-500/20` |
| Medium | `bg-amber-500/10 text-amber-400 border-amber-500/20` |
| Hard | `bg-red-500/10 text-red-400 border-red-500/20` |

### 7.4 Component Patterns

#### Buttons
- **Primary:** `bg-blue-600 text-white hover:bg-blue-700 font-semibold`
- **Outline:** `border border-zinc-700 text-zinc-300 hover:bg-zinc-800`
- **Loading state:** Spinner (animated border) + "Running..." text

#### Tables
- Use `<Table>` component from `src/components/ui/table.tsx`
- Header: `bg-zinc-900/50 text-zinc-400 text-xs uppercase tracking-wider`
- Rows: `border-b border-zinc-800/50 hover:bg-zinc-900/30`

#### Forms / Inputs
- Background: `bg-slate-900`
- Border: `border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600`
- Text: `text-slate-200`
- Label: `text-sm font-medium text-zinc-300`

#### Console/Terminal Panel
- Background: `bg-black`
- Header bar: `bg-slate-900/50` with terminal icon + "CONSOLE" label
- Text: `font-mono text-sm leading-relaxed`
- Idle state: `text-slate-500` "Ready to run. Output will appear here..."
- Loading state: `animate-pulse text-blue-400` "Executing..."

---

## 8. Supabase Client Patterns

### Three client types (already implemented in `src/lib/supabase/`):

1. **Browser Client** (`client.ts`) — `createBrowserClient()` for client components
   - Uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Subject to RLS policies

2. **Server Client** (`server.ts`) — `createServerClient()` for server components and server actions
   - Reads/writes cookies for session management
   - Subject to RLS policies
   - Must `await cookies()` first

3. **Admin Client** (`admin.ts`) — `createClient()` with service role key
   - Bypasses RLS — use for grading (reading test cases) and recording submissions
   - **Never expose to client code**

### Middleware (`middleware.ts`)
- Refreshes Supabase auth session on every request
- Matcher excludes static files and images

---

## 9. Auth Flow

**Provider:** Supabase Auth with email/password (no OAuth for now).

### Signup Flow
1. User fills email + password + username on `/auth?mode=signup`
2. Call `supabase.auth.signUp({ email, password, options: { data: { username } } })`
3. Supabase creates `auth.users` row → trigger auto-creates `profiles` row
4. Redirect to `/problems`

### Login Flow
1. User fills email + password on `/auth?mode=login`
2. Call `supabase.auth.signInWithPassword({ email, password })`
3. Redirect to `/problems`

### Sign Out
- Server Action in `SiteHeader` calls `supabase.auth.signOut()`
- Header conditionally renders Sign Out button or Login/Signup buttons based on `getUser()`

### Protected Routes
- The editor's submit button calls `/api/grade` which checks auth server-side
- No client-side route guards needed — unauthenticated users see the UI but get 401 on submit
- Admin routes check `profiles.is_admin` server-side

---

## 10. Key Implementation Constraints

1. **Next.js version:** This project uses Next.js 16. Always read `node_modules/next/dist/docs/` for current API. Do NOT assume Next.js 14/15 patterns work.

2. **Tailwind v4:** Uses `@theme inline` blocks in CSS, not `tailwind.config.js`. Use `@import "tailwindcss"` instead of `@tailwind` directives.

3. **No Prisma:** Despite being in the original spec, this project uses **Supabase client SDK** directly (not Prisma). Do not add Prisma.

4. **No NextAuth.js:** Auth is handled by **Supabase Auth**, not NextAuth. Do not add NextAuth.

5. **Zod v4:** Import from `zod` (v4 API). Check for breaking changes vs v3.

6. **Judge0 calls are server-only:** All Judge0 API calls go through `/api/grade` route. The client never calls Judge0 directly.

7. **Output normalization:** When comparing Judge0 stdout to expected output, trim trailing whitespace/newlines from both sides before comparing. Use `normalizeOutput()` from `utils.ts`.

8. **Sequential test case execution:** Test cases are run one at a time (not batched). On first failure, stop and return the failure status. Score is proportional to passed count.

9. **Admin operations use service role key:** Admin client bypasses RLS. Always verify `is_admin` before using admin client in API routes.

10. **`"use client"` directive:** Only add to components that use React hooks, browser APIs, or event handlers. Server Components are the default.

---

## 11. Implementation Phases

### Phase 1: Foundation & Auth ✅ (Already Done)
- [x] Next.js project scaffolding with App Router
- [x] Tailwind CSS v4 with custom dark theme
- [x] Supabase client setup (browser, server, admin, middleware)
- [x] Database schema with RLS and triggers
- [x] Auth form (login/signup with email/password)
- [x] Site header with auth-aware navigation
- [x] Landing page with hero + feature cards

### Phase 2: Core Problem Infrastructure ✅ (Already Done)
- [x] Problem list page (`/problems`)
- [x] Problem detail page with Monaco editor (`/problems/[id]`)
- [x] Split-screen editor with resizable panels
- [x] Language selector (Python, C++, Java)
- [x] Judge0 integration with async submit + poll
- [x] Grading API route (`/api/grade`)
- [x] Admin problem creation page + API

### Phase 3: Submissions & Leaderboard ✅ (Already Done)
- [x] Submissions list page (`/submissions`)
- [x] Single submission detail page (`/submissions/[id]`)
- [x] Dashboard submissions on problem page
- [x] Leaderboard page with ranked users

### Phase 4: Polish & Enhancements (Next)
- [ ] **Problem description Markdown rendering** — Render problem descriptions with proper Markdown (code blocks, math, tables). Use a lightweight Markdown library.
- [ ] **Sample test cases display** — Show `is_sample = true` test cases on the problem page so users can see example inputs/outputs before coding
- [ ] **Submission detail improvements** — Show code with syntax highlighting, execution time, memory usage, per-test-case results
- [ ] **Admin problem editing** — Edit existing problems and test cases (currently only creation exists)
- [ ] **Admin problem list** — View/manage all problems with publish/unpublish toggle
- [ ] **User profile page** — Show user's solved problems, submission history, score breakdown
- [ ] **Better error messages in console** — Show compilation errors, runtime errors with line numbers when possible
- [ ] **Mobile responsiveness** — The editor is desktop-focused; add responsive breakpoints for problem description (stack vertically on mobile)

### Phase 5: Advanced Features (Future)
- [ ] **Custom test case runner** — Let users test against their own input before submitting
- [ ] **Submission history per problem** — Show all attempts for a specific problem
- [ ] **Problem tags/categories** — Filter problems by topic (DP, graphs, sorting, etc.)
- [ ] **Contest mode** — Time-limited problem sets with separate leaderboard
- [ ] **Code templates per language** — Better starter code with input parsing boilerplate
- [ ] **Rate limiting** — Prevent submission spam (e.g., max 1 submission per 5 seconds)
- [ ] **WebSocket for Judge0** — Replace polling with real-time status updates

---

## 12. File-by-File Reference for Existing Code

When modifying existing files, always read them first. Here is what each key file does:

| File | Purpose |
|------|---------|
| `src/lib/constants.ts` | Judge0 language map (ID → label + Monaco mode), starter code templates, submission status enum |
| `src/lib/types.ts` | TypeScript types for Problem, TestCase, Profile, Submission |
| `src/lib/judge0.ts` | `runJudge0()` helper (simple wait mode) and `mapJudge0Status()` — **Note:** `/api/grade/route.ts` has its own inline implementation with polling instead |
| `src/lib/utils.ts` | `normalizeOutput()` for trimming whitespace, `cn()` for className merging |
| `src/components/problem-editor.tsx` | Client component: Monaco editor + console panel + submit logic. Calls `/api/grade` |
| `src/components/site-header.tsx` | Server component: sticky nav, auth-aware (shows login/signup or sign-out) |
| `src/app/api/grade/route.ts` | Main grading endpoint: validates input → fetches problem + test cases → runs each through Judge0 → records submission → returns verdict |

---

## 13. Code Style & Conventions

- **Imports:** Use `@/` path alias (maps to `src/`)
- **Components:** PascalCase filenames, named exports (not default)
- **API routes:** Use `export async function POST(request: Request)` pattern
- **Error handling:** Zod validation at API boundaries, try/catch for external calls (Judge0)
- **State management:** React `useState` for local state, no global state library
- **Data fetching in Server Components:** Call Supabase directly with `await`
- **Data fetching in Client Components:** `fetch()` to internal API routes or `useEffect` with Supabase client
- **No `any` types:** Use proper TypeScript types from `src/lib/types.ts`
- **Tailwind only:** No CSS modules, no styled-components, no inline `style` props (except for CSS variable overrides)
