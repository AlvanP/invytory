-- Invytory: plan prices the admin can change. Safe to run more than once.
-- Everyone may read the prices (the website shows them). Only platform admins may change them.
create table if not exists public.plans (
  id text primary key check (id in ('silver', 'gold')),
  price_naira integer not null check (price_naira >= 0 and price_naira <= 10000000),
  updated_at timestamptz not null default now()
);

insert into public.plans (id, price_naira) values ('silver', 25000), ('gold', 45000)
  on conflict (id) do nothing;

alter table public.plans enable row level security;

drop policy if exists "Anyone reads plans" on public.plans;
create policy "Anyone reads plans" on public.plans for select to anon, authenticated using (true);

drop policy if exists "Admins change plans" on public.plans;
create policy "Admins change plans" on public.plans for update to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Make apgonlyn@gmail.com a platform admin (they must have signed in to Invytory once).
insert into public.platform_admins (user_id)
  select id from auth.users where lower(email) = 'apgonlyn@gmail.com'
  on conflict do nothing;
