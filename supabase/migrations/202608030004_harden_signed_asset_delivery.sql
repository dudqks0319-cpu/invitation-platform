-- Local migration artifact only. Apply and verify separately in staging.
-- This migration does not authorize Production Storage or provider changes.

update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'invitation-assets';

drop policy if exists "public can read invitation assets" on storage.objects;
drop policy if exists "authenticated users manage own invitation assets" on storage.objects;
drop policy if exists "authenticated users can read own invitation assets" on storage.objects;
drop policy if exists "authenticated users can delete own invitation assets" on storage.objects;

comment on table storage.objects is
  'Invitation assets are private. Authenticated clients have no direct object read/delete policy; bounded service endpoints enforce owner/public access.';
