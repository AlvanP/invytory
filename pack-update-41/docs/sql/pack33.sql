-- Invytory pack 33: album opens on the event day, guests and hosts can delete photos.
-- Paste this whole file into Supabase > SQL Editor > New query, then Run.
-- Safe to run more than once. Run it BEFORE (or right after) you push pack 33.

-- ---------------------------------------------------------------------------
-- 1. Guest album: open from the event day, and let a guest remove their own photos
-- ---------------------------------------------------------------------------

-- A secret-code fingerprint saved with each new photo (the code itself stays on the guest's phone).
alter table public.album_photos add column if not exists uploader_key text;

-- Open for ADDING photos only from the first day of the event (Nigerian time).
create or replace function public.album_accepting(wid text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.album_open(wid)
    and coalesce(
      (select min(i.wedding_date::date) from public.invitations i where i.wedding_id::text = wid)
        <= (now() at time zone 'Africa/Lagos')::date,
      true
    )
$$;
grant execute on function public.album_accepting(text) to anon, authenticated;

drop policy if exists "Guests can add to an open album" on public.album_photos;
create policy "Guests can add to an open album"
  on public.album_photos for insert
  with check (public.album_accepting(wedding_id) and public.album_has_room(wedding_id));

drop policy if exists "Guests can upload to an open album" on storage.objects;
create policy "Guests can upload to an open album"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'guest-album'
    and public.album_accepting((storage.foldername(name))[1])
  );

-- A guest removes a photo only if they hold the secret code it was saved with.
create or replace function public.album_guest_delete(photo_id uuid, key_hash text)
returns table (path text, thumb_path text)
language plpgsql security definer set search_path = public
as $$
begin
  return query
    delete from public.album_photos p
    where p.id = photo_id
      and p.uploader_key is not null
      and p.uploader_key = key_hash
    returning p.path, p.thumb_path;
end;
$$;
grant execute on function public.album_guest_delete(uuid, text) to anon, authenticated;

-- Files whose photo record is gone can be cleaned up (this is how a removed photo's files disappear).
create or replace function public.album_file_in_use(file_name text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.album_photos p where p.path = file_name or p.thumb_path = file_name)
$$;
grant execute on function public.album_file_in_use(text) to anon, authenticated;

drop policy if exists "Orphan album files can be listed" on storage.objects;
create policy "Orphan album files can be listed"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'guest-album' and not public.album_file_in_use(name));

drop policy if exists "Orphan album files can be removed" on storage.objects;
create policy "Orphan album files can be removed"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'guest-album' and not public.album_file_in_use(name));

-- Hosts need to see their files to delete them.
drop policy if exists "Owners can list album files" on storage.objects;
create policy "Owners can list album files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'guest-album'
    and public.album_is_owner((storage.foldername(name))[1])
  );
