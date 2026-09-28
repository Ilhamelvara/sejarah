-- ============================================================
-- SEJARAH.ID — Supabase Database Schema & Realtime Setup
-- Jalankan (Run) seluruh isi file ini di Supabase SQL Editor
-- ============================================================

-- 1. Buat Tabel Profil Pengguna (Tersinkronisasi dengan auth.users)
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  dark_mode boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Buat Tabel Bookmarks
create table if not exists public.user_bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  materi_id integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, materi_id)
);

-- 3. Buat Tabel Progress Membaca Materi
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  materi_id integer not null,
  read_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, materi_id)
);

-- 4. Buat Tabel Skor Kuis
create table if not exists public.user_quiz_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  quiz_id text not null,
  score integer not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, quiz_id)
);

-- 5. Aktifkan Row Level Security (RLS) pada semua tabel
alter table public.user_profiles enable row level security;
alter table public.user_bookmarks enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_quiz_scores enable row level security;

-- Kebijakan (Policies) untuk user_profiles
drop policy if exists "Anyone can view public profiles for leaderboard" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;

create policy "Anyone can view public profiles for leaderboard" on public.user_profiles for select using (true);
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id);

-- Kebijakan (Policies) untuk user_bookmarks
drop policy if exists "Users can view own bookmarks" on public.user_bookmarks;
drop policy if exists "Users can insert own bookmarks" on public.user_bookmarks;
drop policy if exists "Users can delete own bookmarks" on public.user_bookmarks;

create policy "Users can view own bookmarks" on public.user_bookmarks for select using (auth.uid() = user_id);
create policy "Users can insert own bookmarks" on public.user_bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks" on public.user_bookmarks for delete using (auth.uid() = user_id);

-- Kebijakan (Policies) untuk user_progress
drop policy if exists "Anyone can view reading progress for leaderboard" on public.user_progress;
drop policy if exists "Users can view own progress" on public.user_progress;
drop policy if exists "Users can insert own progress" on public.user_progress;
drop policy if exists "Users can update own progress" on public.user_progress;

create policy "Anyone can view reading progress for leaderboard" on public.user_progress for select using (true);
create policy "Users can insert own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for update using (auth.uid() = user_id);

-- Kebijakan (Policies) untuk user_quiz_scores
drop policy if exists "Anyone can view leaderboard quiz scores" on public.user_quiz_scores;
drop policy if exists "Users can view own quiz scores" on public.user_quiz_scores;
drop policy if exists "Users can insert/update own quiz scores" on public.user_quiz_scores;
drop policy if exists "Users can update own quiz scores" on public.user_quiz_scores;

create policy "Anyone can view leaderboard quiz scores" on public.user_quiz_scores for select using (true);
create policy "Users can insert/update own quiz scores" on public.user_quiz_scores for insert with check (auth.uid() = user_id);
create policy "Users can update own quiz scores" on public.user_quiz_scores for update using (auth.uid() = user_id);

-- 6. Trigger Otomatis: Buat Profil User saat Pendaftar Baru Masuk ke auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now(),
    now()
  )
  on conflict (id) do update set 
    full_name = excluded.full_name,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. SINKRONISASI USER YANG SUDAH TERDAFTAR SEBELUMNYA (Backfill pendaftar yang sudah ada)
insert into public.user_profiles (id, full_name, created_at, updated_at)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  created_at,
  now()
from auth.users
on conflict (id) do update set 
  full_name = excluded.full_name,
  updated_at = now();

-- 8. Aktifkan Supabase Realtime pada Tabel-Tabel Leaderboard
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_profiles'
  ) then
    alter publication supabase_realtime add table public.user_profiles;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_quiz_scores'
  ) then
    alter publication supabase_realtime add table public.user_quiz_scores;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_progress'
  ) then
    alter publication supabase_realtime add table public.user_progress;
  end if;
end $$;
