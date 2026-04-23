# Simple Online Judge (Next.js + Supabase + Judge0)

This project is a simple online judge web app for coding practice with friends.

## Tech Stack

- Next.js App Router
- Tailwind CSS
- Supabase (Auth + PostgreSQL)
- Judge0 API for code execution
- Monaco Editor

## Core Features Included

- Login/Signup with Supabase Auth
- Problem list and problem detail page
- Code editor with language selection (Python, C++, Java)
- Submission grading through Judge0
- Leaderboard (Hall of Fame)
- Submission history + submission detail viewer
- Admin page to create new problems and test cases

## 1) Install

```bash
npm install
```

## 2) Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JUDGE0_URL`
- `JUDGE0_API_KEY` (if using RapidAPI)
- `JUDGE0_API_HOST` (if using RapidAPI)

## 3) Setup Supabase Schema

Run SQL in `supabase/schema.sql` inside Supabase SQL Editor.

This creates:

- `profiles`
- `problems`
- `test_cases`
- `submissions`
- `user_problem_stats`

And includes:

- auto profile creation trigger on signup
- score aggregation trigger after each submission
- RLS policies

## 4) Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.

## 5) Admin Access

To create problems, your user must have admin role:

```sql
update public.profiles set is_admin = true where id = '<your-user-uuid>';
```

Then go to `/admin/problems/new`.

## 6) Vercel Deployment

1. Push repository to GitHub.
2. Import project in Vercel.
3. Add the same environment variables in Vercel settings.
4. Deploy.

## Notes

- Grading endpoint runs on server and uses service role for secure test case access.
- `test_cases` table is private to admins by RLS.
- Judge0 language ids currently used:
	- Python 3: `71`
	- C++17: `54`
	- Java 17: `62`
