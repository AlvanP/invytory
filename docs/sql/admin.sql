-- Invytory: platform admin (owner dashboard at /admin).
-- Paste this whole file into Supabase > SQL Editor > New query, then Run.
-- It is safe to run more than once.
--
-- AFTER running it, make yourself an admin by running this ONE extra line
-- (change the email to the one you sign in with):
--
--   insert into public.platform_admins (user_id, email)
--   select id, email from auth.users where email = 'YOUR-EMAIL-HERE'
--   on conflict do nothing;
--
-- Everything below checks is_platform_admin() first, so a normal user who
-- finds these functions gets "not allowed" and no data.

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
-- No policies on purpose: nobody can read or edit this table from the website.

create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.platform_admins a where a.user_id = auth.uid())
$$;
grant execute on function public.is_platform_admin() to authenticated;

create or replace function public.admin_guard()
returns void
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'not allowed';
  end if;
end;
$$;

-- Headline numbers.
create or replace function public.admin_overview()
returns json
language plpgsql stable security definer set search_path = public
as $$
declare result json;
begin
  perform public.admin_guard();
  select json_build_object(
    'users', (select count(*) from auth.users),
    'users_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'users_30d', (select count(*) from auth.users where created_at > now() - interval '30 days'),
    'events', (select count(*) from public.weddings),
    'events_7d', (select count(*) from public.weddings where created_at > now() - interval '7 days'),
    'events_30d', (select count(*) from public.weddings where created_at > now() - interval '30 days'),
    'published', (select count(*) from public.weddings where status = 'published'),
    'suspended', (select count(*) from public.weddings where status = 'archived'),
    'expired', (select count(*) from public.weddings where expires_at is not null and expires_at < now()),
    'plans', coalesce((select json_object_agg(p, c) from (select coalesce(plan, 'none') p, count(*) c from public.weddings group by 1) t), '{}'::json),
    'event_types', coalesce((select json_object_agg(t, c) from (
        select coalesce(i.event_type, 'wedding') t, count(distinct i.wedding_id) c
        from public.invitations i where i.wedding_id is not null group by 1) x), '{}'::json),
    'views', (select coalesce(sum(views), 0) from public.weddings),
    'rsvps', (select count(*) from public.guests),
    'confirmed', (select count(*) from public.guests where status = 'confirmed'),
    'wall_messages', (select count(*) from public.wall_messages),
    'album_photos', (select count(*) from public.album_photos),
    'signups_by_day', coalesce((select json_agg(json_build_object('day', d, 'count', c) order by d) from (
        select (created_at at time zone 'Africa/Lagos')::date d, count(*) c
        from auth.users where created_at > now() - interval '30 days' group by 1) s), '[]'::json)
  ) into result;
  return result;
end;
$$;

-- Every event with its owner.
create or replace function public.admin_events()
returns table (
  id uuid, slug text, status text, plan text, owner_id uuid, owner_email text,
  created_at timestamptz, expires_at timestamptz, views integer,
  payment_reference text, event_type text, title text,
  ceremonies bigint, rsvps bigint, album_photos bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.admin_guard();
  return query
  select w.id, w.slug::text, w.status::text, w.plan::text, w.owner_id, u.email::text,
    w.created_at, w.expires_at, w.views::integer, w.payment_reference::text,
    coalesce(first_i.event_type, 'wedding')::text,
    trim(coalesce(first_i.bride_name, '') || case when coalesce(first_i.groom_name, '') <> '' then ' & ' || first_i.groom_name else '' end),
    (select count(*) from public.invitations i where i.wedding_id = w.id),
    (select count(*) from public.guests g join public.invitations i on i.id::text = g.invitation_id::text where i.wedding_id = w.id),
    (select count(*) from public.album_photos p where p.wedding_id = w.id::text)
  from public.weddings w
  left join auth.users u on u.id = w.owner_id
  left join lateral (
    select i.event_type, i.bride_name, i.groom_name from public.invitations i
    where i.wedding_id = w.id order by i.wedding_date asc limit 1
  ) first_i on true
  order by w.created_at desc
  limit 1000;
end;
$$;

-- Every person who has signed up.
create or replace function public.admin_users()
returns table (
  id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz,
  events bigint, is_admin boolean
)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.admin_guard();
  return query
  select u.id, u.email::text, u.created_at, u.last_sign_in_at,
    (select count(*) from public.weddings w where w.owner_id = u.id),
    exists (select 1 from public.platform_admins a where a.user_id = u.id)
  from auth.users u
  order by u.created_at desc
  limit 2000;
end;
$$;

-- Suspend ('archived'), restore ('published') or reset to draft.
create or replace function public.admin_set_event_status(wid uuid, new_status text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.admin_guard();
  if new_status not in ('draft', 'published', 'archived') then
    raise exception 'bad status';
  end if;
  update public.weddings set status = new_status where id = wid;
  update public.invitations set status = new_status where wedding_id = wid;
end;
$$;

-- Give an event more (or less) hosting time.
create or replace function public.admin_set_event_expiry(wid uuid, new_expiry timestamptz)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.admin_guard();
  update public.weddings set expires_at = new_expiry where id = wid;
  update public.invitations set expires_at = new_expiry where wedding_id = wid;
end;
$$;

-- Remove an event and everything attached to it. Cannot be undone.
create or replace function public.admin_delete_event(wid uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.admin_guard();
  delete from public.wall_messages where invitation_id in (select i.id::text from public.invitations i where i.wedding_id = wid);
  delete from public.guests where invitation_id::text in (select i.id::text from public.invitations i where i.wedding_id = wid);
  delete from public.album_photos where wedding_id = wid::text;
  delete from public.invitations where wedding_id = wid;
  delete from public.weddings where id = wid;
end;
$$;

grant execute on function
  public.admin_overview(), public.admin_events(), public.admin_users(),
  public.admin_set_event_status(uuid, text), public.admin_set_event_expiry(uuid, timestamptz),
  public.admin_delete_event(uuid)
to authenticated;
