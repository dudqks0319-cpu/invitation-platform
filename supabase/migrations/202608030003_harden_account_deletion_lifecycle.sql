-- Local migration artifact only. Apply and verify separately with synthetic
-- staging accounts. This migration does not authorize a Production deletion.

alter table public.invitations
  drop constraint if exists invitations_status_check;
alter table public.invitations
  add constraint invitations_status_check
  check (status in (
    'draft', 'payment_pending', 'paid', 'published', 'refund_pending',
    'refunded', 'payment_failed', 'deletion_pending'
  ));

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

alter table public.account_deletion_requests enable row level security;
revoke all on table public.account_deletion_requests from public, anon, authenticated;
revoke all on table public.account_deletion_requests from service_role;

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

comment on table public.account_deletion_requests is
  'Service-only deletion tombstone/outbox. No raw PII, provider payload, token, IP, or secret may be stored.';
comment on column public.account_deletion_requests.last_error_code is
  'Allowlisted redacted telemetry only; never store provider messages or raw identifiers.';

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
      select 1 from public.account_deletion_requests as adr
      where adr.user_id = p_user_id and adr.status <> 'completed'
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
    select 1 from public.account_deletion_requests as adr
    where adr.user_id = p_user_id and adr.status <> 'completed'
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

  -- Payment records require a separate legal-retention decision. Fail closed
  -- before tombstoning or destructive work rather than silently cascading them.
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

create or replace function public.claim_account_deletion(
  p_request_id uuid,
  p_lease_hash text
)
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

drop policy if exists "profiles self access" on public.profiles;
create policy "profiles self access" on public.profiles
for all to authenticated
using ((select auth.uid()) = id and (select public.account_is_active((select auth.uid()))))
with check ((select auth.uid()) = id and (select public.account_is_active((select auth.uid()))));

drop policy if exists "owners can read invitations" on public.invitations;
create policy "owners can read invitations" on public.invitations
for select to authenticated
using (
  (select auth.uid()) = user_id and status <> 'deletion_pending'
  and (select public.account_is_active((select auth.uid())))
);

drop policy if exists "owners can create draft invitations" on public.invitations;
create policy "owners can create draft invitations" on public.invitations
for insert to authenticated
with check (
  (select auth.uid()) = user_id and status = 'draft'
  and repurchase_required = false and paid_payload_snapshot is null
  and guest_publish_idempotency_key_hash is null and guest_publish_request_hash is null
  and published_at is null
  and (select public.account_is_active((select auth.uid())))
);

drop policy if exists "owners can update draft invitations" on public.invitations;
create policy "owners can update draft invitations" on public.invitations
for update to authenticated
using (
  (select auth.uid()) = user_id and guest_publish_idempotency_key_hash is null
  and status <> 'deletion_pending'
  and (select public.account_is_active((select auth.uid())))
)
with check (
  (select auth.uid()) = user_id and status = 'draft'
  and repurchase_required = false and paid_payload_snapshot is null
  and guest_publish_idempotency_key_hash is null and guest_publish_request_hash is null
  and published_at is null
  and (select public.account_is_active((select auth.uid())))
);

drop policy if exists "owners can delete invitations" on public.invitations;
create policy "owners can delete invitations" on public.invitations
for delete to authenticated
using (
  (select auth.uid()) = user_id and status <> 'deletion_pending'
  and (select public.account_is_active((select auth.uid())))
);

drop policy if exists "owners can read payments" on public.payments;
create policy "owners can read payments" on public.payments
for select to authenticated
using (
  (select auth.uid()) = user_id
  and (select public.account_is_active((select auth.uid())))
);

drop policy if exists "owners can read payment audit logs" on public.payment_audit_logs;
create policy "owners can read payment audit logs" on public.payment_audit_logs
for select to authenticated
using (
  exists (
    select 1 from public.payments
    where payments.id = payment_audit_logs.payment_id
      and payments.user_id = (select auth.uid())
      and (select public.account_is_active((select auth.uid())))
  )
);

drop policy if exists "owners can read rsvps" on public.rsvps;
create policy "owners can read rsvps" on public.rsvps
for select to authenticated
using (
  exists (
    select 1 from public.invitations
    where invitations.id = rsvps.invitation_id
      and invitations.user_id = (select auth.uid())
      and invitations.status <> 'deletion_pending'
      and (select public.account_is_active((select auth.uid())))
  )
);

drop policy if exists "owners can read guestbook entries" on public.guestbook_entries;
create policy "owners can read guestbook entries" on public.guestbook_entries
for select to authenticated
using (
  exists (
    select 1 from public.invitations
    where invitations.id = guestbook_entries.invitation_id
      and invitations.user_id = (select auth.uid())
      and invitations.status <> 'deletion_pending'
      and (select public.account_is_active((select auth.uid())))
  )
);

drop policy if exists "owners can moderate guestbook" on public.guestbook_entries;
create policy "owners can moderate guestbook" on public.guestbook_entries
for update to authenticated
using (
  exists (
    select 1 from public.invitations
    where invitations.id = guestbook_entries.invitation_id
      and invitations.user_id = (select auth.uid())
      and invitations.status <> 'deletion_pending'
      and (select public.account_is_active((select auth.uid())))
  )
)
with check (
  exists (
    select 1 from public.invitations
    where invitations.id = guestbook_entries.invitation_id
      and invitations.user_id = (select auth.uid())
      and invitations.status <> 'deletion_pending'
      and (select public.account_is_active((select auth.uid())))
  )
);

drop policy if exists "owners can read view logs" on public.view_logs;
create policy "owners can read view logs" on public.view_logs
for select to authenticated
using (
  exists (
    select 1 from public.invitations
    where invitations.id = view_logs.invitation_id
      and invitations.user_id = (select auth.uid())
      and invitations.status <> 'deletion_pending'
      and (select public.account_is_active((select auth.uid())))
  )
);

drop policy if exists "authenticated users can read own invitation assets" on storage.objects;
create policy "authenticated users can read own invitation assets"
on storage.objects for select to authenticated
using (
  bucket_id = 'invitation-assets'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select public.account_is_active((select auth.uid())))
);

drop policy if exists "authenticated users can delete own invitation assets" on storage.objects;
create policy "authenticated users can delete own invitation assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'invitation-assets'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select public.account_is_active((select auth.uid())))
);
