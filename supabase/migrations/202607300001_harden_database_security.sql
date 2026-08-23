-- This migration is intentionally checked in but is not applied automatically.

update storage.buckets
set public = false
where id = 'invitation-assets';

drop policy if exists "public can read invitation assets" on storage.objects;
drop policy if exists "authenticated users manage own invitation assets" on storage.objects;
drop policy if exists "authenticated users can read own invitation assets" on storage.objects;
drop policy if exists "authenticated users can delete own invitation assets" on storage.objects;

create policy "authenticated users can read own invitation assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'invitation-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "authenticated users can delete own invitation assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'invitation-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
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
using ((select auth.uid()) = user_id);

create policy "owners can create draft invitations"
on public.invitations
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and status = 'draft'
  and repurchase_required = false
  and paid_payload_snapshot is null
  and published_at is null
);

create policy "owners can update draft invitations"
on public.invitations
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
  and status = 'draft'
  and repurchase_required = false
  and paid_payload_snapshot is null
  and published_at is null
);

create policy "owners can delete invitations"
on public.invitations
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "public can read published invitations" on public.invitations;
revoke select on table public.invitations from public, anon;
grant select on table public.invitations to authenticated, service_role;

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

drop policy if exists "public can insert view logs for published invitations"
on public.view_logs;
revoke insert on table public.view_logs from public, anon, authenticated;
grant insert on table public.view_logs to service_role;

create index if not exists idx_rate_limits_reset_at
on public.rate_limits(reset_at);
