-- ENVIS — Supabase schema setup
-- Run this in the Supabase dashboard → SQL Editor → New query → Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE where possible).

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES — one row per user, auto-created on signup
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                 uuid primary key references auth.users on delete cascade,
  email              text,
  full_name          text,
  location           text,        -- city / state / country, for localizing search
  preferred_language text,
  household_size     int,
  income_band        text,        -- a rough band, never an exact figure
  situations         jsonb,       -- e.g. ["Have children","Unemployed"]
  about              text,        -- free-text "anything else we should know"
  created_at         timestamptz not null default now()
);

-- For databases created before the profile fields existed:
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists preferred_language text;
alter table public.profiles add column if not exists household_size int;
alter table public.profiles add column if not exists income_band text;
alter table public.profiles add column if not exists situations jsonb;
alter table public.profiles add column if not exists about text;

alter table public.profiles enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- 2. THREADS — one per analyzed document; holds its own memory
-- ─────────────────────────────────────────────────────────────
create table if not exists public.threads (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users on delete cascade,
  title              text not null default 'New document',
  category           text not null default 'other',
  document_text      text,
  document_image_url text,
  annotations        jsonb,
  meta               jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- For databases created before these columns existed:
alter table public.threads add column if not exists annotations jsonb;
alter table public.threads add column if not exists meta jsonb;

alter table public.threads enable row level security;

drop policy if exists "threads_own" on public.threads;
create policy "threads_own" on public.threads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists threads_user_updated_idx
  on public.threads (user_id, updated_at desc);

-- ─────────────────────────────────────────────────────────────
-- 3. MESSAGES — the conversation memory for each thread
-- ─────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.threads on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "messages_own" on public.messages;
create policy "messages_own" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists messages_thread_created_idx
  on public.messages (thread_id, created_at);

-- ─────────────────────────────────────────────────────────────
-- 3b. REMINDERS & TODOS — the advisor can create these as tools
-- ─────────────────────────────────────────────────────────────
create table if not exists public.reminders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  thread_id   uuid references public.threads on delete set null,
  title       text not null,
  due_date    text,
  urgency     text not null default 'medium' check (urgency in ('high', 'medium', 'low')),
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.reminders enable row level security;
drop policy if exists "reminders_own" on public.reminders;
create policy "reminders_own" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists reminders_user_idx on public.reminders (user_id, created_at desc);

create table if not exists public.todos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  thread_id   uuid references public.threads on delete set null,
  task        text not null,
  rationale   text,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.todos enable row level security;
drop policy if exists "todos_own" on public.todos;
create policy "todos_own" on public.todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists todos_user_idx on public.todos (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 4. AUTO-CREATE A PROFILE WHEN A USER SIGNS UP
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
