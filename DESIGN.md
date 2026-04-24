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
