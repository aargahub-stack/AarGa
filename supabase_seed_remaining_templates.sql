-- =============================================================================
-- AarGa OS — SOP Templates Safe Deactivation & Complete 4-Blueprint Seeding
-- Safely deactivates old template versions (preserving foreign key references from
-- existing client_projects) and seeds version 1 active templates for all 4 project types:
--   1. web_application (3 Phases, 3 Tasks each)
--   2. mobile_application (2 Phases, 2 Tasks each)
--   3. ai_integration_service (2 Phases, 2 Tasks each)
--   4. custom_solution (2 Phases, 2 Tasks each)
-- =============================================================================

-- Step 1: Deactivate existing active templates (safe against client_projects FK constraints)
update public.sop_templates
set is_active = false
where project_type in ('web_application', 'mobile_application', 'ai_integration_service', 'custom_solution')
  and is_active = true;

-- Step 2: Add unique constraint on (project_type, version) if missing
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'uq_sop_templates_type_version') then
    alter table public.sop_templates add constraint uq_sop_templates_type_version unique (project_type, version);
  end if;
end $$;

-- Step 3: Seed Blueprint 1 — Web Application (3 Phases, 3 Tasks each)
do $$
declare
  v_tmpl_id uuid;
  v_p1_id uuid;
  v_p2_id uuid;
  v_p3_id uuid;
  v_next_ver int;
begin
  select coalesce(max(version), 0) + 1 into v_next_ver
  from public.sop_templates
  where project_type = 'web_application';

  insert into public.sop_templates (project_type, name, version, is_active)
  values ('web_application', 'Enterprise Web Application Standard Blueprint', v_next_ver, true)
  returning id into v_tmpl_id;

  -- Phase 1
  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values (v_tmpl_id, 1, 'Architecture & Ledger Provisioning', 'Database schema, RLS policies, and core framework configuration.', '["Schema deployed", "RLS verified"]'::jsonb)
  returning id into v_p1_id;

  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_p1_id, 'Provision Postgres Tables & RLS Policies', 'Create database tables and configure security boundary policies.', array['PostgreSQL / Ledger'], 8.0, 1, false),
    (v_p1_id, 'Setup Auth Middleware & Cookie Client', 'Configure Next.js middleware and SSR auth session helpers.', array['React / Next.js'], 6.0, 2, false),
    (v_p1_id, 'Configure Design System & Palette Tokens', 'Implement Tailwind tokens and glassmorphism UI utilities.', array['React / Next.js'], 4.0, 3, false);

  -- Phase 2
  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values (v_tmpl_id, 2, 'Core API & Workflow Development', 'State machine integration, server actions, and workspace layout.', '["API routes active", "UI validated"]'::jsonb)
  returning id into v_p2_id;

  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_p2_id, 'Build Server Actions & State Machine Engine', 'Implement phase advancement state machine and Server Actions.', array['System Architecture'], 12.0, 1, false),
    (v_p2_id, 'Construct Employee Workspace Dashboard', 'Build daily execution task queue UI and submission modals.', array['React / Next.js'], 10.0, 2, false),
    (v_p2_id, 'Implement Smart Assignee Matching Engine', 'Build weighted skill overlap algorithm and notification queue.', array['PostgreSQL / Ledger'], 8.0, 3, false);

  -- Phase 3
  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values (v_tmpl_id, 3, 'Quality Control & Staging Deployment', 'End-to-end verification, security audit, and client sign-off.', '["Staging verified", "Client sign-off achieved"]'::jsonb)
  returning id into v_p3_id;

  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_p3_id, 'Execute Security & RLS Policy Audit', 'Verify database security policies and zero-leak session boundaries.', array['System Architecture'], 6.0, 1, false),
    (v_p3_id, 'Run Production Build Verification', 'Execute npm run build and test route static generation.', array['React / Next.js'], 4.0, 2, false),
    (v_p3_id, 'Client Staging Handover & UAT', 'Demonstrate feature roadmap to client stakeholders for sign-off.', array['System Architecture'], 6.0, 3, false);
end $$;

-- Step 4: Seed Blueprint 2 — Mobile Application (2 Phases, 2 Tasks each)
do $$
declare
  v_tmpl_id uuid;
  v_p1_id uuid;
  v_p2_id uuid;
  v_next_ver int;
begin
  select coalesce(max(version), 0) + 1 into v_next_ver
  from public.sop_templates
  where project_type = 'mobile_application';

  insert into public.sop_templates (project_type, name, version, is_active)
  values ('mobile_application', 'Cross-Platform Mobile App Standard Blueprint', v_next_ver, true)
  returning id into v_tmpl_id;

  -- Phase 1
  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values (v_tmpl_id, 1, 'Mobile Shell & Offline Cache Setup', 'React Native shell and SQLite offline cache integration.', '["Shell compiling", "Cache active"]'::jsonb)
  returning id into v_p1_id;

  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_p1_id, 'Build React Native App Navigation', 'Implement stack navigation and secure storage keys.', array['React / Next.js'], 8.0, 1, false),
    (v_p1_id, 'Configure Offline Sync & Ledger Bridge', 'Setup local SQLite storage and sync queue to Supabase.', array['PostgreSQL / Ledger'], 10.0, 2, false);

  -- Phase 2
  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values (v_tmpl_id, 2, 'Push Notifications & App Store Readiness', 'Push notification transport and production store builds.', '["Push transport verified", "Build signed"]'::jsonb)
  returning id into v_p2_id;

  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_p2_id, 'Integrate Push Notification Tokens', 'Setup Expo/Firebase push notifications for task updates.', array['System Architecture'], 6.0, 1, false),
    (v_p2_id, 'Generate iOS & Android Production Bundle', 'Build signed IPA and APK binaries for app store deployment.', array['System Architecture'], 8.0, 2, false);
end $$;

-- Step 5: Seed Blueprint 3 — AI Integration Service (2 Phases, 2 Tasks each)
do $$
declare
  v_tmpl_id uuid;
  v_p1_id uuid;
  v_p2_id uuid;
  v_next_ver int;
begin
  select coalesce(max(version), 0) + 1 into v_next_ver
  from public.sop_templates
  where project_type = 'ai_integration_service';

  insert into public.sop_templates (project_type, name, version, is_active)
  values ('ai_integration_service', 'AI Engine & Vector RAG Blueprint', v_next_ver, true)
  returning id into v_tmpl_id;

  -- Phase 1
  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values (v_tmpl_id, 1, 'pgvector Indexing & Embedding Pipeline', 'Configure Supabase pgvector and document embedding pipeline.', '["Vector search ready"]'::jsonb)
  returning id into v_p1_id;

  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_p1_id, 'Provision pgvector Extension & Indexes', 'Setup HNSW vector indexes for fast similarity retrieval.', array['PostgreSQL / Ledger'], 8.0, 1, false),
    (v_p1_id, 'Build Document Ingestion Pipeline', 'Chunk files and generate embeddings via OpenAI/Gemini API.', array['System Architecture'], 10.0, 2, false);

  -- Phase 2
  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values (v_tmpl_id, 2, 'Agent Execution & Prompt Governance', 'Build agent loop and prompt safety guardrails.', '["Agent loop passing"]'::jsonb)
  returning id into v_p2_id;

  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_p2_id, 'Implement Autonomous Agent Tool Callers', 'Build function calling tools and subagent execution handlers.', array['System Architecture'], 12.0, 1, false),
    (v_p2_id, 'Set up Prompt Governance & Rate Limiting', 'Implement token usage limits and prompt injection filters.', array['React / Next.js'], 6.0, 2, false);
end $$;

-- Step 6: Seed Blueprint 4 — Custom Solution (2 Phases, 2 Tasks each)
do $$
declare
  v_tmpl_id uuid;
  v_p1_id uuid;
  v_p2_id uuid;
  v_next_ver int;
begin
  select coalesce(max(version), 0) + 1 into v_next_ver
  from public.sop_templates
  where project_type = 'custom_solution';

  insert into public.sop_templates (project_type, name, version, is_active)
  values ('custom_solution', 'Custom Architecture Standard Blueprint', v_next_ver, true)
  returning id into v_tmpl_id;

  -- Phase 1
  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values (v_tmpl_id, 1, 'Custom Requirements & System Blueprinting', 'Define custom data schemas and third-party integrations.', '["Blueprint approved"]'::jsonb)
  returning id into v_p1_id;

  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_p1_id, 'Draft Technical Specification & Data Contracts', 'Produce system architecture diagram and REST/gRPC API contracts.', array['System Architecture'], 8.0, 1, false),
    (v_p1_id, 'Provision Infrastructure & Staging Cluster', 'Configure cloud services, storage buckets, and secrets.', array['PostgreSQL / Ledger'], 6.0, 2, false);

  -- Phase 2
  insert into public.sop_template_phases (sop_template_id, phase_order, name, description, exit_criteria)
  values (v_tmpl_id, 2, 'Implementation & Final Handover', 'Custom feature implementation and operational handover.', '["Handover complete"]'::jsonb)
  returning id into v_p2_id;

  insert into public.sop_template_tasks (sop_template_phase_id, title, description, required_skill_tags, estimated_hours, task_order, is_optional)
  values
    (v_p2_id, 'Develop Custom Core Business Logic', 'Build specialized domain features and workflow handlers.', array['React / Next.js'], 14.0, 1, false),
    (v_p2_id, 'Conduct Operational Training & Documentation', 'Deliver administrator manuals and operational training.', array['System Architecture'], 4.0, 2, false);
end $$;

-- Step 7: Verification Query
select t.project_type, t.name as template_name, t.version, t.is_active, count(p.id) as phase_count
from public.sop_templates t
left join public.sop_template_phases p on p.sop_template_id = t.id
where t.is_active = true
group by t.project_type, t.name, t.version, t.is_active
order by t.project_type;
