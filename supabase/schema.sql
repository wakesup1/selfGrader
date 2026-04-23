create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 30),
  total_score integer not null default 0,
  solved_count integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.problems (
  id bigserial primary key,
  title text not null,
  slug text unique not null,
  description text not null,
  constraints text not null default '',
  time_limit integer not null default 2,
  memory_limit integer not null default 256,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  points integer not null default 100 check (points > 0),
  is_published boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.test_cases (
  id bigserial primary key,
  problem_id bigint not null references public.problems(id) on delete cascade,
  input text not null default '',
  expected_output text not null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

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

create policy "profiles are viewable by everyone"
on public.profiles for select
using (true);

create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "published problems readable by everyone"
on public.problems for select
using (
  is_published = true
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

create policy "admins can insert problems"
on public.problems for insert
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "admins can update problems"
on public.problems for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "only admins can read test cases"
on public.test_cases for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "admins manage test cases"
on public.test_cases for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "anyone can view submissions list"
on public.submissions for select
using (true);

create policy "users can insert own submission"
on public.submissions for insert
with check (auth.uid() = user_id);

create policy "stats readable by everyone"
on public.user_problem_stats for select
using (true);
