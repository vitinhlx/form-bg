-- Create quotations table for storing user quotations
create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null default '[]',
  factory_name text default 'XƯỞNG SX - NỘI THẤT - THÂN THIỆN',
  factory_address text default 'Địa chỉ: Khu B4, Phường Đông Xuyên',
  factory_hotline text default 'Hotline: 0918306813 - 0988288701',
  factory_email text default 'Email: vitinhlx@gmail.com',
  page_title text default 'BÁO GIÁ THI CÔNG NỘI THẤT',
  notes jsonb not null default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.quotations enable row level security;

-- Create policies for quotations table
-- Users can only view their own quotations
create policy "Users can view their own quotations" on public.quotations for select using (auth.uid() = user_id);

-- Users can insert their own quotations
create policy "Users can insert their own quotations" on public.quotations for insert with check (auth.uid() = user_id);

-- Users can update their own quotations
create policy "Users can update their own quotations" on public.quotations for update using (auth.uid() = user_id);

-- Users can delete their own quotations
create policy "Users can delete their own quotations" on public.quotations for delete using (auth.uid() = user_id);
