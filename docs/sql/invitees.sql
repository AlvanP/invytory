-- Invytory: personal invitation links ("Chief Emeka Okonkwo is specially invited to ...").
-- Paste this whole file into Supabase > SQL Editor > New query, then Run.
-- It is safe to run more than once.
--
-- Who can do what:
--   * Only the event's owner can add, see or delete the personal links (and the names on them).
--   * A guest who opens a link can only look up THEIR OWN name from the code in the link, through
--     the two functions below. Nobody can list everyone's names.

create table if not exists public.invite_links (
  id uuid primary key default gen_random_uuid(),
  wedding_id text not null,
  guest_name text not null check (char_length(guest_name) between 1 and 80),
  code text not null unique check (char_length(code) between 6 and 20),
  opened_count integer not null default 0,
  first_opened_at timestamptz,
  last_opened_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists invite_links_wedding_idx on public.invite_links (wedding_id, created_at desc);

create or replace function public.invite_is_owner(wid text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.weddings w where w.id::text = wid and w.owner_id = auth.uid())
$$;
grant execute on function public.invite_is_owner(text) to authenticated;

alter table public.invite_links enable row level security;

drop policy if exists "Owners read their invite links" on public.invite_links;
create policy "Owners read their invite links"
  on public.invite_links for select using (public.invite_is_owner(wedding_id));

drop policy if exists "Owners add invite links" on public.invite_links;
create policy "Owners add invite links"
  on public.invite_links for insert with check (public.invite_is_owner(wedding_id));

drop policy if exists "Owners delete invite links" on public.invite_links;
create policy "Owners delete invite links"
  on public.invite_links for delete using (public.invite_is_owner(wedding_id));

grant select, insert, delete on public.invite_links to authenticated;

-- A guest's own name, from the code in their link.
create or replace function public.get_invite_link(link_code text)
returns table (guest_name text, wedding_id text)
language sql stable security definer set search_path = public
as $$
  select l.guest_name, l.wedding_id from public.invite_links l where l.code = link_code limit 1
$$;

-- Counts an open, so the host can see who has looked at their invitation.
create or replace function public.track_invite_open(link_code text)
returns void
language sql security definer set search_path = public
as $$
  update public.invite_links
  set opened_count = opened_count + 1,
      first_opened_at = coalesce(first_opened_at, now()),
      last_opened_at = now()
  where code = link_code
$$;

grant execute on function public.get_invite_link(text), public.track_invite_open(text) to anon, authenticated;

-- Lets an RSVP remember which personal link it came from.
alter table public.guests add column if not exists invite_code text;
