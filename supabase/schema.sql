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
  slug text unique,
  event_type text not null default 'wedding',
  title text not null default '초대장',
  template_id text not null default 'wedding-classic',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  payload jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  phone text check (phone is null or char_length(phone) <= 20),
  attending boolean not null default true,
  guest_count integer not null default 1 check (guest_count between 0 and 50),
  memo text check (memo is null or char_length(memo) <= 500),
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 50),
  message text not null check (char_length(message) between 1 and 500),
  is_approved boolean not null default false,
  anonymous_id text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.visits (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  ip_hash text,
  anonymous_id text,
  reason text,
  created_at timestamptz not null default now()
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
alter table public.rsvps enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.visits enable row level security;
alter table public.blocked_users enable row level security;

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

drop policy if exists "public can create rsvps for published invitations" on public.rsvps;
drop policy if exists "service role writes rsvps" on public.rsvps;
drop policy if exists "owners can read rsvps" on public.rsvps;
drop policy if exists "owners can delete rsvps" on public.rsvps;

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

create policy "owners can delete rsvps"
on public.rsvps
for delete
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
drop policy if exists "public can read approved guestbook for published invitations" on public.guestbook_entries;
drop policy if exists "owners can moderate guestbook" on public.guestbook_entries;
drop policy if exists "owners can delete guestbook" on public.guestbook_entries;

create policy "anyone can read approved guestbook"
on public.guestbook_entries
for select
to anon, authenticated
using (
  is_approved = true
  and exists (
    select 1
    from public.invitations
    where invitations.id = guestbook_entries.invitation_id
      and invitations.status = 'published'
  )
);

create policy "owners can read all guestbook"
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

create policy "owners can update guestbook"
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

create policy "owners can delete guestbook"
on public.guestbook_entries
for delete
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = guestbook_entries.invitation_id
      and invitations.user_id = auth.uid()
  )
);

drop policy if exists "public can insert view logs for published invitations" on public.visits;
drop policy if exists "owners can read view logs" on public.visits;
drop policy if exists "owners can read visits" on public.visits;

create policy "owners can read visits"
on public.visits
for select
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = visits.invitation_id
      and invitations.user_id = auth.uid()
  )
);

drop policy if exists "owners manage blocked users" on public.blocked_users;
create policy "owners manage blocked users"
on public.blocked_users
for all
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = blocked_users.invitation_id
      and invitations.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.invitations
    where invitations.id = blocked_users.invitation_id
      and invitations.user_id = auth.uid()
  )
);

create index if not exists idx_invitations_user_id on public.invitations(user_id);
create index if not exists idx_invitations_slug on public.invitations(slug);
create index if not exists idx_invitations_status on public.invitations(status);
create index if not exists idx_rsvps_invitation_id on public.rsvps(invitation_id);
create index if not exists idx_guestbook_invitation_id on public.guestbook_entries(invitation_id);
create index if not exists idx_visits_invitation_id on public.visits(invitation_id);
create index if not exists idx_blocked_users_invitation_id on public.blocked_users(invitation_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitation-photos',
  'invitation-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'invitation-assets';

drop policy if exists "public can read invitation photos" on storage.objects;
create policy "public can read invitation photos"
on storage.objects
for select
to public
using (bucket_id in ('invitation-photos', 'invitation-assets'));

drop policy if exists "authenticated users manage own photos" on storage.objects;
create policy "authenticated users manage own photos"
on storage.objects
for all
to authenticated
using (
  bucket_id in ('invitation-photos', 'invitation-assets')
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in ('invitation-photos', 'invitation-assets')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.save_invitation(
  p_id uuid,
  p_payload jsonb,
  p_expected_revision integer,
  p_status text default 'draft'
)
returns table(
  success boolean,
  error_code text,
  current_revision integer,
  server_payload jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_current_revision integer;
  v_current_payload jsonb;
  v_current_status text;
  v_new_revision integer;
  v_slug text;
  v_event_type text;
  v_template_id text;
  v_gallery_count integer;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return query select false, 'AUTH_SESSION_EXPIRED'::text, 0, null::jsonb;
    return;
  end if;

  if p_status not in ('draft', 'published', 'archived') then
    return query select false, 'SAVE_PAYLOAD_INVALID'::text, 0, null::jsonb;
    return;
  end if;

  v_event_type := coalesce(p_payload->>'eventType', p_payload->>'category', 'wedding');
  v_template_id := coalesce(p_payload->>'templateId', 'wedding-classic');
  v_gallery_count := coalesce(jsonb_array_length(p_payload->'photos'->'gallery'), 0);

  if v_gallery_count > 10 then
    return query select false, 'PHOTO_LIMIT_EXCEEDED'::text, 0, null::jsonb;
    return;
  end if;

  v_slug := p_payload->'share'->>'slug';
  if v_slug is null then
    v_slug := p_payload->>'slug';
  end if;

  if p_status = 'published' then
    if p_payload->>'title' is null or length(p_payload->>'title') = 0 then
      return query select false, 'SAVE_PAYLOAD_INVALID'::text, 0, null::jsonb;
      return;
    end if;

    if v_slug is not null and v_slug in (
      'api', 'admin', 'app', 'auth', 'login', 'signup',
      'settings', 'profile', 'help', 'support', 'about',
      'terms', 'privacy', 'pricing', 'blog', 'status',
      'i', 'invitation', 'invitations', 'builder', 'template',
      'templates', 'rsvp', 'guestbook', 'og', 'public',
      'checkout', 'sign-in', 'sign-up', 'dashboard', 'preview'
    ) then
      return query select false, 'SLUG_RESERVED_WORD'::text, 0, null::jsonb;
      return;
    end if;

    if v_slug is not null and exists (
      select 1
      from invitations
      where slug = v_slug
        and id != p_id
        and status = 'published'
    ) then
      return query select false, 'SLUG_ALREADY_TAKEN'::text, 0, null::jsonb;
      return;
    end if;
  end if;

  select revision, payload, status
  into v_current_revision, v_current_payload, v_current_status
  from invitations
  where id = p_id
    and user_id = v_user_id
  for update;

  if not found then
    if p_status = 'archived' then
      return query select false, 'SAVE_PAYLOAD_INVALID'::text, 0, null::jsonb;
      return;
    end if;

    insert into invitations (id, user_id, payload, slug, event_type, title, template_id, status, revision, published_at)
    values (
      p_id,
      v_user_id,
      p_payload,
      v_slug,
      v_event_type,
      coalesce(p_payload->>'title', '초대장'),
      v_template_id,
      p_status,
      1,
      case when p_status = 'published' then now() else null end
    );

    return query select true, null::text, 1, p_payload;
    return;
  end if;

  if v_current_status = 'archived' then
    return query select false, 'SAVE_PAYLOAD_INVALID'::text, v_current_revision, v_current_payload;
    return;
  end if;

  if v_current_status = 'draft' and p_status = 'archived' then
    return query select false, 'SAVE_PAYLOAD_INVALID'::text, v_current_revision, v_current_payload;
    return;
  end if;

  if v_current_revision != p_expected_revision then
    return query select false, 'SAVE_REVISION_CONFLICT'::text, v_current_revision, v_current_payload;
    return;
  end if;

  v_new_revision := v_current_revision + 1;

  update invitations
  set payload = p_payload,
      slug = coalesce(v_slug, slug),
      event_type = v_event_type,
      title = coalesce(p_payload->>'title', title),
      template_id = v_template_id,
      status = p_status,
      revision = v_new_revision,
      published_at = case
        when p_status = 'published' and v_current_status != 'published' then now()
        else published_at
      end,
      updated_at = now()
  where id = p_id
    and user_id = v_user_id;

  return query select true, null::text, v_new_revision, p_payload;
end;
$$;

revoke all on function save_invitation(uuid, jsonb, integer, text) from public;
grant execute on function save_invitation(uuid, jsonb, integer, text) to authenticated;
