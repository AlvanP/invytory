-- Invytory: guest photo album (Signature plan).
-- Paste this whole file into Supabase > SQL Editor > New query, then Run.
-- It is safe to run more than once.
--
-- Who can do what:
--   * Anyone with the album link can ADD photos and SEE the album, but only
--     while the event is published, on the Signature plan ('gold'), and not expired.
--   * Only the event's owner can DELETE photos.
--   * Each album holds at most 2000 photos.

create table if not exists public.album_photos (
  id uuid primary key default gen_random_uuid(),
  wedding_id text not null,
  path text not null,
  thumb_path text,
  uploader_name text check (uploader_name is null or char_length(uploader_name) <= 60),
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists album_photos_wedding_idx
  on public.album_photos (wedding_id, created_at desc);

-- Is this event's album open to guests right now?
create or replace function public.album_open(wid text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.weddings w
    where w.id::text = wid
      and w.status = 'published'
      and w.plan = 'gold'
      and (w.expires_at is null or w.expires_at > now())
  )
$$;

create or replace function public.album_has_room(wid text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select (select count(*) from public.album_photos p where p.wedding_id = wid) < 2000
$$;

create or replace function public.album_is_owner(wid text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.weddings w where w.id::text = wid and w.owner_id = auth.uid())
$$;

grant execute on function public.album_open(text), public.album_has_room(text), public.album_is_owner(text)
  to anon, authenticated;

alter table public.album_photos enable row level security;

drop policy if exists "Guests can see an open album" on public.album_photos;
create policy "Guests can see an open album"
  on public.album_photos for select
  using (public.album_open(wedding_id));

drop policy if exists "Owners can see their album" on public.album_photos;
create policy "Owners can see their album"
  on public.album_photos for select
  using (public.album_is_owner(wedding_id));

drop policy if exists "Guests can add to an open album" on public.album_photos;
create policy "Guests can add to an open album"
  on public.album_photos for insert
  with check (public.album_open(wedding_id) and public.album_has_room(wedding_id));

drop policy if exists "Owners can delete album photos" on public.album_photos;
create policy "Owners can delete album photos"
  on public.album_photos for delete
  using (public.album_is_owner(wedding_id));

grant select, insert on public.album_photos to anon, authenticated;
grant delete on public.album_photos to authenticated;

-- Storage: one public-read bucket. File names are random and the folder is the
-- event id, so only people with the album link ever see the picture addresses.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guest-album', 'guest-album', true, 31457280,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Guests can upload to an open album" on storage.objects;
create policy "Guests can upload to an open album"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'guest-album'
    and public.album_open((storage.foldername(name))[1])
  );

drop policy if exists "Owners can delete album files" on storage.objects;
create policy "Owners can delete album files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'guest-album'
    and public.album_is_owner((storage.foldername(name))[1])
  );
