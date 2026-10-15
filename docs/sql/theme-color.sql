-- Colour of the day: one optional colour per ceremony (#RRGGBB).
-- Run this once in the Supabase SQL Editor. It is safe to run again.
alter table public.invitations
  add column if not exists theme_color text;