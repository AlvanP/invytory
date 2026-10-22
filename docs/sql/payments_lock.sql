-- Invytory: lock the payment fields (STEP 3, the LAST step of the secure-payment setup).
-- Run this ONLY after the new website code is live and the activate-payment function works.
-- After it, a signed-in person can no longer mark an invitation as paid or published from
-- the browser, whatever they try. Only the activate-payment function and platform admins can.
-- Safe to run more than once.

create or replace function public.protect_wedding_payment_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.is_platform_admin() then
    if tg_op = 'INSERT' then
      new.status := 'draft';
      new.payment_reference := null;
    else
      new.status := old.status;
      new.plan := old.plan;
      new.max_guests := old.max_guests;
      new.expires_at := old.expires_at;
      new.payment_reference := old.payment_reference;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_wedding_payment_fields on public.weddings;
create trigger protect_wedding_payment_fields
  before insert or update on public.weddings
  for each row execute function public.protect_wedding_payment_fields();

create or replace function public.protect_invitation_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.is_platform_admin() then
    if tg_op = 'INSERT' then
      if new.wedding_id is null
         or not exists (select 1 from public.weddings w where w.id = new.wedding_id and w.status = 'published') then
        new.status := 'draft';
      end if;
    else
      new.status := old.status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_invitation_status on public.invitations;
create trigger protect_invitation_status
  before insert or update on public.invitations
  for each row execute function public.protect_invitation_status();
