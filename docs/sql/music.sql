-- Invytory: music feature database setup.
-- Paste this whole file into Supabase > SQL Editor > New query, then Run.
-- It is safe to run more than once.

-- 1. Music columns on invitations. One invitations row = one ceremony,
--    so each ceremony can have its own track.
alter table public.invitations
  add column if not exists music_source text check (music_source in ('library', 'upload')),
  add column if not exists music_url text,
  add column if not exists music_title text;

-- 2. The library of tracks YOU provide. Couples can only read it.
--    You add rows in Supabase > Table Editor (or import a CSV there).
create table if not exists public.music_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_credit text,
  collection text not null check (collection in ('white', 'igbo', 'yoruba', 'hausa', 'universal')),
  mood text,
  url text not null,
  duration_seconds integer,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.music_tracks enable row level security;

drop policy if exists "Anyone can read active music tracks" on public.music_tracks;
create policy "Anyone can read active music tracks"
  on public.music_tracks for select
  using (is_active = true);
-- No insert / update / delete policies on purpose: only you, in the
-- dashboard, can change the library.

-- 3. Storage buckets. Both are public-read (guests stream the audio).
--    The size limit and allowed file types are enforced by Supabase itself,
--    not only by the website.
--    music-library    : your tracks, uploaded by you in the dashboard (20 MB each)
--    invitation-music : tracks couples upload themselves (15 MB each)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('music-library', 'music-library', true, 20971520,
    array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac']),
  ('invitation-music', 'invitation-music', true, 15728640,
    array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 4. Who may upload into invitation-music. The create wizard works before
--    sign-in (people sign in at checkout), so this allows anyone to add a
--    file, but never to change or delete one. NOTE: that means anyone could
--    fill this bucket with files. The size/type limits above cap each file;
--    if abuse ever appears, change "to public" to "to authenticated" and
--    require sign-in before the music upload.
drop policy if exists "Anyone can upload invitation music" on storage.objects;
create policy "Anyone can upload invitation music"
  on storage.objects for insert
  to public
  with check (bucket_id = 'invitation-music');
