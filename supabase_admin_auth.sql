-- =============================================================================
-- AarGa — Supabase Admin Auth & Security Layer Schema
-- Run this script in the Supabase SQL Editor to establish true database-level
-- RBAC security and create the admin_users and admin_tasks tables.
-- =============================================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. admin_users Table (Role-Based Access Control Source of Truth)
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'admin' check (role in ('admin', 'founder')),
  created_at   timestamptz not null default now()
);

comment on table public.admin_users is
  'Maps authenticated Supabase users (auth.users) to administrative roles (admin/founder).';

-- Enable Row Level Security
alter table public.admin_users enable row level security;

-- Policy: Admin users can only read their OWN row (prevents admin enumeration)
drop policy if exists "Users can read own admin record" on public.admin_users;
create policy "Users can read own admin record"
  on public.admin_users
  for select
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. admin_tasks Table (Pending Tasks Queue for Admin Dashboard)
-- -----------------------------------------------------------------------------
create table if not exists public.admin_tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  status       text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  created_at   timestamptz not null default now()
);

comment on table public.admin_tasks is
  'Administrative queue for system tasks, moderation, and infrastructure checks.';

alter table public.admin_tasks enable row level security;

-- Admin-only policies for admin_tasks
drop policy if exists "Admins can select admin_tasks" on public.admin_tasks;
create policy "Admins can select admin_tasks"
  on public.admin_tasks for select
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can insert admin_tasks" on public.admin_tasks;
create policy "Admins can insert admin_tasks"
  on public.admin_tasks for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update admin_tasks" on public.admin_tasks;
create policy "Admins can update admin_tasks"
  on public.admin_tasks for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete admin_tasks" on public.admin_tasks;
create policy "Admins can delete admin_tasks"
  on public.admin_tasks for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 3. Database Write Security: Admin-Only WRITE Policies on Core Tables
--    (Public SELECT access is preserved untouched)
-- -----------------------------------------------------------------------------

-- A. projects table write policies
drop policy if exists "Admins can insert projects" on public.projects;
create policy "Admins can insert projects"
  on public.projects for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
  on public.projects for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects"
  on public.projects for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- B. interns table write policies
drop policy if exists "Admins can insert interns" on public.interns;
create policy "Admins can insert interns"
  on public.interns for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update interns" on public.interns;
create policy "Admins can update interns"
  on public.interns for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete interns" on public.interns;
create policy "Admins can delete interns"
  on public.interns for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- C. ecosystem_metrics table write policies
drop policy if exists "Admins can insert ecosystem_metrics" on public.ecosystem_metrics;
create policy "Admins can insert ecosystem_metrics"
  on public.ecosystem_metrics for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update ecosystem_metrics" on public.ecosystem_metrics;
create policy "Admins can update ecosystem_metrics"
  on public.ecosystem_metrics for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete ecosystem_metrics" on public.ecosystem_metrics;
create policy "Admins can delete ecosystem_metrics"
  on public.ecosystem_metrics for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- Seed Initial Task Data
-- -----------------------------------------------------------------------------
insert into public.admin_tasks (title, status)
values
  ('Verify telemetry stream connection for NexFix edge nodes', 'pending'),
  ('Audit quarterly intern VeriSkill credentials', 'in_progress');

-- -----------------------------------------------------------------------------
-- MANUAL SETUP STEP FOR FOUNDER / ADMIN SETUP:
-- 1. Create a user via Supabase Dashboard -> Authentication -> Users -> Add User.
-- 2. Copy the generated User UID (e.g. 'a1b2c3d4-e5f6-7890-abcd-ef1234567890').
-- 3. Run the statement below in SQL Editor with your actual User UID:
--
-- insert into public.admin_users (user_id, role)
-- values ('PASTE-YOUR-SUPABASE-AUTH-USER-ID-HERE', 'founder');
-- -----------------------------------------------------------------------------
