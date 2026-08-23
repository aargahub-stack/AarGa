-- =============================================================================
-- AarGa OS — Consolidated RLS Fix for all 13 SOP Engine Tables + admin_users
-- Single source of truth for Row Level Security policies across the SOP Engine.
-- =============================================================================

-- Ensure admin_users policy allows authenticated users to check admin membership without RLS recursion
alter table public.admin_users enable row level security;
drop policy if exists "Users can read own admin record" on public.admin_users;
drop policy if exists "Authenticated users can read admin_users" on public.admin_users;
create policy "Authenticated users can read admin_users"
  on public.admin_users for select
  using (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 1. TEMPLATE TABLES (sop_templates, sop_template_phases, sop_template_tasks)
-- -----------------------------------------------------------------------------
alter table public.sop_templates enable row level security;

drop policy if exists "Templates SELECT policy" on public.sop_templates;
drop policy if exists "Templates INSERT policy" on public.sop_templates;
drop policy if exists "Templates UPDATE policy" on public.sop_templates;
drop policy if exists "Templates DELETE policy" on public.sop_templates;
drop policy if exists "Templates ALL Admin policy" on public.sop_templates;

create policy "Templates SELECT policy"
  on public.sop_templates for select
  using (auth.role() = 'authenticated');

create policy "Templates ALL Admin policy"
  on public.sop_templates for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

alter table public.sop_template_phases enable row level security;

drop policy if exists "Template Phases SELECT policy" on public.sop_template_phases;
drop policy if exists "Template Phases WRITE policy" on public.sop_template_phases;
drop policy if exists "Template Phases ALL Admin policy" on public.sop_template_phases;

create policy "Template Phases SELECT policy"
  on public.sop_template_phases for select
  using (auth.role() = 'authenticated');

create policy "Template Phases ALL Admin policy"
  on public.sop_template_phases for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

alter table public.sop_template_tasks enable row level security;

drop policy if exists "Template Tasks SELECT policy" on public.sop_template_tasks;
drop policy if exists "Template Tasks WRITE policy" on public.sop_template_tasks;
drop policy if exists "Template Tasks ALL Admin policy" on public.sop_template_tasks;

create policy "Template Tasks SELECT policy"
  on public.sop_template_tasks for select
  using (auth.role() = 'authenticated');

create policy "Template Tasks ALL Admin policy"
  on public.sop_template_tasks for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 2. CLIENT & PROJECT INSTANCE TABLES (clients, client_projects, project_phases)
-- -----------------------------------------------------------------------------
alter table public.clients enable row level security;

drop policy if exists "Clients SELECT policy" on public.clients;
drop policy if exists "Clients WRITE policy" on public.clients;
drop policy if exists "Clients ALL Admin policy" on public.clients;

create policy "Clients SELECT policy"
  on public.clients for select
  using (auth.role() = 'authenticated');

create policy "Clients ALL Admin policy"
  on public.clients for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

alter table public.client_projects enable row level security;

drop policy if exists "Client Projects SELECT policy" on public.client_projects;
drop policy if exists "Client Projects WRITE policy" on public.client_projects;
drop policy if exists "Client Projects ALL Admin policy" on public.client_projects;

create policy "Client Projects SELECT policy"
  on public.client_projects for select
  using (auth.role() = 'authenticated');

create policy "Client Projects ALL Admin policy"
  on public.client_projects for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

alter table public.project_phases enable row level security;

drop policy if exists "Project Phases SELECT policy" on public.project_phases;
drop policy if exists "Project Phases WRITE policy" on public.project_phases;
drop policy if exists "Project Phases ALL Admin policy" on public.project_phases;

create policy "Project Phases SELECT policy"
  on public.project_phases for select
  using (auth.role() = 'authenticated');

create policy "Project Phases ALL Admin policy"
  on public.project_phases for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 3. TASKS & DEPENDENCIES (sop_tasks, sop_task_dependencies)
-- -----------------------------------------------------------------------------
alter table public.sop_tasks enable row level security;

drop policy if exists "SOP Tasks SELECT policy" on public.sop_tasks;
drop policy if exists "SOP Tasks ADMIN ALL policy" on public.sop_tasks;
drop policy if exists "SOP Tasks Assigned UPDATE policy" on public.sop_tasks;

create policy "SOP Tasks SELECT policy"
  on public.sop_tasks for select
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
    or
    exists (select 1 from public.team_members tm where tm.id = sop_tasks.assigned_to and tm.user_id = auth.uid())
  );

create policy "SOP Tasks ADMIN ALL policy"
  on public.sop_tasks for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "SOP Tasks Assigned UPDATE policy"
  on public.sop_tasks for update
  using (
    exists (select 1 from public.team_members tm where tm.id = sop_tasks.assigned_to and tm.user_id = auth.uid())
  );

alter table public.sop_task_dependencies enable row level security;

drop policy if exists "Task Dependencies SELECT policy" on public.sop_task_dependencies;
drop policy if exists "Task Dependencies ALL Admin policy" on public.sop_task_dependencies;

create policy "Task Dependencies SELECT policy"
  on public.sop_task_dependencies for select
  using (auth.role() = 'authenticated');

create policy "Task Dependencies ALL Admin policy"
  on public.sop_task_dependencies for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 4. PEOPLE & SKILLS (team_members, skills, team_member_skills)
-- -----------------------------------------------------------------------------
alter table public.team_members enable row level security;

drop policy if exists "Team Members SELECT policy" on public.team_members;
drop policy if exists "Team Members ADMIN ALL policy" on public.team_members;
drop policy if exists "Team Members SELF UPDATE policy" on public.team_members;

create policy "Team Members SELECT policy"
  on public.team_members for select
  using (auth.role() = 'authenticated');

create policy "Team Members ADMIN ALL policy"
  on public.team_members for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Team Members SELF UPDATE policy"
  on public.team_members for update
  using (user_id = auth.uid());

alter table public.skills enable row level security;

drop policy if exists "Skills SELECT policy" on public.skills;
drop policy if exists "Skills WRITE policy" on public.skills;

create policy "Skills SELECT policy"
  on public.skills for select
  using (auth.role() = 'authenticated');

create policy "Skills WRITE policy"
  on public.skills for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

alter table public.team_member_skills enable row level security;

drop policy if exists "Team Member Skills SELECT policy" on public.team_member_skills;
drop policy if exists "Team Member Skills WRITE policy" on public.team_member_skills;

create policy "Team Member Skills SELECT policy"
  on public.team_member_skills for select
  using (auth.role() = 'authenticated');

create policy "Team Member Skills WRITE policy"
  on public.team_member_skills for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 5. LOGS & NOTIFICATIONS (sop_activity_logs, sop_notifications)
-- -----------------------------------------------------------------------------
alter table public.sop_activity_logs enable row level security;

drop policy if exists "Activity Logs INSERT policy" on public.sop_activity_logs;
drop policy if exists "Activity Logs SELECT policy" on public.sop_activity_logs;

create policy "Activity Logs INSERT policy"
  on public.sop_activity_logs for insert
  with check (auth.role() = 'authenticated');

create policy "Activity Logs SELECT policy"
  on public.sop_activity_logs for select
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

alter table public.sop_notifications enable row level security;

drop policy if exists "Notifications SELECT policy" on public.sop_notifications;
drop policy if exists "Notifications UPDATE policy" on public.sop_notifications;
drop policy if exists "Notifications ADMIN ALL policy" on public.sop_notifications;

create policy "Notifications SELECT policy"
  on public.sop_notifications for select
  using (
    exists (select 1 from public.team_members tm where tm.id = sop_notifications.team_member_id and tm.user_id = auth.uid())
    or
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

create policy "Notifications UPDATE policy"
  on public.sop_notifications for update
  using (
    exists (select 1 from public.team_members tm where tm.id = sop_notifications.team_member_id and tm.user_id = auth.uid())
  );

create policy "Notifications ADMIN ALL policy"
  on public.sop_notifications for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- Verification Audit Query
-- -----------------------------------------------------------------------------
select tablename, policyname, cmd
from pg_policies
where tablename in (
  'sop_templates', 'sop_template_phases', 'sop_template_tasks',
  'clients', 'client_projects', 'project_phases', 'sop_tasks',
  'sop_task_dependencies', 'team_members', 'skills', 'team_member_skills',
  'sop_activity_logs', 'sop_notifications', 'admin_users'
)
order by tablename, policyname;
