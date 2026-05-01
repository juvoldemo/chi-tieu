-- Allow custom member names configured from the app menu.
-- Run this in Supabase SQL Editor if your existing database still only accepts
-- the original "Chồng" / "Vợ" values.

alter table public.transactions
drop constraint if exists transactions_member_name_check;
