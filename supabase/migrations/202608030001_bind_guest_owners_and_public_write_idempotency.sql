-- Local migration artifact only. Apply and verify separately in the target Supabase project.

alter table public.invitations
  add column if not exists guest_publish_idempotency_key_hash text,
  add column if not exists guest_publish_request_hash text;

alter table public.rsvps
  add column if not exists idempotency_key_hash text,
  add column if not exists request_hash text;

alter table public.guestbook_entries
  add column if not exists idempotency_key_hash text,
  add column if not exists request_hash text;

create unique index if not exists idx_invitations_guest_publish_idempotency
  on public.invitations(guest_publish_idempotency_key_hash)
  where guest_publish_idempotency_key_hash is not null;

create unique index if not exists idx_rsvps_public_idempotency
  on public.rsvps(invitation_id, idempotency_key_hash)
  where idempotency_key_hash is not null;

create unique index if not exists idx_guestbook_public_idempotency
  on public.guestbook_entries(invitation_id, idempotency_key_hash)
  where idempotency_key_hash is not null;

drop policy if exists "owners can create draft invitations"
on public.invitations;
drop policy if exists "owners can update draft invitations"
on public.invitations;

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
);

create policy "owners can update draft invitations"
on public.invitations
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and guest_publish_idempotency_key_hash is null
)
with check (
  (select auth.uid()) = user_id
  and status = 'draft'
  and repurchase_required = false
  and paid_payload_snapshot is null
  and guest_publish_idempotency_key_hash is null
  and guest_publish_request_hash is null
  and published_at is null
);

drop policy if exists "public can create rsvps for published invitations"
on public.rsvps;
drop policy if exists "service role writes rsvps"
on public.rsvps;
revoke insert, update, delete on table public.rsvps
from public, anon, authenticated;
grant insert, update, delete on table public.rsvps to service_role;

drop policy if exists "public can create guestbook for published invitations"
on public.guestbook_entries;
drop policy if exists "service role writes guestbook"
on public.guestbook_entries;
revoke insert, delete on table public.guestbook_entries
from public, anon, authenticated;
grant insert, delete on table public.guestbook_entries to service_role;

-- Re-apply the atomic implementation in this forward migration as well. The
-- earlier hardening migration may already have run in a target environment,
-- so editing that historical file alone would not upgrade the deployed RPC.
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
