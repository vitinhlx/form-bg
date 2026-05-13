# Supabase Setup Guide

Before running the quotation app with cloud saving, you need to set up the database table in Supabase.

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

## Step 2: Copy and Run the Migration SQL

Copy the SQL code below and paste it into the SQL editor, then click "Run":

```sql
-- Create quotations table
create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on user_id for faster queries
create index if not exists quotations_user_id_idx on public.quotations(user_id);

-- Enable row level security
alter table public.quotations enable row level security;

-- Create RLS policies
drop policy if exists "quotations_select_own" on public.quotations;
create policy "quotations_select_own" on public.quotations for select using (auth.uid() = user_id);

drop policy if exists "quotations_insert_own" on public.quotations;
create policy "quotations_insert_own" on public.quotations for insert with check (auth.uid() = user_id);

drop policy if exists "quotations_update_own" on public.quotations;
create policy "quotations_update_own" on public.quotations for update using (auth.uid() = user_id);

drop policy if exists "quotations_delete_own" on public.quotations;
create policy "quotations_delete_own" on public.quotations for delete using (auth.uid() = user_id);
```

## Step 3: Enable Google OAuth

1. Go to "Authentication" in the left sidebar
2. Click on "Providers"
3. Find "Google" and enable it
4. Enter your Google OAuth credentials (if you don't have them, follow the prompts)

## Step 4: Done!

You're all set. The quotation app is now ready to use with cloud saving and Google authentication.
