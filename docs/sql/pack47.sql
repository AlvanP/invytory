-- Invytory pack 47: reminder emails (unfinished invitations + guest reminders).
-- Paste this whole file into Supabase > SQL Editor > New query, then Run. Safe to run more than once.
-- Needs pack46.sql (the leads table) to have been run already.

-- 1. Unfinished-invitation reminders: remember how many we have sent to each lead.
alter table public.leads add column if not exists reminders_sent integer not null default 0;
alter table public.leads add column if not exists last_reminded_at timestamptz;

-- 2. Guest reminders: an optional email on the RSVP, and a note of which reminders went out.
alter table public.guests add column if not exists email text;
alter table public.guests add column if not exists reminded_week boolean not null default false;
alter table public.guests add column if not exists reminded_day boolean not null default false;

-- 3. Who is due a "finish your invitation" email: not published, first email after 24 hours,
--    one more after 5 days, then never again. One row per email address.
create or replace function public.leads_due_for_reminder()
returns table (email text, names text, event_type text, template_id text, stage integer)
language sql security definer set search_path = public as $$
  select l.email,
         (array_agg(l.names order by l.created_at desc))[1],
         (array_agg(l.event_type order by l.created_at desc))[1],
         (array_agg(l.template_id order by l.created_at desc))[1],
         max(l.reminders_sent) as stage
  from public.leads l
  group by l.email
  having not exists (
           select 1 from public.weddings w join auth.users u on u.id = w.owner_id
           where lower(u.email) = lower(l.email) and w.status = 'published')
     and (
       (max(l.reminders_sent) = 0 and max(l.created_at) < now() - interval '24 hours')
       or (max(l.reminders_sent) = 1 and max(l.last_reminded_at) < now() - interval '4 days'))
$$;

create or replace function public.mark_lead_reminded(addresses text[])
returns void
language sql security definer set search_path = public as $$
  update public.leads
     set reminders_sent = reminders_sent + 1, last_reminded_at = now()
   where lower(email) = any (select lower(a) from unnest(addresses) a)
$$;

-- 4. Guests due a reminder: said yes, left an email, the invitation is published.
--    "week" = 2 to 7 days before; "day" = the day before or the day itself.
create or replace function public.guest_reminders_due()
returns table (guest_id uuid, email text, guest_name text, stage text, brides text, grooms text, event_type text,
               event_date text, event_time text, venue_name text, venue_address text, city text, slug text)
language sql security definer set search_path = public as $$
  with d as (
    select g.id as gid, g.email as gemail, g.full_name, g.reminded_week, g.reminded_day, i.bride_name, i.groom_name, i.event_type as etype,
           i.wedding_date::text as edate, i.wedding_time::text as etime, i.venue_name, i.venue_address, i.city, w.slug as wslug,
           (i.wedding_date::date - (now() at time zone 'Africa/Lagos')::date) as days
    from public.guests g
    join public.invitations i on i.id::text = g.invitation_id::text
    join public.weddings w on w.id::text = i.wedding_id::text
    where g.status = 'confirmed' and g.email is not null and g.email <> '' and w.status = 'published'
  )
  select gid, gemail, full_name, case when days between 0 and 1 then 'day' else 'week' end,
         bride_name, groom_name, etype, edate, etime, venue_name, venue_address, city, wslug::text
  from d
  where (days between 0 and 1 and not reminded_day)
     or (days between 2 and 7 and not reminded_week)
$$;

create or replace function public.mark_guest_reminded(ids uuid[], which text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if which = 'day' then
    update public.guests set reminded_day = true, reminded_week = true where id = any (ids);
  else
    update public.guests set reminded_week = true where id = any (ids);
  end if;
end $$;

-- These four are for the server only (the reminder job), never for visitors or signed-in users.
revoke all on function public.leads_due_for_reminder() from public, anon, authenticated;
revoke all on function public.mark_lead_reminded(text[]) from public, anon, authenticated;
revoke all on function public.guest_reminders_due() from public, anon, authenticated;
revoke all on function public.mark_guest_reminded(uuid[], text) from public, anon, authenticated;
grant execute on function public.leads_due_for_reminder() to service_role;
grant execute on function public.mark_lead_reminded(text[]) to service_role;
grant execute on function public.guest_reminders_due() to service_role;
grant execute on function public.mark_guest_reminded(uuid[], text) to service_role;
