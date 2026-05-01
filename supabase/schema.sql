-- Be Bong - Supabase schema
-- Personal open-app mode: no login screen required.
-- Run this file in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  role text not null default 'member',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'CircleEllipsis',
  color text not null default '#005BAA',
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  balance numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount >= 0),
  category_id uuid references public.categories(id) on delete set null,
  wallet_id uuid references public.wallets(id) on delete set null,
  member_name text not null,
  note text,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category_id uuid not null references public.categories(id) on delete cascade,
  month text not null check (month ~ '^[0-9]{4}-[0-9]{2}$'),
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (category_id, month)
);

-- If you already ran the previous login-based schema, make user_id optional.
alter table public.categories alter column user_id drop not null;
alter table public.wallets alter column user_id drop not null;
alter table public.transactions alter column user_id drop not null;
alter table public.budgets alter column user_id drop not null;

create index if not exists categories_user_id_idx on public.categories(user_id);
create index if not exists wallets_user_id_idx on public.wallets(user_id);
create index if not exists transactions_user_date_idx on public.transactions(user_id, transaction_date desc);
create index if not exists transactions_category_idx on public.transactions(category_id);
create index if not exists budgets_user_month_idx on public.budgets(user_id, month);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "categories_all_own" on public.categories;
drop policy if exists "wallets_all_own" on public.wallets;
drop policy if exists "transactions_all_own" on public.transactions;
drop policy if exists "budgets_all_own" on public.budgets;

drop policy if exists "profiles_personal_open_access" on public.profiles;
drop policy if exists "categories_personal_open_access" on public.categories;
drop policy if exists "wallets_personal_open_access" on public.wallets;
drop policy if exists "transactions_personal_open_access" on public.transactions;
drop policy if exists "budgets_personal_open_access" on public.budgets;

create policy "profiles_personal_open_access"
on public.profiles for all
to anon, authenticated
using (true)
with check (true);

create policy "categories_personal_open_access"
on public.categories for all
to anon, authenticated
using (true)
with check (true);

create policy "wallets_personal_open_access"
on public.wallets for all
to anon, authenticated
using (true)
with check (true);

create policy "transactions_personal_open_access"
on public.transactions for all
to anon, authenticated
using (true)
with check (true);

create policy "budgets_personal_open_access"
on public.budgets for all
to anon, authenticated
using (true)
with check (true);
