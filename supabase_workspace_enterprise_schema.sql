-- =============================================================================
-- Enterprise Workspace Portal Migration
-- Adds Attendance tracking and Compensation metrics for Employees & Interns.
-- Safe to re-run.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. workspace_attendance — Clock In / Clock Out & Active Hours Tracker
-- -----------------------------------------------------------------------------
drop table if exists public.workspace_attendance cascade;

create table public.workspace_attendance (
  id              uuid primary key default gen_random_uuid(),
  team_member_id  uuid not null references public.team_members(id) on delete cascade,
  clock_in        timestamptz not null default now(),
  clock_out       timestamptz,
  total_minutes   numeric(10,2) default 0,
  status          text not null default 'active' check (status in ('active', 'completed')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.workspace_attendance is
  'Daily attendance and active working hour logs for workspace team members.';

create index workspace_attendance_team_member_idx on public.workspace_attendance (team_member_id);
create index workspace_attendance_status_idx on public.workspace_attendance (status);

-- -----------------------------------------------------------------------------
-- 2. team_compensation — Transparent Salary / Stipend View
-- -----------------------------------------------------------------------------
drop table if exists public.team_compensation cascade;

create table public.team_compensation (
  id                uuid primary key default gen_random_uuid(),
  team_member_id    uuid not null unique references public.team_members(id) on delete cascade,
  role_type         text not null default 'Employee' check (role_type in ('Employee', 'Intern')),
  base_amount       numeric(12,2) not null default 0,
  currency          text not null default 'INR',
  payout_cycle      text not null default 'Monthly',
  next_payout_date  date,
  payout_status     text not null default 'Active' check (payout_status in ('Active', 'Processing', 'On Hold')),
  bank_name         text,
  account_last4     text,
  upi_id            text,
  updated_at        timestamptz not null default now()
);

comment on table public.team_compensation is
  'Compensation structures, payout dates, and disbursement details for team members.';

-- -----------------------------------------------------------------------------
-- RLS Policies
-- -----------------------------------------------------------------------------
alter table public.workspace_attendance enable row level security;
alter table public.team_compensation enable row level security;

-- Attendance Policies
drop policy if exists "Users can read their attendance" on public.workspace_attendance;
create policy "Users can read their attendance"
  on public.workspace_attendance for select
  using (
    team_member_id in (select id from public.team_members where user_id = auth.uid())
    or exists (select 1 from public.admin_users where user_id = auth.uid())
  );

drop policy if exists "Users can insert their attendance" on public.workspace_attendance;
create policy "Users can insert their attendance"
  on public.workspace_attendance for insert
  with check (
    team_member_id in (select id from public.team_members where user_id = auth.uid())
  );

drop policy if exists "Users can update their attendance" on public.workspace_attendance;
create policy "Users can update their attendance"
  on public.workspace_attendance for update
  using (
    team_member_id in (select id from public.team_members where user_id = auth.uid())
  )
  with check (
    team_member_id in (select id from public.team_members where user_id = auth.uid())
  );

-- Compensation Policies
drop policy if exists "Users can read their compensation" on public.team_compensation;
create policy "Users can read their compensation"
  on public.team_compensation for select
  using (
    team_member_id in (select id from public.team_members where user_id = auth.uid())
    or exists (select 1 from public.admin_users where user_id = auth.uid())
  );

-- =============================================================================
-- Verification
-- =============================================================================
select table_name from information_schema.tables 
  where table_schema = 'public' and table_name in ('workspace_attendance', 'team_compensation');
