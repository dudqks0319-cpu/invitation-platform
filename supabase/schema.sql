create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  category text not null,
  template_id text not null,
  status text not null default 'draft' check (status in ('draft', 'payment_pending', 'paid', 'published', 'refund_pending', 'refunded', 'payment_failed')),
  payload jsonb not null default '{}'::jsonb,
  repurchase_required boolean not null default false,
  paid_payload_snapshot jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'kakaopay' check (provider in ('kakaopay')),
  status text not null default 'payment_pending' check (status in ('payment_pending', 'paid', 'refund_pending', 'refunded', 'payment_failed')),
  amount integer not null,
  currency text not null default 'KRW',
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  provider_tid text,
  provider_order_id text not null unique,
  ready_payload jsonb,
  approved_at timestamptz,
  cancelled_at timestamptz,
  refund_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments
  add column if not exists approve_nonce text,
  add column if not exists nonce_used_at timestamptz;

create unique index if not exists idx_payments_approve_nonce
  on public.payments(approve_nonce)
  where approve_nonce is not null;

create table if not exists public.payment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  action text not null check (action in ('ready', 'approve', 'cancel', 'fail')),
  request_payload jsonb,
  response_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_name text not null check (char_length(guest_name) between 1 and 40),
  guest_phone text,
  attending boolean not null default true,
  guests integer not null default 1 check (guests between 0 and 20),
  memo text check (memo is null or char_length(memo) <= 300),
  created_at timestamptz not null default now()
);

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 30),
  message text not null check (char_length(message) between 1 and 300),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.view_logs (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  bucket_key text primary key,
  count integer not null,
  reset_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.consume_rate_limit(
  bucket_key text,
  max_hits integer,
  window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_limit public.rate_limits%rowtype;
  next_reset timestamptz := now() + make_interval(secs => window_seconds);
begin
  select *
  into current_limit
  from public.rate_limits
  where rate_limits.bucket_key = consume_rate_limit.bucket_key
  for update;

  if not found or current_limit.reset_at <= now() then
    insert into public.rate_limits (bucket_key, count, reset_at, updated_at)
    values (consume_rate_limit.bucket_key, 1, next_reset, now())
    on conflict (bucket_key)
    do update
      set count = 1,
          reset_at = excluded.reset_at,
          updated_at = now();

    return query
    select true, greatest(max_hits - 1, 0), next_reset;
    return;
  end if;

  if current_limit.count >= max_hits then
    return query
    select false, 0, current_limit.reset_at;
    return;
  end if;

  update public.rate_limits
  set count = current_limit.count + 1,
      updated_at = now()
  where rate_limits.bucket_key = consume_rate_limit.bucket_key;

  return query
  select true, greatest(max_hits - (current_limit.count + 1), 0), current_limit.reset_at;
end;
$$;

drop trigger if exists profiles_set_timestamp on public.profiles;
create trigger profiles_set_timestamp
before update on public.profiles
for each row
execute procedure public.set_timestamp();

drop trigger if exists invitations_set_timestamp on public.invitations;
create trigger invitations_set_timestamp
before update on public.invitations
for each row
execute procedure public.set_timestamp();

alter table public.profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.payments enable row level security;
alter table public.payment_audit_logs enable row level security;
alter table public.rsvps enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.view_logs enable row level security;
alter table public.rate_limits enable row level security;

drop policy if exists "profiles self access" on public.profiles;
create policy "profiles self access"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "owners manage invitations" on public.invitations;
create policy "owners manage invitations"
on public.invitations
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "public can read published invitations" on public.invitations;
create policy "public can read published invitations"
on public.invitations
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "owners can read payments" on public.payments;
create policy "owners can read payments"
on public.payments
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "owners can read payment audit logs" on public.payment_audit_logs;
create policy "owners can read payment audit logs"
on public.payment_audit_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.payments
    where payments.id = payment_audit_logs.payment_id
      and payments.user_id = auth.uid()
  )
);

drop policy if exists "public can create rsvps for published invitations" on public.rsvps;
drop policy if exists "service role writes rsvps" on public.rsvps;

drop policy if exists "owners can read rsvps" on public.rsvps;
create policy "owners can read rsvps"
on public.rsvps
for select
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = rsvps.invitation_id
      and invitations.user_id = auth.uid()
  )
);

drop policy if exists "public can create guestbook for published invitations" on public.guestbook_entries;
drop policy if exists "service role writes guestbook" on public.guestbook_entries;

drop policy if exists "owners can read guestbook entries" on public.guestbook_entries;
create policy "owners can read guestbook entries"
on public.guestbook_entries
for select
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = guestbook_entries.invitation_id
      and invitations.user_id = auth.uid()
  )
);

drop policy if exists "public can read approved guestbook for published invitations" on public.guestbook_entries;
create policy "public can read approved guestbook for published invitations"
on public.guestbook_entries
for select
to anon, authenticated
using (
  approved = true
  and exists (
    select 1
    from public.invitations
    where invitations.id = guestbook_entries.invitation_id
      and invitations.status = 'published'
  )
);

drop policy if exists "owners can moderate guestbook" on public.guestbook_entries;
create policy "owners can moderate guestbook"
on public.guestbook_entries
for update
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = guestbook_entries.invitation_id
      and invitations.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.invitations
    where invitations.id = guestbook_entries.invitation_id
      and invitations.user_id = auth.uid()
  )
);

drop policy if exists "public can insert view logs for published invitations" on public.view_logs;
create policy "public can insert view logs for published invitations"
on public.view_logs
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.invitations
    where invitations.id = view_logs.invitation_id
      and invitations.status = 'published'
  )
);

drop policy if exists "owners can read view logs" on public.view_logs;
create policy "owners can read view logs"
on public.view_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = view_logs.invitation_id
      and invitations.user_id = auth.uid()
  )
);

create index if not exists idx_invitations_user_id on public.invitations(user_id);
create index if not exists idx_invitations_slug on public.invitations(slug);
create index if not exists idx_invitations_status on public.invitations(status);
create index if not exists idx_payments_invitation_id on public.payments(invitation_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create unique index if not exists idx_payments_approve_nonce
  on public.payments(approve_nonce)
  where approve_nonce is not null;
create index if not exists idx_payment_audit_logs_payment_id on public.payment_audit_logs(payment_id);
create index if not exists idx_rsvps_invitation_id on public.rsvps(invitation_id);
create index if not exists idx_guestbook_invitation_id on public.guestbook_entries(invitation_id);
create index if not exists idx_view_logs_invitation_id on public.view_logs(invitation_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitation-assets',
  'invitation-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read invitation assets" on storage.objects;
create policy "public can read invitation assets"
on storage.objects
for select
to public
using (bucket_id = 'invitation-assets');

drop policy if exists "authenticated users manage own invitation assets" on storage.objects;
create policy "authenticated users manage own invitation assets"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'invitation-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'invitation-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);
