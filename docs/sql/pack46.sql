-- Invytory pack 46: preview music per category, and unfinished-invitation leads for the admin.
-- Paste this whole file into Supabase > SQL Editor > New query, then Run. Safe to run more than once.
-- Needs docs/sql/admin.sql (is_platform_admin) to have been run already.

-- 1. The song that plays while a category's templates are previewed (Admin > Page music).
create table if not exists public.category_music (
  key text primary key,      -- wedding:white | wedding:igbo | wedding:yoruba | wedding:hausa | child-dedication | birthday | corporate | funeral
  track_id text,
  title text,
  url text,
  updated_at timestamptz not null default now()
);
alter table public.category_music enable row level security;
drop policy if exists "Anyone can read category music" on public.category_music;
create policy "Anyone can read category music" on public.category_music for select using (true);
drop policy if exists "Admins add category music" on public.category_music;
create policy "Admins add category music" on public.category_music for insert to authenticated with check (public.is_platform_admin());
drop policy if exists "Admins edit category music" on public.category_music;
create policy "Admins edit category music" on public.category_music for update to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists "Admins delete category music" on public.category_music;
create policy "Admins delete category music" on public.category_music for delete to authenticated using (public.is_platform_admin());

-- 2. People who started an invitation and gave their email (Admin > Leads).
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  event_type text,
  names text,
  template_id text,
  plan text,
  created_at timestamptz not null default now()
);
create index if not exists leads_email_idx on public.leads (lower(email));
alter table public.leads enable row level security;
drop policy if exists "Anyone can leave a lead" on public.leads;
create policy "Anyone can leave a lead" on public.leads for insert to anon, authenticated with check (true);
drop policy if exists "Admins read leads" on public.leads;
create policy "Admins read leads" on public.leads for select to authenticated using (public.is_platform_admin());
drop policy if exists "Admins delete leads" on public.leads;
create policy "Admins delete leads" on public.leads for delete to authenticated using (public.is_platform_admin());

-- The admin's list: newest first, one row per email, and whether that person has published anything.
create or replace function public.admin_leads()
returns table (email text, event_type text, names text, template_id text, plan text, last_seen timestamptz, tries bigint, has_published boolean)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'not allowed'; end if;
  return query
  select l.email, (array_agg(l.event_type order by l.created_at desc))[1], (array_agg(l.names order by l.created_at desc))[1],
         (array_agg(l.template_id order by l.created_at desc))[1], (array_agg(l.plan order by l.created_at desc))[1],
         max(l.created_at), count(*),
         exists (select 1 from public.weddings w join auth.users u on u.id = w.owner_id
                 where lower(u.email) = lower(l.email) and w.status = 'published')
  from public.leads l
  group by l.email
  order by max(l.created_at) desc;
end $$;
grant execute on function public.admin_leads() to authenticated;
