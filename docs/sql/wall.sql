-- The couple's wall: messages guests choose to leave in public when they RSVP.
-- Run this once in the Supabase SQL Editor. It is safe to run again.
--
-- Who can do what:
--   * Anyone who opens a published invitation can READ its wall messages.
--   * Anyone can ADD a message to a published invitation (1 to 500 characters).
--   * Only the invitation's owner can DELETE messages (from the Guests page of the dashboard).

create table if not exists public.wall_messages (
  id uuid primary key default gen_random_uuid(),
  invitation_id text not null,
  guest_name text not null check (char_length(guest_name) between 1 and 80),
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists wall_messages_invitation_idx
  on public.wall_messages (invitation_id, created_at desc);

alter table public.wall_messages enable row level security;

drop policy if exists "Anyone can read wall messages" on public.wall_messages;
create policy "Anyone can read wall messages"
  on public.wall_messages for select
  using (
    exists (
      select 1 from public.invitations i
      where i.id::text = wall_messages.invitation_id and i.status = 'published'
    )
  );

drop policy if exists "Anyone can add a wall message" on public.wall_messages;
create policy "Anyone can add a wall message"
  on public.wall_messages for insert
  with check (
    exists (
      select 1 from public.invitations i
      where i.id::text = wall_messages.invitation_id and i.status = 'published'
    )
  );

drop policy if exists "Owners can delete wall messages" on public.wall_messages;
create policy "Owners can delete wall messages"
  on public.wall_messages for delete
  using (
    exists (
      select 1 from public.invitations i
      where i.id::text = wall_messages.invitation_id and i.owner_id = auth.uid()
    )
  );

grant select, insert on public.wall_messages to anon, authenticated;
grant delete on public.wall_messages to authenticated;
