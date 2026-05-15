-- ═══════════════════════════════════════════════════
-- STEP 1: Create the admin user (run once in Supabase)
-- Go to: Authentication > Users > Add User
-- Enter your email and password there.
-- OR run this (replace values):
--
-- insert into auth.users (email, encrypted_password, email_confirmed_at, role)
-- values ('admin@crystalblinds.com', crypt('YourPassword123', gen_salt('bf')), now(), 'authenticated');
--
-- ═══════════════════════════════════════════════════
-- STEP 2: Create the appointments table
-- ═══════════════════════════════════════════════════


create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_name text not null,
  client_phone text not null,
  client_address text not null default '',
  appointment_type text not null check (appointment_type in ('inspection', 'installation')),
  appointment_date date not null,
  appointment_time time not null,
  curtain_type text,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- Enable Row Level Security
alter table public.appointments enable row level security;

-- Policy: allow full access (admin only — secure with auth later)
create policy "allow_all" on public.appointments
  for all using (true) with check (true);
