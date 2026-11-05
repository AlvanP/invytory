-- Invytory: messages from the Contact us page are saved here, so none can be lost.
-- Paste this whole file into Supabase > SQL Editor > New query, then Run. Safe to run twice.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 5 and 120),
  topic text check (topic is null or char_length(topic) <= 60),
  message text not null check (char_length(message) between 5 and 4000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can send a message" on public.contact_messages;
create policy "Anyone can send a message"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Admins read messages" on public.contact_messages;
create policy "Admins read messages"
  on public.contact_messages for select
  using (public.is_platform_admin());

drop policy if exists "Admins update messages" on public.contact_messages;
create policy "Admins update messages"
  on public.contact_messages for update
  using (public.is_platform_admin());

drop policy if exists "Admins delete messages" on public.contact_messages;
create policy "Admins delete messages"
  on public.contact_messages for delete
  using (public.is_platform_admin());

grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
