-- Invytory: entrance videos and settings, managed from the platform admin (Admin > Entrances).
-- Paste this whole file into Supabase > SQL Editor > New query, then Run. Safe to run more than once.
-- Needs docs/sql/admin.sql (is_platform_admin) to have been run already.

create table if not exists public.entrance_settings (
  template_id text primary key,
  video_url text,            -- public link of the uploaded video; empty = use the built-in entrance
  video_path text,           -- where the file sits in storage (so it can be replaced or deleted)
  music_start text not null default 'tap',   -- tap | end | content | after:1 .. after:10
  muted boolean not null default false,      -- play the entrance video without its own sound
  names_at numeric,          -- seconds into the video when the couple's names fade in (empty = never)
  names_color text,          -- colour of those names, e.g. #E6CF9A
  updated_at timestamptz not null default now()
);

alter table public.entrance_settings enable row level security;

drop policy if exists "Anyone can read entrance settings" on public.entrance_settings;
create policy "Anyone can read entrance settings" on public.entrance_settings for select using (true);
drop policy if exists "Admins add entrance settings" on public.entrance_settings;
create policy "Admins add entrance settings" on public.entrance_settings for insert to authenticated with check (public.is_platform_admin());
drop policy if exists "Admins edit entrance settings" on public.entrance_settings;
create policy "Admins edit entrance settings" on public.entrance_settings for update to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists "Admins delete entrance settings" on public.entrance_settings;
create policy "Admins delete entrance settings" on public.entrance_settings for delete to authenticated using (public.is_platform_admin());

-- Storage: one public-read bucket for the videos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('entrance-videos', 'entrance-videos', true, 52428800, array['video/mp4', 'video/webm', 'image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 52428800, allowed_mime_types = array['video/mp4', 'video/webm', 'image/jpeg'];

drop policy if exists "Anyone can watch entrance videos" on storage.objects;
create policy "Anyone can watch entrance videos" on storage.objects for select using (bucket_id = 'entrance-videos');
drop policy if exists "Admins upload entrance videos" on storage.objects;
create policy "Admins upload entrance videos" on storage.objects for insert to authenticated
  with check (bucket_id = 'entrance-videos' and public.is_platform_admin());
drop policy if exists "Admins replace entrance videos" on storage.objects;
create policy "Admins replace entrance videos" on storage.objects for update to authenticated
  using (bucket_id = 'entrance-videos' and public.is_platform_admin());
drop policy if exists "Admins delete entrance videos" on storage.objects;
create policy "Admins delete entrance videos" on storage.objects for delete to authenticated
  using (bucket_id = 'entrance-videos' and public.is_platform_admin());

-- Modern Luxury: the couple's names fade in 3.57 seconds into the video, in light gold.
insert into public.entrance_settings (template_id, names_at, names_color)
values ('modern-luxury', 3.57, '#E6CF9A')
on conflict (template_id) do nothing;
