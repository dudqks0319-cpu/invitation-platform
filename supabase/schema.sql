create extension if not exists pgcrypto;

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 1 and 40),
  phone text,
  attending boolean not null default true,
  guests integer not null default 1 check (guests between 0 and 20),
  memo text check (memo is null or char_length(memo) <= 300)
);

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  nickname text not null check (char_length(nickname) between 1 and 30),
  message text not null check (char_length(message) between 1 and 300),
  approved boolean not null default true
);

create table if not exists public.visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  page text not null default '/',
  user_agent text,
  user_id uuid references auth.users(id) on delete set null
);

alter table public.rsvps enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.visits enable row level security;

drop policy if exists "Anyone can create RSVP" on public.rsvps;
create policy "Anyone can create RSVP"
on public.rsvps
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated can read RSVP dashboard" on public.rsvps;
create policy "Authenticated can read RSVP dashboard"
on public.rsvps
for select
to authenticated
using (true);

drop policy if exists "Owner can update own RSVP" on public.rsvps;
create policy "Owner can update own RSVP"
on public.rsvps
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Owner can delete own RSVP" on public.rsvps;
create policy "Owner can delete own RSVP"
on public.rsvps
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Anyone can create guestbook entry" on public.guestbook_entries;
create policy "Anyone can create guestbook entry"
on public.guestbook_entries
for insert
to anon, authenticated
with check (approved = true);

drop policy if exists "Anyone can read approved guestbook entries" on public.guestbook_entries;
create policy "Anyone can read approved guestbook entries"
on public.guestbook_entries
for select
to anon, authenticated
using (approved = true);

drop policy if exists "Authenticated can moderate guestbook entries" on public.guestbook_entries;
create policy "Authenticated can moderate guestbook entries"
on public.guestbook_entries
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Anyone can track visits" on public.visits;
create policy "Anyone can track visits"
on public.visits
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated can read visits dashboard" on public.visits;
create policy "Authenticated can read visits dashboard"
on public.visits
for select
to authenticated
using (true);

create index if not exists idx_rsvps_created_at on public.rsvps (created_at desc);
create index if not exists idx_guestbook_created_at on public.guestbook_entries (created_at desc);
create index if not exists idx_visits_created_at on public.visits (created_at desc);
