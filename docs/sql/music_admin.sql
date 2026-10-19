-- Invytory: admin-managed music library.
-- Paste into Supabase > SQL Editor > New query, then Run. Safe to run again.
-- Run docs/sql/music.sql and docs/sql/admin.sql first (already done earlier).

-- 1. Category (the kind of event). Sub-category is the existing "collection"
--    column: for weddings it is white / igbo / yoruba / hausa / universal
--    ("any ceremony"); for every other category it stays 'universal'.
alter table public.music_tracks
  add column if not exists category text not null default 'wedding';

alter table public.music_tracks drop constraint if exists music_tracks_category_check;
alter table public.music_tracks
  add constraint music_tracks_category_check
  check (category in ('wedding', 'child-dedication', 'birthday', 'corporate', 'funeral'));

alter table public.music_tracks drop constraint if exists music_tracks_collection_for_category;
alter table public.music_tracks
  add constraint music_tracks_collection_for_category
  check (category = 'wedding' or collection = 'universal');

-- 2. Platform admins may see every track (including hidden ones) and
--    add / change / remove tracks. Everyone else keeps read-only access
--    to active tracks.
drop policy if exists "Admins read all music tracks" on public.music_tracks;
create policy "Admins read all music tracks"
  on public.music_tracks for select to authenticated
  using (public.is_platform_admin());

drop policy if exists "Admins add music tracks" on public.music_tracks;
create policy "Admins add music tracks"
  on public.music_tracks for insert to authenticated
  with check (public.is_platform_admin());

drop policy if exists "Admins edit music tracks" on public.music_tracks;
create policy "Admins edit music tracks"
  on public.music_tracks for update to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "Admins delete music tracks" on public.music_tracks;
create policy "Admins delete music tracks"
  on public.music_tracks for delete to authenticated
  using (public.is_platform_admin());

-- 3. Only admins can put files into (or remove them from) music-library.
drop policy if exists "Admins upload library music" on storage.objects;
create policy "Admins upload library music"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'music-library' and public.is_platform_admin());

drop policy if exists "Admins delete library music" on storage.objects;
create policy "Admins delete library music"
  on storage.objects for delete to authenticated
  using (bucket_id = 'music-library' and public.is_platform_admin());
