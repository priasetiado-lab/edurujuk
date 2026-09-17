create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

create table if not exists public.question_history (
  id uuid primary key default gen_random_uuid(),
  client_name text not null default 'Anonymous',
  question_id text,
  question_text text not null,
  answer_text text not null,
  question_type text not null check (question_type in ('auto','manual')),
  created_at timestamptz not null default now()
);

create table if not exists public.manual_questions (
  id uuid primary key default gen_random_uuid(),
  client_name text not null default 'Anonymous',
  question text not null,
  answer text,
  status text not null default 'unanswered' check (status in ('unanswered','answered')),
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  answered_by uuid references auth.users(id)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  client_name text not null default 'Anonymous',
  message text not null,
  status text not null default 'unread' check (status in ('unread','read')),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists question_history_created_at_idx on public.question_history(created_at desc);
create index if not exists manual_questions_created_at_idx on public.manual_questions(created_at desc);
create index if not exists feedback_created_at_idx on public.feedback(created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.question_history enable row level security;
alter table public.manual_questions enable row level security;
alter table public.feedback enable row level security;

drop policy if exists "public insert history" on public.question_history;
drop policy if exists "admin read history" on public.question_history;
create policy "public insert history" on public.question_history for insert to anon, authenticated with check (true);
create policy "admin read history" on public.question_history for select to authenticated using (public.is_admin());

drop policy if exists "public insert manual" on public.manual_questions;
drop policy if exists "admin read manual" on public.manual_questions;
drop policy if exists "admin update manual" on public.manual_questions;
create policy "public insert manual" on public.manual_questions for insert to anon, authenticated with check (true);
create policy "admin read manual" on public.manual_questions for select to authenticated using (public.is_admin());
create policy "admin update manual" on public.manual_questions for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public insert feedback" on public.feedback;
drop policy if exists "admin read feedback" on public.feedback;
drop policy if exists "admin update feedback" on public.feedback;
create policy "public insert feedback" on public.feedback for insert to anon, authenticated with check (true);
create policy "admin read feedback" on public.feedback for select to authenticated using (public.is_admin());
create policy "admin update feedback" on public.feedback for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Profiles sengaja tidak diberi policy publik. Admin dapat membaca profilnya melalui service dengan RLS helper.
drop policy if exists "admin read own profile" on public.profiles;
create policy "admin read own profile" on public.profiles for select to authenticated using (id = auth.uid() and role = 'admin');
