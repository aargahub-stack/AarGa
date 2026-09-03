-- =============================================================================
-- flowcharts — stores saved flowchart canvases for the Workspace Flowchart Maker
-- Depends on: public.team_members (existing workspace auth table)
-- Safe to re-run.
-- =============================================================================

create extension if not exists pgcrypto;

drop table if exists public.flowcharts cascade;

create table public.flowcharts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null default 'Untitled Flowchart',
  nodes        jsonb not null default '[]'::jsonb,
  edges        jsonb not null default '[]'::jsonb,
  created_by   uuid not null references public.team_members(id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.flowcharts is
  'Saved flowchart canvases from the Workspace Flowchart Maker (nodes/edges are React Flow JSON state).';

create index flowcharts_created_by_idx on public.flowcharts (created_by);

-- Auto-update updated_at on every row change
create or replace function public.set_flowchart_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists flowcharts_set_updated_at on public.flowcharts;
create trigger flowcharts_set_updated_at
  before update on public.flowcharts
  for each row execute function public.set_flowchart_updated_at();

-- -----------------------------------------------------------------------------
-- RLS — a team member can only read/write their OWN flowcharts.
-- Admins (admin_users) can read all, for oversight/support purposes.
-- -----------------------------------------------------------------------------
alter table public.flowcharts enable row level security;

drop policy if exists "Owners can read their flowcharts" on public.flowcharts;
create policy "Owners can read their flowcharts"
  on public.flowcharts
  for select
  using (
    created_by in (select id from public.team_members where user_id = auth.uid())
    or exists (select 1 from public.admin_users where user_id = auth.uid())
  );

drop policy if exists "Owners can write their flowcharts" on public.flowcharts;
create policy "Owners can write their flowcharts"
  on public.flowcharts
  for all
  using (created_by in (select id from public.team_members where user_id = auth.uid()))
  with check (created_by in (select id from public.team_members where user_id = auth.uid()));

-- =============================================================================
-- Verify
-- =============================================================================
select column_name, data_type from information_schema.columns
  where table_name = 'flowcharts' order by ordinal_position;
