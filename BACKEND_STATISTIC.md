# nograder — Admin Statistics Backend (Claude Code handoff)

You are building the **backend + wiring** for the admin statistics dashboard in `nograder`. The frontend already exists (`components/AdminStats.jsx`); it currently reads from a hard-coded `ADMIN_COHORT` and deterministic pseudo-random generators. Your job is to **replace the mock with real data from a database + API** and keep the UI working exactly as-is.

---

## 1. Context — read these first

- `CLAUDE.md` — design system rules (don't touch tokens / palette / fonts)
- `nograder.html` — app shell, routing, tweak protocol
- `styles.css` — all CSS tokens
- `data.js` — the mock data shape the UI currently consumes. **This is the contract.** Your API responses must deserialize into this shape (plus a few new fields).
- `components/AdminStats.jsx` — the admin dashboard. All cards/sections the backend must feed:
  1. **Overview strip** — class average, student count, total submissions, at-risk count, star-student count
  2. **Per-problem picker** — per-problem average score
  3. **Score distribution histogram** — 11 buckets (0, 1–10, 11–20, …, 81–99, 100) for a selected problem
  4. **Testcase pass-rate heatmap** — % of class that passed each of the N testcases for the selected problem
  5. **Student scatter** — submissions (x) × average score (y) per student
  6. **Cohort table** — sortable roster (name, section, avg, submissions, last active)
  7. **14-day trend chart** — per-day submission count + per-day average score

---

## 2. Tech stack

- **Runtime:** Node.js 20+, TypeScript
- **Framework:** Fastify (or Express if you prefer) with Zod for request/response validation
- **DB:** PostgreSQL 16, accessed via `pg` or Drizzle ORM
- **Auth:** JWT bearer tokens; a middleware `requireAdmin` that 403s non-admin roles
- **Judge integration:** the grader already writes `submissions` + `testcase_results` rows; do not rewrite the judge, only read from it
- **Caching:** Redis for computed aggregates (5-minute TTL on histograms + heatmaps)

---

## 3. Database schema (add / assume)

Assume these tables already exist from the main grader:

```sql
users          (id, handle, name, email, role, section, created_at)
problems       (id, num, name, topic, difficulty, score_max, testcase_count, created_at)
submissions    (id, user_id, problem_id, verdict, score, lang, runtime_ms, mem_kb, submitted_at)
testcase_results (id, submission_id, testcase_idx, passed, runtime_ms, mem_kb)
```

Add if missing:

```sql
-- materialized aggregates, refreshed every 5 min by a cron worker
CREATE MATERIALIZED VIEW problem_stats AS
  SELECT
    problem_id,
    COUNT(*)                            AS submission_count,
    AVG(score)                          AS avg_score,
    COUNT(*) FILTER (WHERE score = 100) AS full_marks,
    COUNT(*) FILTER (WHERE score = 0)   AS zeros
  FROM submissions
  GROUP BY problem_id;

CREATE MATERIALIZED VIEW student_stats AS
  SELECT
    u.id              AS user_id,
    u.handle, u.name, u.section,
    COUNT(s.id)       AS submission_count,
    AVG(s.score)      AS avg_score,
    MAX(s.submitted_at) AS last_submitted_at
  FROM users u
  LEFT JOIN submissions s ON s.user_id = u.id
  WHERE u.role = 'student'
  GROUP BY u.id;
```

Indexes required:
- `submissions(problem_id, submitted_at)`
- `submissions(user_id, submitted_at)`
- `testcase_results(submission_id)`

---

## 4. API — endpoints to build

All endpoints are `GET`, prefixed `/api/admin/stats`, require `requireAdmin`, and accept an optional `?section=CPE24%2Fa` filter.

### 4.1 `GET /api/admin/stats/overview`
```ts
{
  classAverage: number,      // 0..100, 1 decimal
  studentsEnrolled: number,
  totalSubmissions: number,
  atRiskCount: number,       // students with avg_score < 60
  starStudentCount: number   // students with avg_score >= 90
}
```

### 4.2 `GET /api/admin/stats/problems`
Returns the list that feeds the per-problem picker strip.
```ts
Array<{
  id: string,
  num: string,           // "a68_q4a"
  name: string,
  difficulty: "Easy"|"Medium"|"Hard"|"Extra",
  avgScore: number,      // 0..100
  submissionCount: number
}>
```

### 4.3 `GET /api/admin/stats/problems/:id/distribution`
Returns the 11-bucket score histogram for one problem.
```ts
{
  problemId: string,
  buckets: [  // length 11, counts per bucket
    { label: "0",     min: 0,   max: 0,   count: number },
    { label: "1-10",  min: 1,   max: 10,  count: number },
    // ... up to
    { label: "100",   min: 100, max: 100, count: number }
  ],
  n: number,             // total submissions (sum of buckets)
  avgScore: number,
  fullMarks: number,
  zeros: number
}
```
Bucket boundaries (inclusive): `[0,0], [1,10], [11,20], [21,30], [31,40], [41,50], [51,60], [61,70], [71,80], [81,99], [100,100]`. Use **each user's best submission**, not every attempt (pass `?mode=best|latest|all`, default `best`).

### 4.4 `GET /api/admin/stats/problems/:id/testcase-rates`
```ts
{
  problemId: string,
  testcaseCount: number,
  rates: number[]   // length = testcaseCount, each 0..1
}
```
`rates[i]` = `pass_count / total_submissions` for testcase index `i`.

### 4.5 `GET /api/admin/stats/cohort`
Feeds both the scatter plot and the roster table.
```ts
Array<{
  userId: string,
  handle: string,
  name: string,
  section: string,
  avgScore: number,        // 0..100
  submissionCount: number,
  lastSubmittedAt: string  // ISO8601, nullable
}>
```

### 4.6 `GET /api/admin/stats/trend?days=14`
```ts
{
  days: number,
  points: Array<{
    date: string,            // "2026-04-11"
    submissionCount: number,
    avgScore: number         // 0..100, null if no submissions that day
  }>
}
```

### 4.7 `GET /api/admin/stats/export.csv`
Streams a CSV of the cohort table (one row per student, same columns). Content-Disposition `attachment`. This backs the "Export CSV" button in the page header.

---

## 5. Frontend wiring

In `components/AdminStats.jsx`:

1. Delete the `ADMIN_COHORT` constant and the `makeBuckets` / `makeTestcaseRates` helpers.
2. Add a small fetch layer at the top of the file:
   ```js
   async function api(path, opts) {
     const token = localStorage.getItem("ng_admin_jwt");
     const res = await fetch(`/api/admin/stats${path}`, {
       ...opts,
       headers: { Authorization: `Bearer ${token}`, ...(opts?.headers || {}) },
     });
     if (!res.ok) throw new Error(await res.text());
     return res.json();
   }
   ```
3. Replace each card's data source with a `useEffect + useState` pair:
   - `AdminStats` fetches overview, problems, cohort, trend on mount + when `section` changes
   - `HistogramCard` + `TestcaseHeatmapCard` fetch on `selectedId` change
4. Add a loading skeleton per card (use `kraft` background + shimmer). **Never** render empty states with "no data" — always show the skeleton until the response arrives.
5. Keep all class names, layout, spacing, colors identical. The design is signed off.

---

## 6. Performance budget

- Overview + problems + cohort + trend in **parallel** on mount (Promise.all). Target first-meaningful-paint on the stats page < 800 ms on a warm Redis.
- Histograms + testcase rates computed from the materialized views + Redis cache; direct SQL fallback if cache miss.
- Cohort endpoint paginates only if the class exceeds 500 students (current max is ~200, so return everything).

---

## 7. Security

- `requireAdmin` middleware rejects non-admin JWTs with 403
- Rate limit admin endpoints at 60 req/min/IP
- Never leak raw email addresses — only `handle`, `name`, `section`
- CSV export streams through the same auth; don't add a separate signed-URL flow

---

## 8. Tests (required before merge)

- **Unit:** one test per endpoint shape (Zod schema round-trip)
- **Integration:** seed 50 users × 10 problems × ~8 submissions each, assert:
  - `/overview.classAverage` matches a hand-computed average
  - `/problems/:id/distribution.buckets` sums to `n`
  - `/cohort` returns exactly 50 rows (or filtered count with `?section=`)
- **Smoke:** Playwright run against the live page — visit `/stats`, assert the histogram SVG has 11 `<rect>` bars, the testcase heatmap has 10 rows, and the scatter has one `<circle>` per student.

---

## 9. Non-goals (don't do)

- **Don't** redesign the admin UI. Every color, font size, and border radius is already signed off in `CLAUDE.md`.
- **Don't** add new charts. If the product wants more later, we'll spec them separately.
- **Don't** move data fetching into a state manager (Redux/Zustand). Plain `useEffect` is fine for this page.
- **Don't** touch the student-facing pages (`Dashboard`, `ProblemPage`, `Submissions`, `HallOfFame`).

---

## 10. Definition of done

- [ ] All 7 endpoints live, typed, tested
- [ ] Materialized views + Redis cache + 5-min refresh cron
- [ ] `AdminStats.jsx` reads exclusively from `/api/admin/stats/*`
- [ ] CSV export works from the "Export CSV" button
- [ ] `requireAdmin` blocks student JWTs
- [ ] Playwright smoke passes
- [ ] Stats page renders correctly at 1440×900 and 1280×800 — visually identical to the current mock
