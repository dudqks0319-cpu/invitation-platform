-- Local migration artifact only. Apply and verify separately in the target Supabase project.
-- View logs retain privacy-safe identity material for 1 day and aggregate rows
-- for 90 days. cleanup_view_logs must be scheduled and observed in staging.

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

create unique index if not exists idx_view_logs_idempotency
  on public.view_logs(invitation_id, idempotency_key_hash);
create index if not exists idx_view_logs_invitation_created
  on public.view_logs(invitation_id, created_at desc);
create index if not exists idx_view_logs_identity_expiry
  on public.view_logs(identity_expires_at)
  where visitor_key is not null;
create index if not exists idx_view_logs_expiry on public.view_logs(expires_at);

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
    select 1 from public.invitations
    where invitations.id = p_invitation_id
      and invitations.status = 'published'
  ) then
    return query select 'not_found'::text;
    return;
  end if;

  insert into public.view_logs (
    invitation_id, visitor_key, identity_kind, user_agent,
    idempotency_key_hash, request_hash, cost_units,
    identity_expires_at, expires_at, created_at
  ) values (
    p_invitation_id, p_visitor_key, p_identity_kind, null,
    p_idempotency_key_hash, p_request_hash, 1,
    p_issued_at + interval '1 day', p_issued_at + interval '90 days', p_issued_at
  )
  on conflict (invitation_id, idempotency_key_hash) do nothing
  returning id into inserted_id;

  if inserted_id is not null then
    return query select 'inserted'::text;
    return;
  end if;

  select view_logs.request_hash into existing_request_hash
  from public.view_logs
  where view_logs.invitation_id = p_invitation_id
    and view_logs.idempotency_key_hash = p_idempotency_key_hash;

  return query select case
    when existing_request_hash = p_request_hash then 'replayed'::text
    else 'collision'::text
  end;
end;
$$;

revoke insert, update, delete on table public.view_logs
from public, anon, authenticated, service_role;
revoke all on function public.record_invitation_view(uuid, text, text, text, text, timestamptz)
from public, anon, authenticated;
grant execute on function public.record_invitation_view(uuid, text, text, text, text, timestamptz)
to service_role;

drop policy if exists "owners can read view logs" on public.view_logs;
create policy "owners can read view logs"
on public.view_logs
for select
to authenticated
using (
  exists (
    select 1 from public.invitations
    where invitations.id = view_logs.invitation_id
      and (select auth.uid()) = invitations.user_id
  )
);

create or replace function public.cleanup_view_logs(batch_size integer default 1000)
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
    raise exception 'batch_size must be between 1 and 5000' using errcode = '22023';
  end if;

  with candidates as (
    select id from public.view_logs
    where identity_expires_at <= pg_catalog.now() and visitor_key is not null
    order by identity_expires_at, id limit batch_size
    for update skip locked
  )
  update public.view_logs
  set visitor_key = null, user_agent = null,
      idempotency_key_hash = null, request_hash = null
  where id in (select id from candidates);
  get diagnostics redacted_rows = row_count;

  with candidates as (
    select id from public.view_logs
    where expires_at <= pg_catalog.now()
    order by expires_at, id limit batch_size
    for update skip locked
  )
  delete from public.view_logs where id in (select id from candidates);
  get diagnostics deleted_rows = row_count;

  return query select redacted_rows, deleted_rows;
end;
$$;

revoke all on function public.cleanup_view_logs(integer)
from public, anon, authenticated;
grant execute on function public.cleanup_view_logs(integer) to service_role;
