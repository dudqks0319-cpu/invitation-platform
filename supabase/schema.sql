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
  status text not null default 'draft' check (status in ('draft', 'payment_pending', 'paid', 'published', 'refund_pending', 'refunded', 'payment_failed', 'deletion_pending')),
  payload jsonb not null default '{}'::jsonb,
  repurchase_required boolean not null default false,
  paid_payload_snapshot jsonb,
  guest_publish_idempotency_key_hash text,
  guest_publish_request_hash text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invitations
  add column if not exists guest_publish_idempotency_key_hash text,
  add column if not exists guest_publish_request_hash text;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'kakaopay' check (provider in ('kakaopay', 'naverpay', 'credit_card', 'bank_transfer', 'apple_iap', 'google_play')),
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
  idempotency_key_hash text,
  request_hash text,
  created_at timestamptz not null default now()
);

alter table public.rsvps
  add column if not exists idempotency_key_hash text,
  add column if not exists request_hash text;

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 30),
  message text not null check (char_length(message) between 1 and 300),
  approved boolean not null default false,
  idempotency_key_hash text,
  request_hash text,
  created_at timestamptz not null default now()
);

alter table public.guestbook_entries
  add column if not exists idempotency_key_hash text,
  add column if not exists request_hash text;

create table if not exists public.view_logs (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  visitor_key text,
  identity_kind text check (identity_kind is null or identity_kind in ('authenticated', 'anonymous_session', 'ip')),
  user_agent text,
  idempotency_key_hash text,
  request_hash text,
  cost_units smallint not null default 1 check (cost_units = 1),
  identity_expires_at timestamptz default (now() + interval '1 day'),
  expires_at timestamptz default (now() + interval '90 days'),
  created_at timestamptz not null default now()
);

alter table public.view_logs
  add column if not exists visitor_key text,
  add column if not exists identity_kind text,
  add column if not exists idempotency_key_hash text,
  add column if not exists request_hash text,
  add column if not exists cost_units smallint not null default 1,
  add column if not exists identity_expires_at timestamptz default (now() + interval '1 day'),
  add column if not exists expires_at timestamptz default (now() + interval '90 days');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'view_logs_identity_kind_check'
      and conrelid = 'public.view_logs'::regclass
  ) then
    alter table public.view_logs
      add constraint view_logs_identity_kind_check
      check (identity_kind is null or identity_kind in ('authenticated', 'anonymous_session', 'ip'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'view_logs_cost_units_check'
      and conrelid = 'public.view_logs'::regclass
  ) then
    alter table public.view_logs
      add constraint view_logs_cost_units_check check (cost_units = 1);
  end if;
end $$;

comment on column public.view_logs.identity_kind is
  'Privacy-safe cost attribution dimension retained until row deletion; no raw identity.';
comment on column public.view_logs.cost_units is
  'One bounded view-write unit. Identity hashes are redacted after 1 day and the row is deleted after 90 days.';

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  subject_hash text not null check (subject_hash ~ '^v1:[0-9a-f]{64}$'),
  idempotency_key_hash text check (idempotency_key_hash is null or idempotency_key_hash ~ '^v1:[0-9a-f]{64}$'),
  reauth_ticket_hash text check (reauth_ticket_hash is null or reauth_ticket_hash ~ '^v1:[0-9a-f]{64}$'),
  request_hash text check (request_hash is null or request_hash ~ '^v1:[0-9a-f]{64}$'),
  export_disposition text not null check (export_disposition in ('downloaded', 'skipped')),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'retry_wait', 'blocked', 'completed')),
  stage text not null default 'storage'
    check (stage in ('storage', 'provider', 'auth', 'finalize', 'completed')),
  attempt_count integer not null default 0 check (attempt_count between 0 and 5),
  lease_hash text check (lease_hash is null or lease_hash ~ '^v1:[0-9a-f]{64}$'),
  lease_expires_at timestamptz,
  next_retry_at timestamptz not null default now(),
  last_error_code text check (
    last_error_code is null or last_error_code in (
      'storage_unavailable', 'provider_unavailable', 'auth_unavailable'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  identity_expires_at timestamptz not null default (now() + interval '1 day'),
  expires_at timestamptz not null default (now() + interval '90 days')
);

comment on table public.account_deletion_requests is
  'Service-only deletion tombstone/outbox. No raw PII, provider payload, token, IP, or secret may be stored.';
comment on column public.account_deletion_requests.last_error_code is
  'Allowlisted redacted telemetry only; never store provider messages or raw identifiers.';

create table if not exists public.rate_limits (
  bucket_key text primary key,
  count integer not null,
  reset_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invitation_templates (
  id text primary key check (id ~ '^[a-z0-9-]{2,80}$'),
  title text not null check (char_length(title) between 1 and 60),
  category text not null check (category in ('wedding', 'firstBirthday', 'birthday', 'anniversary')),
  subtitle text not null default '' check (char_length(subtitle) <= 100),
  badge text not null default 'NEW' check (char_length(badge) <= 20),
  background_hex text not null default '#FFF9F4' check (background_hex ~ '^#[0-9A-Fa-f]{6}$'),
  accent_hex text not null default '#D8B8AA' check (accent_hex ~ '^#[0-9A-Fa-f]{6}$'),
  typography text not null default 'serif' check (typography in ('serif', 'sans')),
  ornament text not null default 'imageBackground' check (ornament = 'imageBackground'),
  background_image_url text not null check (background_image_url like '/%' or background_image_url like 'https://%'),
  background_image_path text,
  text_area_top numeric not null default 0.28 check (text_area_top between 0.08 and 0.42),
  text_area_bottom numeric not null default 0.24 check (text_area_bottom between 0.08 and 0.42),
  text_area_horizontal numeric not null default 0.14 check (text_area_horizontal between 0.08 and 0.24),
  primary_text_hex text not null default '#2C2A2A' check (primary_text_hex ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_text_hex text not null default '#8B7D73' check (secondary_text_hex ~ '^#[0-9A-Fa-f]{6}$'),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
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
set search_path = ''
as $$
declare
  current_limit public.rate_limits%rowtype;
  next_reset timestamptz;
begin
  if bucket_key is null
    or pg_catalog.char_length(bucket_key) not between 1 and 200
    or pg_catalog.octet_length(bucket_key) > 512 then
    raise exception 'bucket_key must be between 1 and 200 characters'
      using errcode = '22023';
  end if;

  if max_hits is null or max_hits not between 1 and 1000 then
    raise exception 'max_hits must be between 1 and 1000'
      using errcode = '22023';
  end if;

  if window_seconds is null or window_seconds not between 1 and 86400 then
    raise exception 'window_seconds must be between 1 and 86400'
      using errcode = '22023';
  end if;

  next_reset := pg_catalog.now() + pg_catalog.make_interval(secs => window_seconds);

  insert into public.rate_limits (bucket_key, count, reset_at, updated_at)
  values ($1, 1, next_reset, pg_catalog.now())
  on conflict on constraint rate_limits_pkey
  do update
    set count = case
          when public.rate_limits.reset_at <= pg_catalog.now() then 1
          else least(public.rate_limits.count + 1, $2 + 1)
        end,
        reset_at = case
          when public.rate_limits.reset_at <= pg_catalog.now() then excluded.reset_at
          else public.rate_limits.reset_at
        end,
        updated_at = pg_catalog.now()
  returning * into current_limit;

  return query
  select
    current_limit.count <= $2,
    greatest($2 - current_limit.count, 0),
    current_limit.reset_at;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer)
from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
to service_role;

create or replace function public.cleanup_rate_limits(
  retention_seconds integer default 86400
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count bigint;
begin
  if retention_seconds is null or retention_seconds not between 60 and 604800 then
    raise exception 'retention_seconds must be between 60 and 604800'
      using errcode = '22023';
  end if;

  delete from public.rate_limits
  where reset_at < (
    pg_catalog.now() - pg_catalog.make_interval(secs => retention_seconds)
  );

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.cleanup_rate_limits(integer)
from public, anon, authenticated;
grant execute on function public.cleanup_rate_limits(integer)
to service_role;

create or replace function public.record_invitation_view(
  p_invitation_id uuid,
  p_visitor_key text,
  p_identity_kind text,
  p_idempotency_key_hash text,
  p_request_hash text,
  p_issued_at timestamptz
)
returns table (outcome text)
language plpgsql
security definer
set search_path = ''
set statement_timeout = '2s'
as $$
declare
  inserted_id bigint;
  existing_request_hash text;
begin
  if p_invitation_id is null
    or p_visitor_key is null or p_visitor_key !~ '^v1:[0-9a-f]{64}$'
    or p_identity_kind is null or p_identity_kind not in ('authenticated', 'anonymous_session', 'ip')
    or p_idempotency_key_hash is null or p_idempotency_key_hash !~ '^[0-9a-f]{64}$'
    or p_request_hash is null or p_request_hash !~ '^[0-9a-f]{64}$'
    or p_issued_at is null then
    raise exception 'invalid view log input' using errcode = '22023';
  end if;

  if p_issued_at < pg_catalog.now() - interval '60 seconds'
    or p_issued_at > pg_catalog.now() + interval '5 seconds' then
    raise exception 'stale view log ticket' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.invitations
    where invitations.id = p_invitation_id
      and invitations.status = 'published'
  ) then
    return query select 'not_found'::text;
    return;
  end if;

  insert into public.view_logs (
    invitation_id,
    visitor_key,
    identity_kind,
    user_agent,
    idempotency_key_hash,
    request_hash,
    cost_units,
    identity_expires_at,
    expires_at,
    created_at
  ) values (
    p_invitation_id,
    p_visitor_key,
    p_identity_kind,
    null,
    p_idempotency_key_hash,
    p_request_hash,
    1,
    p_issued_at + interval '1 day',
    p_issued_at + interval '90 days',
    p_issued_at
  )
  on conflict (invitation_id, idempotency_key_hash) do nothing
  returning id into inserted_id;

  if inserted_id is not null then
    return query select 'inserted'::text;
    return;
  end if;

  select view_logs.request_hash
  into existing_request_hash
  from public.view_logs
  where view_logs.invitation_id = p_invitation_id
    and view_logs.idempotency_key_hash = p_idempotency_key_hash;

  return query select case
    when existing_request_hash = p_request_hash then 'replayed'::text
    else 'collision'::text
  end;
end;
$$;

revoke all on function public.record_invitation_view(uuid, text, text, text, text, timestamptz)
from public, anon, authenticated;
grant execute on function public.record_invitation_view(uuid, text, text, text, text, timestamptz)
to service_role;

create or replace function public.cleanup_view_logs(
  batch_size integer default 1000
)
returns table (redacted_count bigint, deleted_count bigint)
language plpgsql
security definer
set search_path = ''
set statement_timeout = '5s'
as $$
declare
  redacted_rows bigint;
  deleted_rows bigint;
begin
  if batch_size is null or batch_size not between 1 and 5000 then
    raise exception 'batch_size must be between 1 and 5000'
      using errcode = '22023';
  end if;

  with candidates as (
    select id
    from public.view_logs
    where identity_expires_at <= pg_catalog.now()
      and visitor_key is not null
    order by identity_expires_at, id
    limit batch_size
    for update skip locked
  )
  update public.view_logs
  set visitor_key = null,
      user_agent = null,
      idempotency_key_hash = null,
      request_hash = null
  where id in (select id from candidates);
  get diagnostics redacted_rows = row_count;

  with candidates as (
    select id
    from public.view_logs
    where expires_at <= pg_catalog.now()
    order by expires_at, id
    limit batch_size
    for update skip locked
  )
  delete from public.view_logs
  where id in (select id from candidates);
  get diagnostics deleted_rows = row_count;

  return query select redacted_rows, deleted_rows;
end;
$$;

revoke all on function public.cleanup_view_logs(integer)
from public, anon, authenticated;
grant execute on function public.cleanup_view_logs(integer)
to service_role;

create or replace function public.account_is_active(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id is not null
    and p_user_id = (select auth.uid())
    and not exists (
      select 1 from public.account_deletion_requests
      where user_id = p_user_id and account_deletion_requests.status <> 'completed'
    );
$$;

revoke all on function public.account_is_active(uuid) from public, anon;
grant execute on function public.account_is_active(uuid) to authenticated;

create or replace function public.is_account_deletion_pending(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id is null or exists (
    select 1 from public.account_deletion_requests
    where user_id = p_user_id and account_deletion_requests.status <> 'completed'
  );
$$;

revoke all on function public.is_account_deletion_pending(uuid)
from public, anon, authenticated;
grant execute on function public.is_account_deletion_pending(uuid) to service_role;

create or replace function public.begin_account_deletion(
  p_user_id uuid,
  p_subject_hash text,
  p_idempotency_key_hash text,
  p_reauth_ticket_hash text,
  p_request_hash text,
  p_export_disposition text,
  p_ticket_issued_at timestamptz
)
returns table (request_id uuid, outcome text, status text, stage text)
language plpgsql
security definer
set search_path = ''
set statement_timeout = '2s'
as $$
declare
  existing public.account_deletion_requests%rowtype;
  inserted_id uuid;
  has_entitlement_records boolean := false;
begin
  if p_user_id is null
    or p_subject_hash is null or p_subject_hash !~ '^v1:[0-9a-f]{64}$'
    or p_idempotency_key_hash is null or p_idempotency_key_hash !~ '^v1:[0-9a-f]{64}$'
    or p_reauth_ticket_hash is null or p_reauth_ticket_hash !~ '^v1:[0-9a-f]{64}$'
    or p_request_hash is null or p_request_hash !~ '^v1:[0-9a-f]{64}$'
    or p_export_disposition not in ('downloaded', 'skipped')
    or p_ticket_issued_at is null then
    raise exception 'invalid account deletion input' using errcode = '22023';
  end if;
  if p_ticket_issued_at < pg_catalog.now() - interval '5 minutes'
    or p_ticket_issued_at > pg_catalog.now() + interval '5 seconds' then
    raise exception 'stale account deletion ticket' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 91320260803)
  );

  select * into existing
  from public.account_deletion_requests as adr
  where adr.idempotency_key_hash = p_idempotency_key_hash
     or adr.reauth_ticket_hash = p_reauth_ticket_hash
  order by adr.created_at desc
  limit 1
  for update;
  if found then
    return query select existing.id,
      case
        when existing.user_id = p_user_id
          and existing.request_hash = p_request_hash
          and existing.idempotency_key_hash = p_idempotency_key_hash
          and existing.reauth_ticket_hash = p_reauth_ticket_hash
        then 'replayed'::text else 'collision'::text
      end,
      existing.status, existing.stage;
    return;
  end if;

  select * into existing
  from public.account_deletion_requests as adr
  where adr.user_id = p_user_id and adr.status <> 'completed'
  order by adr.created_at desc
  limit 1
  for update;
  if found then
    return query select existing.id, 'in_progress'::text, existing.status, existing.stage;
    return;
  end if;

  if pg_catalog.to_regclass('public.user_entitlements') is not null then
    execute 'select exists (select 1 from public.user_entitlements where user_id = $1)'
      into has_entitlement_records using p_user_id;
  end if;
  if not has_entitlement_records
    and pg_catalog.to_regclass('public.publish_credits') is not null then
    execute 'select exists (select 1 from public.publish_credits where user_id = $1)'
      into has_entitlement_records using p_user_id;
  end if;

  if exists (select 1 from public.payments where payments.user_id = p_user_id)
    or has_entitlement_records then
    return query select null::uuid, 'retention_required'::text, 'blocked'::text, null::text;
    return;
  end if;

  insert into public.account_deletion_requests (
    user_id, subject_hash, idempotency_key_hash, reauth_ticket_hash,
    request_hash, export_disposition
  ) values (
    p_user_id, p_subject_hash, p_idempotency_key_hash, p_reauth_ticket_hash,
    p_request_hash, p_export_disposition
  ) returning id into inserted_id;

  update public.invitations
  set status = 'deletion_pending', updated_at = pg_catalog.now()
  where invitations.user_id = p_user_id and invitations.status <> 'deletion_pending';

  return query select inserted_id, 'inserted'::text, 'pending'::text, 'storage'::text;
end;
$$;

revoke all on function public.begin_account_deletion(uuid, text, text, text, text, text, timestamptz)
from public, anon, authenticated;
grant execute on function public.begin_account_deletion(uuid, text, text, text, text, text, timestamptz)
to service_role;

create or replace function public.claim_account_deletion(p_request_id uuid, p_lease_hash text)
returns table (claimed boolean, stage text, attempt_count integer)
language plpgsql
security definer
set search_path = ''
set statement_timeout = '2s'
as $$
begin
  if p_request_id is null
    or p_lease_hash is null or p_lease_hash !~ '^v1:[0-9a-f]{64}$' then
    raise exception 'invalid account deletion lease' using errcode = '22023';
  end if;

  return query
  update public.account_deletion_requests as adr
  set status = 'processing',
      attempt_count = adr.attempt_count + 1,
      lease_hash = p_lease_hash,
      lease_expires_at = pg_catalog.now() + interval '2 minutes',
      updated_at = pg_catalog.now()
  where adr.id = p_request_id
    and adr.status in ('pending', 'retry_wait')
    and adr.next_retry_at <= pg_catalog.now()
    and (adr.lease_expires_at is null or adr.lease_expires_at <= pg_catalog.now())
    and adr.attempt_count < 5
  returning true, adr.stage, adr.attempt_count;
end;
$$;

revoke all on function public.claim_account_deletion(uuid, text)
from public, anon, authenticated;
grant execute on function public.claim_account_deletion(uuid, text) to service_role;

create or replace function public.advance_account_deletion(
  p_request_id uuid,
  p_lease_hash text,
  p_completed_stage text
)
returns table (advanced boolean)
language plpgsql
security definer
set search_path = ''
set statement_timeout = '2s'
as $$
begin
  if p_request_id is null
    or p_lease_hash is null or p_lease_hash !~ '^v1:[0-9a-f]{64}$'
    or p_completed_stage not in ('storage', 'provider', 'auth', 'finalize') then
    raise exception 'invalid account deletion transition' using errcode = '22023';
  end if;

  return query
  update public.account_deletion_requests as adr
  set stage = case p_completed_stage
        when 'storage' then 'provider'
        when 'provider' then 'auth'
        when 'auth' then 'finalize'
        else 'completed'
      end,
      status = case when p_completed_stage = 'finalize' then 'completed' else 'pending' end,
      user_id = case when p_completed_stage = 'finalize' then null else adr.user_id end,
      idempotency_key_hash = case when p_completed_stage = 'finalize' then null else adr.idempotency_key_hash end,
      reauth_ticket_hash = case when p_completed_stage = 'finalize' then null else adr.reauth_ticket_hash end,
      request_hash = case when p_completed_stage = 'finalize' then null else adr.request_hash end,
      lease_hash = null,
      lease_expires_at = null,
      next_retry_at = pg_catalog.now(),
      last_error_code = null,
      completed_at = case when p_completed_stage = 'finalize' then pg_catalog.now() else adr.completed_at end,
      updated_at = pg_catalog.now()
  where adr.id = p_request_id
    and adr.status = 'processing'
    and adr.stage = p_completed_stage
    and adr.lease_hash = p_lease_hash
    and adr.lease_expires_at > pg_catalog.now()
  returning true;
end;
$$;

revoke all on function public.advance_account_deletion(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.advance_account_deletion(uuid, text, text) to service_role;

create or replace function public.fail_account_deletion(
  p_request_id uuid,
  p_lease_hash text,
  p_error_code text
)
returns table (recorded boolean, blocked boolean)
language plpgsql
security definer
set search_path = ''
set statement_timeout = '2s'
as $$
begin
  if p_request_id is null
    or p_lease_hash is null or p_lease_hash !~ '^v1:[0-9a-f]{64}$'
    or p_error_code not in ('storage_unavailable', 'provider_unavailable', 'auth_unavailable') then
    raise exception 'invalid account deletion failure' using errcode = '22023';
  end if;

  return query
  update public.account_deletion_requests as adr
  set status = case when adr.attempt_count >= 5 then 'blocked' else 'retry_wait' end,
      next_retry_at = pg_catalog.now() + case adr.attempt_count
        when 1 then interval '30 seconds'
        when 2 then interval '1 minute'
        when 3 then interval '2 minutes'
        when 4 then interval '4 minutes'
        else interval '8 minutes'
      end,
      last_error_code = p_error_code,
      lease_hash = null,
      lease_expires_at = greatest(
        coalesce(adr.lease_expires_at, pg_catalog.now()),
        pg_catalog.now() + interval '2 minutes'
      ),
      updated_at = pg_catalog.now()
  where adr.id = p_request_id
    and adr.status = 'processing'
    and adr.lease_hash = p_lease_hash
  returning true, adr.status = 'blocked';
end;
$$;

revoke all on function public.fail_account_deletion(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.fail_account_deletion(uuid, text, text) to service_role;

create or replace function public.cleanup_account_deletion_requests(batch_size integer default 1000)
returns table (redacted_count bigint, deleted_count bigint)
language plpgsql
security definer
set search_path = ''
set statement_timeout = '5s'
as $$
declare
  redacted_rows bigint;
  deleted_rows bigint;
begin
  if batch_size is null or batch_size not between 1 and 1000 then
    raise exception 'batch_size must be between 1 and 1000' using errcode = '22023';
  end if;

  with candidates as (
    select adr.id from public.account_deletion_requests as adr
    where adr.status = 'completed'
      and adr.identity_expires_at <= pg_catalog.now()
      and (adr.user_id is not null or adr.idempotency_key_hash is not null)
    order by adr.identity_expires_at, adr.id limit batch_size
    for update skip locked
  )
  update public.account_deletion_requests
  set user_id = null, idempotency_key_hash = null,
      reauth_ticket_hash = null, request_hash = null
  where id in (select id from candidates);
  get diagnostics redacted_rows = row_count;

  with candidates as (
    select adr.id from public.account_deletion_requests as adr
    where adr.status = 'completed' and adr.expires_at <= pg_catalog.now()
    order by adr.expires_at, adr.id limit batch_size
    for update skip locked
  )
  delete from public.account_deletion_requests where id in (select id from candidates);
  get diagnostics deleted_rows = row_count;

  return query select redacted_rows, deleted_rows;
end;
$$;

revoke all on function public.cleanup_account_deletion_requests(integer)
from public, anon, authenticated;
grant execute on function public.cleanup_account_deletion_requests(integer) to service_role;

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

drop trigger if exists invitation_templates_set_timestamp on public.invitation_templates;
create trigger invitation_templates_set_timestamp
before update on public.invitation_templates
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
alter table public.invitation_templates enable row level security;
alter table public.account_deletion_requests enable row level security;
revoke all on table public.account_deletion_requests from public, anon, authenticated;
revoke all on table public.account_deletion_requests from service_role;

drop policy if exists "profiles self access" on public.profiles;
create policy "profiles self access"
on public.profiles
for all
to authenticated
using (
  (select auth.uid()) = id
  and (select public.account_is_active((select auth.uid())))
)
with check (
  (select auth.uid()) = id
  and (select public.account_is_active((select auth.uid())))
);

drop policy if exists "owners manage invitations" on public.invitations;
drop policy if exists "owners can read invitations" on public.invitations;
drop policy if exists "owners can create draft invitations" on public.invitations;
drop policy if exists "owners can update draft invitations" on public.invitations;
drop policy if exists "owners can delete invitations" on public.invitations;

create policy "owners can read invitations"
on public.invitations
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and status <> 'deletion_pending'
  and (select public.account_is_active((select auth.uid())))
);

create policy "owners can create draft invitations"
on public.invitations
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and status = 'draft'
  and repurchase_required = false
  and paid_payload_snapshot is null
  and guest_publish_idempotency_key_hash is null
  and guest_publish_request_hash is null
  and published_at is null
  and (select public.account_is_active((select auth.uid())))
);

create policy "owners can update draft invitations"
on public.invitations
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and guest_publish_idempotency_key_hash is null
  and status <> 'deletion_pending'
  and (select public.account_is_active((select auth.uid())))
)
with check (
  (select auth.uid()) = user_id
  and status = 'draft'
  and repurchase_required = false
  and paid_payload_snapshot is null
  and guest_publish_idempotency_key_hash is null
  and guest_publish_request_hash is null
  and published_at is null
  and (select public.account_is_active((select auth.uid())))
);

create policy "owners can delete invitations"
on public.invitations
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and status <> 'deletion_pending'
  and (select public.account_is_active((select auth.uid())))
);

drop policy if exists "public can read published invitations" on public.invitations;
revoke select on table public.invitations from public, anon;
grant select on table public.invitations to authenticated, service_role;

drop policy if exists "owners can read payments" on public.payments;
create policy "owners can read payments"
on public.payments
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and (select public.account_is_active((select auth.uid())))
);

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
      and payments.user_id = (select auth.uid())
      and (select public.account_is_active((select auth.uid())))
  )
);

drop policy if exists "public can create rsvps for published invitations" on public.rsvps;
drop policy if exists "service role writes rsvps" on public.rsvps;
revoke insert, update, delete on table public.rsvps from public, anon, authenticated;
grant insert, update, delete on table public.rsvps to service_role;

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
      and invitations.user_id = (select auth.uid())
      and invitations.status <> 'deletion_pending'
      and (select public.account_is_active((select auth.uid())))
  )
);

drop policy if exists "public can create guestbook for published invitations" on public.guestbook_entries;
drop policy if exists "service role writes guestbook" on public.guestbook_entries;
revoke insert, delete on table public.guestbook_entries from public, anon, authenticated;
grant insert, delete on table public.guestbook_entries to service_role;

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
      and invitations.user_id = (select auth.uid())
      and invitations.status <> 'deletion_pending'
      and (select public.account_is_active((select auth.uid())))
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
      and invitations.user_id = (select auth.uid())
      and invitations.status <> 'deletion_pending'
      and (select public.account_is_active((select auth.uid())))
  )
)
with check (
  exists (
    select 1
    from public.invitations
    where invitations.id = guestbook_entries.invitation_id
      and invitations.user_id = (select auth.uid())
      and invitations.status <> 'deletion_pending'
      and (select public.account_is_active((select auth.uid())))
  )
);

drop policy if exists "public can read active invitation templates" on public.invitation_templates;
create policy "public can read active invitation templates"
on public.invitation_templates
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "public can insert view logs for published invitations" on public.view_logs;
revoke insert, update, delete on table public.view_logs from public, anon, authenticated, service_role;

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
      and (select auth.uid()) = invitations.user_id
      and invitations.status <> 'deletion_pending'
      and (select public.account_is_active((select auth.uid())))
  )
);

create index if not exists idx_invitations_user_id on public.invitations(user_id);
create index if not exists idx_invitations_slug on public.invitations(slug);
create index if not exists idx_invitations_status on public.invitations(status);
create unique index if not exists idx_invitations_guest_publish_idempotency
  on public.invitations(guest_publish_idempotency_key_hash)
  where guest_publish_idempotency_key_hash is not null;
create index if not exists idx_payments_invitation_id on public.payments(invitation_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create unique index if not exists idx_payments_approve_nonce
  on public.payments(approve_nonce)
  where approve_nonce is not null;
create index if not exists idx_payment_audit_logs_payment_id on public.payment_audit_logs(payment_id);
create index if not exists idx_rsvps_invitation_id on public.rsvps(invitation_id);
create unique index if not exists idx_rsvps_public_idempotency
  on public.rsvps(invitation_id, idempotency_key_hash)
  where idempotency_key_hash is not null;
create index if not exists idx_guestbook_invitation_id on public.guestbook_entries(invitation_id);
create unique index if not exists idx_guestbook_public_idempotency
  on public.guestbook_entries(invitation_id, idempotency_key_hash)
  where idempotency_key_hash is not null;
create index if not exists idx_view_logs_invitation_id on public.view_logs(invitation_id);
create index if not exists idx_view_logs_invitation_created
  on public.view_logs(invitation_id, created_at desc);
create unique index if not exists idx_view_logs_idempotency
  on public.view_logs(invitation_id, idempotency_key_hash);
create index if not exists idx_view_logs_identity_expiry
  on public.view_logs(identity_expires_at)
  where visitor_key is not null;
create index if not exists idx_view_logs_expiry on public.view_logs(expires_at);
create index if not exists idx_rate_limits_reset_at on public.rate_limits(reset_at);
create unique index if not exists idx_account_deletion_active_user
  on public.account_deletion_requests(user_id)
  where status <> 'completed';
create unique index if not exists idx_account_deletion_idempotency
  on public.account_deletion_requests(idempotency_key_hash)
  where idempotency_key_hash is not null;
create unique index if not exists idx_account_deletion_ticket
  on public.account_deletion_requests(reauth_ticket_hash)
  where reauth_ticket_hash is not null;
create index if not exists idx_account_deletion_retry
  on public.account_deletion_requests(status, next_retry_at)
  where status in ('pending', 'retry_wait');
create index if not exists idx_account_deletion_expiry
  on public.account_deletion_requests(expires_at)
  where status = 'completed';
create index if not exists idx_invitation_templates_category_active
  on public.invitation_templates(category, is_active);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitation-assets',
  'invitation-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read invitation assets" on storage.objects;
drop policy if exists "authenticated users manage own invitation assets" on storage.objects;
drop policy if exists "authenticated users can read own invitation assets" on storage.objects;
drop policy if exists "authenticated users can delete own invitation assets" on storage.objects;
comment on table storage.objects is
  'Invitation assets are private. Authenticated clients have no direct object read/delete policy; bounded service endpoints enforce owner/public access.';
