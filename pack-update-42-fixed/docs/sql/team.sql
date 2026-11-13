-- Invytory: invite a manager to ONE invitation ("Team").
-- Paste this whole file into Supabase > SQL Editor > New query, then Run. Safe to run more than once.
--
-- What a manager can do, for that one event only: see and edit its ceremonies, see and manage guests,
-- RSVPs, special-guest links, the wall and the photo album.
-- What only the owner can do: delete the event, change its plan, status, hosting date or payment,
-- and add or remove managers.

create table if not exists public.event_managers (
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  primary key (wedding_id, user_id)
);

create table if not exists public.event_invites (
  token text primary key,
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  email text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  used_by uuid,
  used_at timestamptz
);

alter table public.event_managers enable row level security;
alter table public.event_invites enable row level security;
-- No direct access to event_invites: everything goes through the functions below.
drop policy if exists "See my own manager rows" on public.event_managers;
create policy "See my own manager rows" on public.event_managers for select using (user_id = auth.uid());
grant select on public.event_managers to authenticated;

-- ───────────── who is who ─────────────
create or replace function public.is_event_manager(wid text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.event_managers m where m.wedding_id::text = wid and m.user_id = auth.uid())
$$;

create or replace function public.is_event_owner(wid text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.weddings w where w.id::text = wid and w.owner_id = auth.uid())
$$;

create or replace function public.is_event_member(wid text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_event_owner(wid) or public.is_event_manager(wid)
$$;
grant execute on function public.is_event_manager(text), public.is_event_owner(text), public.is_event_member(text) to anon, authenticated;

-- The album and special-guest links already ask "is this person the owner?". Managers now pass too.
create or replace function public.album_is_owner(wid text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_event_member(wid)
$$;
create or replace function public.invite_is_owner(wid text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_event_member(wid)
$$;

-- ───────────── invites ─────────────
create or replace function public.create_event_invite(wid uuid, invite_email text default null)
returns text language plpgsql security definer set search_path = public as $$
declare tok text;
begin
  if not public.is_event_owner(wid::text) then raise exception 'Only the owner can invite managers.'; end if;
  tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into public.event_invites (token, wedding_id, email, created_by)
  values (tok, wid, nullif(lower(trim(invite_email)), ''), auth.uid());
  return tok;
end $$;

create or replace function public.invite_preview(tok text)
returns table (names text, usable boolean, email_locked boolean)
language sql stable security definer set search_path = public as $$
  select
    coalesce((select i.bride_name || case when coalesce(i.groom_name, '') <> '' then ' & ' || i.groom_name else '' end
              from public.invitations i where i.wedding_id = v.wedding_id order by i.wedding_date limit 1), 'an invitation'),
    (v.used_by is null and v.expires_at > now()),
    v.email is not null
  from public.event_invites v where v.token = tok
$$;

create or replace function public.accept_event_invite(tok text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v public.event_invites; me_email text;
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select * into v from public.event_invites where token = tok for update;
  if not found then raise exception 'This invite link is not valid.'; end if;
  if v.used_by is not null then raise exception 'This invite link has already been used.'; end if;
  if v.expires_at < now() then raise exception 'This invite link has expired. Ask the host for a new one.'; end if;
  select lower(email) into me_email from auth.users where id = auth.uid();
  if v.email is not null and v.email <> coalesce(me_email, '') then
    raise exception 'This invite was sent to a different email address. Sign in with %.', v.email;
  end if;
  if public.is_event_owner(v.wedding_id::text) then raise exception 'You already own this invitation.'; end if;
  insert into public.event_managers (wedding_id, user_id, email) values (v.wedding_id, auth.uid(), me_email)
  on conflict do nothing;
  update public.event_invites set used_by = auth.uid(), used_at = now() where token = tok;
  return v.wedding_id;
end $$;

create or replace function public.event_team(wid uuid)
returns table (kind text, ref text, email text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_event_member(wid::text) then raise exception 'No access.'; end if;
  return query
    select 'manager'::text, m.user_id::text, m.email, m.created_at from public.event_managers m where m.wedding_id = wid
    union all
    select 'invite'::text, v.token, v.email, v.created_at from public.event_invites v
      where v.wedding_id = wid and v.used_by is null and v.expires_at > now() and public.is_event_owner(wid::text)
    order by 4 desc;
end $$;

create or replace function public.remove_event_manager(wid uuid, uid uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_event_owner(wid::text) or uid = auth.uid()) then raise exception 'Only the owner can remove a manager.'; end if;
  delete from public.event_managers where wedding_id = wid and user_id = uid;
end $$;

create or replace function public.revoke_event_invite(tok text)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.event_invites v where v.token = tok and public.is_event_owner(v.wedding_id::text);
end $$;

grant execute on function
  public.create_event_invite(uuid, text), public.invite_preview(text), public.accept_event_invite(text),
  public.event_team(uuid), public.remove_event_manager(uuid, uuid), public.revoke_event_invite(text)
  to authenticated;
grant execute on function public.invite_preview(text) to anon;

-- ───────────── what managers may touch (added next to the owner's own rules) ─────────────
drop policy if exists "Managers read the event" on public.weddings;
create policy "Managers read the event" on public.weddings for select using (public.is_event_manager(id::text));
drop policy if exists "Managers edit the event" on public.weddings;
create policy "Managers edit the event" on public.weddings for update using (public.is_event_manager(id::text)) with check (public.is_event_manager(id::text));

drop policy if exists "Managers read ceremonies" on public.invitations;
create policy "Managers read ceremonies" on public.invitations for select using (public.is_event_manager(wedding_id::text));
drop policy if exists "Managers edit ceremonies" on public.invitations;
create policy "Managers edit ceremonies" on public.invitations for update
  using (public.is_event_manager(wedding_id::text)) with check (public.is_event_manager(wedding_id::text));

drop policy if exists "Managers read guests" on public.guests;
create policy "Managers read guests" on public.guests for select using (
  exists (select 1 from public.invitations i where i.id::text = guests.invitation_id::text and public.is_event_manager(i.wedding_id::text)));
drop policy if exists "Managers edit guests" on public.guests;
create policy "Managers edit guests" on public.guests for update using (
  exists (select 1 from public.invitations i where i.id::text = guests.invitation_id::text and public.is_event_manager(i.wedding_id::text)));
drop policy if exists "Managers delete guests" on public.guests;
create policy "Managers delete guests" on public.guests for delete using (
  exists (select 1 from public.invitations i where i.id::text = guests.invitation_id::text and public.is_event_manager(i.wedding_id::text)));

drop policy if exists "Managers delete wall messages" on public.wall_messages;
create policy "Managers delete wall messages" on public.wall_messages for delete using (
  exists (select 1 from public.invitations i where i.id::text = wall_messages.invitation_id and public.is_event_manager(i.wedding_id::text)));

-- Managers can never change who owns an event, or its plan, status, hosting date or payment.
create or replace function public.guard_owner_only_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_platform_admin() then
    if tg_table_name = 'weddings' and old.owner_id is distinct from auth.uid() then
      if new.owner_id is distinct from old.owner_id or new.plan is distinct from old.plan
         or new.status is distinct from old.status or new.expires_at is distinct from old.expires_at
         or new.max_guests is distinct from old.max_guests or new.payment_reference is distinct from old.payment_reference then
        raise exception 'Only the owner can change that.';
      end if;
    elsif tg_table_name = 'invitations' and old.owner_id is distinct from auth.uid() then
      if new.owner_id is distinct from old.owner_id or new.wedding_id is distinct from old.wedding_id then
        raise exception 'Only the owner can change that.';
      end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists guard_weddings_owner_only on public.weddings;
create trigger guard_weddings_owner_only before update on public.weddings
  for each row execute function public.guard_owner_only_changes();
drop trigger if exists guard_invitations_owner_only on public.invitations;
create trigger guard_invitations_owner_only before update on public.invitations
  for each row execute function public.guard_owner_only_changes();
