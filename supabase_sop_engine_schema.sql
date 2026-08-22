-- =============================================================================
-- AarGa OS — SOP-Driven Phase Execution Engine & Employee Workspace Schema
-- Fully idempotent migration script for Supabase / Postgres.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. TEMPLATE LAYER
-- -----------------------------------------------------------------------------

create table if not exists public.sop_templates (
  id             uuid primary key default gen_random_uuid(),
  project_type   text not null check (project_type in ('web_application', 'mobile_application', 'ai_integration_service', 'custom_solution')),
  name           text not null,
  version        int not null default 1,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

comment on table public.sop_templates is 'Master SOP workflow templates per project type.';
alter table public.sop_templates enable row level security;

create table if not exists public.sop_template_phases (
  id               uuid primary key default gen_random_uuid(),
  sop_template_id  uuid not null references public.sop_templates(id) on delete cascade,
  phase_order      int not null,
  name             text not null,
  description      text,
  exit_criteria    jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now(),
  constraint uq_template_phase_order unique (sop_template_id, phase_order)
);

comment on table public.sop_template_phases is 'Ordered execution phases belonging to an SOP template.';
alter table public.sop_template_phases enable row level security;

create table if not exists public.sop_template_tasks (
  id                    uuid primary key default gen_random_uuid(),
  sop_template_phase_id uuid not null references public.sop_template_phases(id) on delete cascade,
  title                 text not null,
  description           text,
  required_skill_tags   text[] not null default '{}',
  estimated_hours       numeric not null default 4.0,
  task_order            int not null default 1,
  is_optional           boolean not null default false,
  created_at            timestamptz not null default now()
);

comment on table public.sop_template_tasks is 'Standardized task definitions within an SOP template phase.';
alter table public.sop_template_tasks enable row level security;


-- -----------------------------------------------------------------------------
-- 2. PEOPLE & SKILLS LAYER
-- -----------------------------------------------------------------------------

create table if not exists public.team_members (
  id                             uuid primary key default gen_random_uuid(),
  user_id                        uuid references auth.users(id) on delete set null,
  name                           text not null,
  role                           text not null,
  employment_type                text not null check (employment_type in ('full_time', 'intern', 'contractor')),
  linked_intern_id               uuid references public.interns(id) on delete set null,
  current_capacity_hours_per_week numeric not null default 40.0,
  active                         boolean not null default true,
  created_at                     timestamptz not null default now()
);

comment on table public.team_members is 'Internal workspace team members and capacity tracking.';
alter table public.team_members enable row level security;

create table if not exists public.skills (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  category   text,
  created_at timestamptz not null default now()
);

comment on table public.skills is 'Controlled vocabulary lookup table for engineering skills.';
alter table public.skills enable row level security;

create table if not exists public.team_member_skills (
  id                uuid primary key default gen_random_uuid(),
  team_member_id    uuid not null references public.team_members(id) on delete cascade,
  skill_id          uuid not null references public.skills(id) on delete cascade,
  proficiency_level int not null check (proficiency_level between 1 and 5),
  verified          boolean not null default false,
  telemetry_score   numeric,
  created_at        timestamptz not null default now(),
  constraint uq_team_member_skill unique (team_member_id, skill_id)
);

comment on table public.team_members_skills is 'Maps verified skill tags, proficiency, and telemetry to team members.';
alter table public.team_member_skills enable row level security;


-- -----------------------------------------------------------------------------
-- 3. LIVE INSTANCE LAYER
-- -----------------------------------------------------------------------------

create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contact_email text not null,
  org_name      text not null,
  created_at    timestamptz not null default now()
);

comment on table public.clients is 'Client organizations commissioning projects.';
alter table public.clients enable row level security;

create table if not exists public.client_projects (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  project_type    text not null,
  sop_template_id uuid references public.sop_templates(id) on delete set null,
  status          text not null default 'onboarding' check (status in ('onboarding', 'active', 'on_hold', 'completed', 'cancelled')),
  current_phase_id uuid, -- FK added via alter table below to avoid circular dependency
  created_at      timestamptz not null default now()
);

comment on table public.client_projects is 'Live internal client engagements (distinct from public product listings).';
alter table public.client_projects enable row level security;

create table if not exists public.project_phases (
  id                    uuid primary key default gen_random_uuid(),
  client_project_id     uuid not null references public.client_projects(id) on delete cascade,
  sop_template_phase_id uuid references public.sop_template_phases(id) on delete set null,
  phase_order           int not null,
  name                  text not null,
  status                text not null default 'locked' check (status in ('locked', 'active', 'completed')),
  unlocked_at           timestamptz,
  completed_at          timestamptz,
  created_at            timestamptz not null default now(),
  constraint uq_project_phase_order unique (client_project_id, phase_order)
);

comment on table public.project_phases is 'Live instantiated phases for a client project.';
alter table public.project_phases enable row level security;

-- Add deferred circular foreign key constraint for client_projects.current_phase_id
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_client_projects_current_phase'
  ) then
    alter table public.client_projects
      add constraint fk_client_projects_current_phase
      foreign key (current_phase_id) references public.project_phases(id) on delete set null;
  end if;
end $$;

create table if not exists public.sop_tasks (
  id                  uuid primary key default gen_random_uuid(),
  project_phase_id    uuid not null references public.project_phases(id) on delete cascade,
  title               text not null,
  description         text,
  required_skill_tags text[] not null default '{}',
  status              text not null default 'unassigned' check (status in ('unassigned', 'assigned', 'in_progress', 'submitted_for_review', 'completed', 'blocked')),
  assigned_to         uuid references public.team_members(id) on delete set null,
  assignment_method   text check (assignment_method in ('auto_suggested', 'auto_confirmed', 'manual_override')),
  verified_by         uuid references public.team_members(id) on delete set null,
  submission_note     text,
  is_optional         boolean not null default false,
  source              text not null default 'template' check (source in ('template', 'ad_hoc')),
  due_date            date,
  created_at          timestamptz not null default now()
);

comment on table public.sop_tasks is 'Instantiated executable tasks within a live project phase.';
alter table public.sop_tasks enable row level security;

create table if not exists public.sop_task_dependencies (
  id                    uuid primary key default gen_random_uuid(),
  sop_task_id           uuid not null references public.sop_tasks(id) on delete cascade,
  depends_on_sop_task_id uuid not null references public.sop_tasks(id) on delete cascade,
  created_at            timestamptz not null default now(),
  constraint uq_task_dependency unique (sop_task_id, depends_on_sop_task_id)
);

comment on table public.sop_task_dependencies is 'Explicit prerequisite task dependencies.';
alter table public.sop_task_dependencies enable row level security;


-- -----------------------------------------------------------------------------
-- 4. SUPPORTING LAYER
-- -----------------------------------------------------------------------------

create table if not exists public.sop_activity_logs (
  id                uuid primary key default gen_random_uuid(),
  client_project_id uuid references public.client_projects(id) on delete set null,
  sop_task_id       uuid references public.sop_tasks(id) on delete set null,
  actor_user_id     uuid references auth.users(id) on delete set null,
  event_type        text not null,
  event_detail      jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

comment on table public.sop_activity_logs is 'Append-only audit trail for SOP execution events.';
alter table public.sop_activity_logs enable row level security;

create table if not exists public.sop_notifications (
  id             uuid primary key default gen_random_uuid(),
  team_member_id uuid not null references public.team_members(id) on delete cascade,
  message        text not null,
  link_path      text,
  read           boolean not null default false,
  created_at     timestamptz not null default now()
);

comment on table public.sop_notifications is 'Employee and lead notifications for task assignments and unlocks.';
alter table public.sop_notifications enable row level security;


-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Templates (Read: All Authenticated | Write: Admins Only)
drop policy if exists "Templates SELECT policy" on public.sop_templates;
create policy "Templates SELECT policy" on public.sop_templates for select using (auth.role() = 'authenticated');

drop policy if exists "Templates INSERT policy" on public.sop_templates;
create policy "Templates INSERT policy" on public.sop_templates for insert with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Templates UPDATE policy" on public.sop_templates;
create policy "Templates UPDATE policy" on public.sop_templates for update using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Templates DELETE policy" on public.sop_templates;
create policy "Templates DELETE policy" on public.sop_templates for delete using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Template Phases SELECT policy" on public.sop_template_phases;
create policy "Template Phases SELECT policy" on public.sop_template_phases for select using (auth.role() = 'authenticated');

drop policy if exists "Template Phases WRITE policy" on public.sop_template_phases;
create policy "Template Phases WRITE policy" on public.sop_template_phases for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Template Tasks SELECT policy" on public.sop_template_tasks;
create policy "Template Tasks SELECT policy" on public.sop_template_tasks for select using (auth.role() = 'authenticated');

drop policy if exists "Template Tasks WRITE policy" on public.sop_template_tasks;
create policy "Template Tasks WRITE policy" on public.sop_template_tasks for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Clients, Client Projects, Project Phases (Read: Team Members & Admins | Write: Admins Only)
drop policy if exists "Clients SELECT policy" on public.clients;
create policy "Clients SELECT policy" on public.clients for select using (auth.role() = 'authenticated');

drop policy if exists "Clients WRITE policy" on public.clients;
create policy "Clients WRITE policy" on public.clients for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Client Projects SELECT policy" on public.client_projects;
create policy "Client Projects SELECT policy" on public.client_projects for select using (auth.role() = 'authenticated');

drop policy if exists "Client Projects WRITE policy" on public.client_projects;
create policy "Client Projects WRITE policy" on public.client_projects for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Project Phases SELECT policy" on public.project_phases;
create policy "Project Phases SELECT policy" on public.project_phases for select using (auth.role() = 'authenticated');

drop policy if exists "Project Phases WRITE policy" on public.project_phases;
create policy "Project Phases WRITE policy" on public.project_phases for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- SOP Tasks (Read: Admins OR Assigned Team Member | Write: Admins for all, Assigned Team Member for status transition via SECURITY DEFINER or policy)
drop policy if exists "SOP Tasks SELECT policy" on public.sop_tasks;
create policy "SOP Tasks SELECT policy" on public.sop_tasks for select using (
  exists (select 1 from public.admin_users where user_id = auth.uid())
  or
  exists (select 1 from public.team_members tm where tm.id = sop_tasks.assigned_to and tm.user_id = auth.uid())
);

drop policy if exists "SOP Tasks ADMIN ALL policy" on public.sop_tasks;
create policy "SOP Tasks ADMIN ALL policy" on public.sop_tasks for all using (
  exists (select 1 from public.admin_users where user_id = auth.uid())
);

-- Team Members & Skills (Read: Authenticated Users | Write: Admins & Self Update)
drop policy if exists "Team Members SELECT policy" on public.team_members;
create policy "Team Members SELECT policy" on public.team_members for select using (auth.role() = 'authenticated');

drop policy if exists "Team Members ADMIN ALL policy" on public.team_members;
create policy "Team Members ADMIN ALL policy" on public.team_members for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Team Members SELF UPDATE policy" on public.team_members;
create policy "Team Members SELF UPDATE policy" on public.team_members for update using (user_id = auth.uid());

drop policy if exists "Skills SELECT policy" on public.skills;
create policy "Skills SELECT policy" on public.skills for select using (auth.role() = 'authenticated');

drop policy if exists "Skills WRITE policy" on public.skills;
create policy "Skills WRITE policy" on public.skills for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Team Member Skills SELECT policy" on public.team_member_skills;
create policy "Team Member Skills SELECT policy" on public.team_member_skills for select using (auth.role() = 'authenticated');

drop policy if exists "Team Member Skills WRITE policy" on public.team_member_skills;
create policy "Team Member Skills WRITE policy" on public.team_member_skills for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Activity Logs & Notifications
drop policy if exists "Activity Logs INSERT policy" on public.sop_activity_logs;
create policy "Activity Logs INSERT policy" on public.sop_activity_logs for insert with check (auth.role() = 'authenticated');

drop policy if exists "Activity Logs SELECT policy" on public.sop_activity_logs;
create policy "Activity Logs SELECT policy" on public.sop_activity_logs for select using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Notifications SELECT policy" on public.sop_notifications;
create policy "Notifications SELECT policy" on public.sop_notifications for select using (
  exists (select 1 from public.team_members tm where tm.id = sop_notifications.team_member_id and tm.user_id = auth.uid())
);

drop policy if exists "Notifications UPDATE policy" on public.sop_notifications;
create policy "Notifications UPDATE policy" on public.sop_notifications for update using (
  exists (select 1 from public.team_members tm where tm.id = sop_notifications.team_member_id and tm.user_id = auth.uid())
);

drop policy if exists "Notifications ADMIN ALL policy" on public.sop_notifications;
create policy "Notifications ADMIN ALL policy" on public.sop_notifications for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));


-- -----------------------------------------------------------------------------
-- 6. SECURITY DEFINER TASK TRANSITION FUNCTION
-- Performs validated status transitions for assigned team members safely.
-- -----------------------------------------------------------------------------

create or replace function public.transition_sop_task_status(
  p_task_id uuid,
  p_target_status text,
  p_submission_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_member_id uuid;
  v_current_status text;
  v_assigned_to uuid;
begin
  -- Find calling user's team_member_id
  select id into v_member_id from public.team_members where user_id = auth.uid();
  if v_member_id is null then
    return jsonb_build_object('success', false, 'error', 'Caller is not a registered team member.');
  end if;

  -- Find task state
  select status, assigned_to into v_current_status, v_assigned_to
  from public.sop_tasks where id = p_task_id;

  if v_current_status is null then
    return jsonb_build_object('success', false, 'error', 'Task not found.');
  end if;

  if v_assigned_to != v_member_id then
    return jsonb_build_object('success', false, 'error', 'Task is not assigned to you.');
  end if;

  -- Validate permitted status transition
  if v_current_status = 'assigned' and p_target_status = 'in_progress' then
    update public.sop_tasks set status = 'in_progress' where id = p_task_id;
  elsif v_current_status = 'in_progress' and p_target_status = 'submitted_for_review' then
    update public.sop_tasks
    set status = 'submitted_for_review', submission_note = p_submission_note
    where id = p_task_id;
  else
    return jsonb_build_object(
      'success', false,
      'error', format('Invalid transition from %s to %s for assigned team member.', v_current_status, p_target_status)
    );
  end if;

  -- Log event
  insert into public.sop_activity_logs (sop_task_id, actor_user_id, event_type, event_detail)
  values (
    p_task_id,
    auth.uid(),
    'task_status_transition',
    jsonb_build_object('from', v_current_status, 'to', p_target_status, 'note', p_submission_note)
  );

  return jsonb_build_object('success', true);
end;
$$;


-- -----------------------------------------------------------------------------
-- 7. SEED DATA (Web Application Template + 2 Phases + 2 Tasks each + Client + Team)
-- -----------------------------------------------------------------------------

do $$
declare
  v_template_id uuid;
  v_phase1_id uuid;
  v_phase2_id uuid;
  v_client_id uuid;
  v_member1_id uuid;
  v_member2_id uuid;
  v_skill1_id uuid;
  v_skill2_id uuid;
begin
  -- 1. Seed Skills
  insert into public.skills (name, category)
  values ('React / Next.js', 'Frontend'), ('PostgreSQL / Ledger', 'Backend'), ('System Architecture', 'Core')
  on conflict (name) do nothing;

  select id into v_skill1_id from public.skills where name = 'React / Next.js';
  select id into v_skill2_id from public.skills where name = 'PostgreSQL / Ledger';

  -- 2. Seed SOP Template
  insert into public.sop_templates (project_type, name, version, is_active)
  values ('web_application', 'Enterprise Web Application Standard Blueprint', 1, true)
  returning id into v_template_id;

  -- 3. Seed Phases
  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values
    (v_template_id, 1, 'Architecture & Ledger Schema Provisioning', 'Database design, RLS security policies, and initial framework setup.', '["Database schema deployed", "Authentication & RLS policies verified"]'::jsonb)
  returning id into v_phase1_id;

  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values
    (v_template_id, 2, 'Core API & Workflow Development', 'State machine integration, server actions, and frontend workspace layout.', '["All API endpoints operational", "Client sign-off achieved"]'::jsonb)
  returning id into v_phase2_id;

  -- 4. Seed Template Tasks for Phase 1
  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_phase1_id, 'Deploy Database Schema & RLS Policies', 'Provision SQL tables and configure admin/team RLS policies.', array['PostgreSQL / Ledger'], 8.0, 1, false),
    (v_phase1_id, 'Configure Auth Middleware & Session Helpers', 'Setup Next.js middleware protection and auth helper functions.', array['React / Next.js'], 6.0, 2, false);

  -- 5. Seed Template Tasks for Phase 2
  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_phase2_id, 'Build Server Actions & State Machine Engine', 'Implement phase advancement engine and matching algorithm.', array['PostgreSQL / Ledger', 'System Architecture'], 12.0, 1, false),
    (v_phase2_id, 'Construct Employee Workspace Dashboard', 'Build calm daily task queue UI and submission modal.', array['React / Next.js'], 10.0, 2, false);

  -- 6. Seed Client
  insert into public.clients (name, contact_email, org_name)
  values ('Acme Corp Labs', 'engineering@acme.org', 'Acme Corporation')
  returning id into v_client_id;

  -- 7. Seed Team Members
  insert into public.team_members (name, role, employment_type, current_capacity_hours_per_week, active)
  values ('Kiran Kumar', 'Senior Full-Stack Engineer', 'full_time', 40.0, true)
  returning id into v_member1_id;

  insert into public.team_members (name, role, employment_type, current_capacity_hours_per_week, active)
  values ('Devika Nair', 'Backend Ledger Architect', 'full_time', 40.0, true)
  returning id into v_member2_id;

  -- 8. Seed Team Member Skills
  if v_skill1_id is not null then
    insert into public.team_member_skills (team_member_id, skill_id, proficiency_level, verified, telemetry_score)
    values (v_member1_id, v_skill1_id, 5, true, 92.0)
    on conflict (team_member_id, skill_id) do nothing;
  end if;

  if v_skill2_id is not null then
    insert into public.team_member_skills (team_member_id, skill_id, proficiency_level, verified, telemetry_score)
    values (v_member2_id, v_skill2_id, 5, true, 95.0)
    on conflict (team_member_id, skill_id) do nothing;
  end if;

end $$;
