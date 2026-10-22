-- Invytory: payments table (STEP 1 of the secure-payment setup). Safe to run any time, more than once.
-- It records every Paystack reference that has been used, so one payment can only ever
-- activate one invitation. Nobody can read or write it from the website; only the
-- activate-payment function (which uses the service key) can.
create table if not exists public.payments (
  reference text primary key,
  wedding_id uuid not null,
  user_id uuid not null,
  plan text not null,
  amount_kobo bigint not null,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;
-- No policies on purpose.

-- Admins may look at payments from the SQL editor or the admin tools.
drop policy if exists "Admins read payments" on public.payments;
create policy "Admins read payments"
  on public.payments for select to authenticated
  using (public.is_platform_admin());
