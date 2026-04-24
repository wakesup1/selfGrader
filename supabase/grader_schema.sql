create extension if not exists pgcrypto;

-- User profiles for auth and leaderboard
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 30),
  total_score integer not null default 0,
  solved_count integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Coding problems
create table if not exists public.problems (
  id bigserial primary key,
  title text not null,
  slug text unique,
  description text not null,
  constraints text not null default '',
  difficulty text not null default 'Easy' check (difficulty in ('Easy', 'Medium', 'Hard')),
  points integer not null default 100 check (points > 0),
  time_limit integer not null default 2,      -- seconds
  memory_limit integer not null default 256,  -- MB
  is_published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Hidden + sample test cases used for grading
create table if not exists public.test_cases (
  id bigserial primary key,
  problem_id bigint not null references public.problems(id) on delete cascade,
  input text not null default '',
  expected_output text not null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

-- PDF statement URL (nullable — null means inline markdown description is used)
alter table public.problems add column if not exists pdf_url text;

-- Keep older databases compatible with current app schema
alter table public.profiles add column if not exists is_admin boolean not null default false;

alter table public.problems add column if not exists slug text;
alter table public.problems add column if not exists constraints text not null default '';
alter table public.problems add column if not exists difficulty text not null default 'Easy';
alter table public.problems add column if not exists is_published boolean not null default true;
alter table public.problems add column if not exists created_by uuid references public.profiles(id) on delete set null;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'problems_difficulty_check'
      and conrelid = 'public.problems'::regclass
  ) then
    alter table public.problems
      add constraint problems_difficulty_check
      check (difficulty in ('Easy', 'Medium', 'Hard'));
  end if;
end $$;

create unique index if not exists problems_slug_key on public.problems(slug);

alter table public.test_cases add column if not exists is_sample boolean not null default false;

-- Every code submission (includes runtime and memory)
create table if not exists public.submissions (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  problem_id bigint not null references public.problems(id) on delete cascade,
  code text not null,
  language_id integer not null,
  status text not null,
  score integer not null default 0,
  passed_count integer not null default 0,
  total_count integer not null default 0,
  execution_time numeric,
  memory integer,
  created_at timestamptz not null default now()
);

-- Best score per user/problem for stable leaderboard scoring
create table if not exists public.user_problem_stats (
  user_id uuid not null references public.profiles(id) on delete cascade,
  problem_id bigint not null references public.problems(id) on delete cascade,
  best_score integer not null default 0,
  is_solved boolean not null default false,
  solved_at timestamptz,
  primary key (user_id, problem_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.update_user_stats_after_submission()
returns trigger
language plpgsql
as $$
begin
  insert into public.user_problem_stats (user_id, problem_id, best_score, is_solved, solved_at)
  values (
    new.user_id,
    new.problem_id,
    new.score,
    (new.status = 'AC'),
    case when new.status = 'AC' then now() else null end
  )
  on conflict (user_id, problem_id)
  do update set
    best_score = greatest(public.user_problem_stats.best_score, excluded.best_score),
    is_solved = public.user_problem_stats.is_solved or excluded.is_solved,
    solved_at = case
      when public.user_problem_stats.solved_at is null and excluded.is_solved then now()
      else public.user_problem_stats.solved_at
    end;

  update public.profiles p
  set
    total_score = coalesce((
      select sum(best_score) from public.user_problem_stats ups where ups.user_id = p.id
    ), 0),
    solved_count = coalesce((
      select count(*) from public.user_problem_stats ups where ups.user_id = p.id and ups.is_solved = true
    ), 0)
  where p.id = new.user_id;

  return new;
end;
$$;

drop trigger if exists trg_update_user_stats_after_submission on public.submissions;
create trigger trg_update_user_stats_after_submission
after insert on public.submissions
for each row execute function public.update_user_stats_after_submission();

alter table public.profiles enable row level security;
alter table public.problems enable row level security;
alter table public.test_cases enable row level security;
alter table public.submissions enable row level security;
alter table public.user_problem_stats enable row level security;

create policy "profiles readable"
on public.profiles for select
using (true);

create policy "problems readable"
on public.problems for select
using (is_published = true or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
));

create policy "submissions readable"
on public.submissions for select
using (true);

create policy "submissions insert own"
on public.submissions for insert
with check (auth.uid() = user_id);

create policy "stats readable"
on public.user_problem_stats for select
using (true);

-- ── Announcements (chalkboard) ───────────────────────────────────────────────
create table if not exists public.announcements (
  id         bigserial primary key,
  tag        text not null default 'Info',
  title      text not null,
  body       text not null default '',
  pinned     boolean not null default false,
  is_published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy if not exists "announcements readable"
on public.announcements for select
using (
  is_published = true
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- keep updated_at fresh on every edit
create or replace function public.set_announcement_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_announcement_updated_at on public.announcements;
create trigger trg_announcement_updated_at
before update on public.announcements
for each row execute function public.set_announcement_updated_at();

-- ── Storage: problem PDF files ──────────────────────────────────────────────
-- Create the bucket (idempotent)
insert into storage.buckets (id, name, public)
values ('problem-pdfs', 'problem-pdfs', true)
on conflict (id) do nothing;

-- Anyone can read PDFs (problems are publicly visible)
create policy if not exists "problem-pdfs public read"
on storage.objects for select
using (bucket_id = 'problem-pdfs');

-- Only authenticated users (admin check is enforced at the API layer)
create policy if not exists "problem-pdfs admin upload"
on storage.objects for insert
with check (bucket_id = 'problem-pdfs' and auth.role() = 'authenticated');

create policy if not exists "problem-pdfs admin update"
on storage.objects for update
using (bucket_id = 'problem-pdfs' and auth.role() = 'authenticated');

create policy if not exists "problem-pdfs admin delete"
on storage.objects for delete
using (bucket_id = 'problem-pdfs' and auth.role() = 'authenticated');
