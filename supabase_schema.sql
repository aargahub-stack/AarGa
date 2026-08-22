-- =============================================================================
-- AarGa — Supabase schema + seed data
-- Copy/paste this entire file into the Supabase SQL Editor and run it once.
-- Safe to re-run: tables/policies are dropped first, so it's idempotent.
-- =============================================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Clean slate (safe re-run)
-- -----------------------------------------------------------------------------
drop table if exists public.interns cascade;
drop table if exists public.projects cascade;
drop table if exists public.ecosystem_metrics cascade;

-- -----------------------------------------------------------------------------
-- projects  (the ecosystem tools: PayCircle, Nexfix, AarFlow, Exora, ...)
-- -----------------------------------------------------------------------------
create table public.projects (
  id                        uuid primary key default gen_random_uuid(),
  title                     text not null,
  slug                      text not null unique,
  category                  text not null,
  tagline                   text,
  description               text,
  tech_stack                text[] not null default '{}',
  live_url                  text,
  status                    text not null default 'Alpha'
                              check (status in ('GA', 'Beta', 'Alpha')),
  accent                    text not null default 'emerald'
                              check (accent in ('emerald', 'moss', 'gold')),
  size                      text not null default 'sm'
                              check (size in ('sm', 'md', 'lg')),
  infrastructure_capacity   jsonb not null default '{}'::jsonb,
  metrics                   jsonb not null default '{}'::jsonb,
  created_at                timestamptz not null default now()
);

comment on table public.projects is
  'AarGa ecosystem products (PayCircle, Nexfix, AarFlow, Exora, VeriSkill, GridPay, ...).';

create index projects_status_idx on public.projects (status);
create index projects_category_idx on public.projects (category);

-- -----------------------------------------------------------------------------
-- interns  (Verified Interns Registry, scored by the VeriSkill engine)
-- -----------------------------------------------------------------------------
create table public.interns (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  profile_slug       text not null unique,
  role               text not null,
  cohort_label       text,
  cohort_date        date,
  location           text,
  avatar_initials    text,
  telemetry_score    integer not null default 0
                        check (telemetry_score between 0 and 100),
  verified_status    text not null default 'In Review'
                        check (verified_status in ('Verified', 'In Review')),
  skills             text[] not null default '{}',
  college_info       text,
  projects_shipped   integer not null default 0,
  blurb              text,
  created_at         timestamptz not null default now()
);

comment on table public.interns is
  'Verified Interns Registry — telemetry-scored candidates from the VeriSkill engine.';

create index interns_status_idx on public.interns (verified_status);

-- -----------------------------------------------------------------------------
-- ecosystem_metrics  (KPI rows for foundation & commercial entities)
-- -----------------------------------------------------------------------------
create table public.ecosystem_metrics (
  id             uuid primary key default gen_random_uuid(),
  entity_type    text not null check (entity_type in ('foundation', 'commercial')),
  metric_key     text not null unique,
  metric_label   text not null,
  metric_value   text not null,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);

comment on table public.ecosystem_metrics is
  'Ecosystem-level KPIs for foundation and commercial SaaS arms.';

create index ecosystem_metrics_entity_idx on public.ecosystem_metrics (entity_type, display_order);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.interns  enable row level security;
alter table public.ecosystem_metrics enable row level security;

drop policy if exists "Public read access" on public.projects;
create policy "Public read access"
  on public.projects
  for select
  using (true);

drop policy if exists "Public read access" on public.interns;
create policy "Public read access"
  on public.interns
  for select
  using (true);

drop policy if exists "Public read access" on public.ecosystem_metrics;
create policy "Public read access"
  on public.ecosystem_metrics
  for select
  using (true);

-- No insert/update/delete policies are defined for the anon/authenticated
-- roles, so all writes must go through the service role key (i.e. an
-- authenticated backend/admin process), never directly from the browser.

-- =============================================================================
-- Seed data — mirrors the static fallback in src/data/* so the site looks
-- identical the moment Supabase is connected.
-- =============================================================================

insert into public.projects
  (title, slug, category, tagline, description, tech_stack, live_url, status, accent, size, infrastructure_capacity, metrics)
values
  (
    'NexFix', 'nexfix', 'Operations & Finance',
    'Dispatch and repair-network orchestration for hardware fleets.',
    'NexFix coordinates verified field technicians, parts inventory, maintenance accounting, and SLA tracking across distributed hardware deployments.',
    array['Next.js', 'Redis', 'PostGIS', 'Node.js'],
    'https://nexfix.aarga.org',
    'GA', 'moss', 'lg',
    '{"regionsServed": 7, "nodeType": "edge-sync"}',
    '{"uptime": "99.9%", "techsActive": "3,400+", "avgResolve": "6.2h"}'
  ),
  (
    'Exora', 'exora', 'Secure Examinations & Academic Integrity',
    'Impact analytics, proctored assessment, and integrity verification.',
    'Exora ingests raw operational telemetry and renders it as proctored assessment verification, funder-ready impact reports, and observability dashboards.',
    array['ClickHouse', 'dbt', 'Next.js', 'Python'],
    'https://exora.aarga.org',
    'GA', 'emerald', 'md',
    '{"regionsServed": 14, "nodeType": "analytics-pipeline"}',
    '{"uptime": "99.95%", "dashboards": "2,100+", "dataPoints": "48M/mo"}'
  ),
  (
    'AarVed', 'aarved', 'Education & Student Learning',
    'Interactive learning pathways, skill tracking, and student telemetry.',
    'AarVed provides interactive learning pathways, automated skill verification, and student telemetry for NGO education programs and vocational academies.',
    array['Next.js', 'PostgreSQL', 'Python', 'Tailwind CSS'],
    'https://aarved.aarga.org',
    'Beta', 'gold', 'md',
    '{"studentsActive": 1200, "nodeType": "learning-engine"}',
    '{"uptime": "99.8%", "coursesLive": "42", "studentsEnrolled": "1,200+"}'
  );

insert into public.interns
  (name, profile_slug, role, cohort_label, cohort_date, location, avatar_initials, telemetry_score, verified_status, skills, college_info, projects_shipped, blurb)
values
  (
    'Ananya Rao', 'ananya-rao', 'Backend Engineering Intern',
    'Cohort 7 — Payments Infra', '2025-11-03', 'Kozhikode, IN', 'AR',
    92, 'Verified',
    array['Node.js', 'PostgreSQL', 'System Design', 'Ledger Modeling'],
    'NIT Calicut — B.Tech Computer Science', 4,
    'Shipped the reconciliation engine improvements now live in PayCircle''s settlement pipeline.'
  ),
  (
    'Devansh Mehta', 'devansh-mehta', 'Frontend Engineering Intern',
    'Cohort 7 — Ecosystem UI', '2025-11-03', 'Pune, IN', 'DM',
    88, 'Verified',
    array['React', 'Next.js', 'Design Systems', 'Accessibility'],
    'COEP Technological University — B.Tech IT', 6,
    'Rebuilt the Bento grid component library shared across the marketing site and the Portal.'
  ),
  (
    'Fatima Sheikh', 'fatima-sheikh', 'Data & Analytics Intern',
    'Cohort 8 — Exora Insight', '2026-01-12', 'Hyderabad, IN', 'FS',
    95, 'Verified',
    array['dbt', 'ClickHouse', 'Data Modeling', 'Impact Reporting'],
    'IIIT Hyderabad — B.Tech CSE', 3,
    'Designed the funder-facing impact report templates now used across 40+ NGO partners.'
  ),
  (
    'Karthik Iyer', 'karthik-iyer', 'Field Systems Intern',
    'Cohort 8 — Nexfix Ops', '2026-01-12', 'Chennai, IN', 'KI',
    81, 'In Review',
    array['PostGIS', 'Offline Sync', 'Dispatch Logic'],
    'Anna University — B.E. Computer Science', 2,
    'Building offline dispatch queuing for technician routing in low-connectivity zones.'
  ),
  (
    'Meera Nair', 'meera-nair', 'Trust & Safety Intern',
    'Cohort 9 — VeriSkill Core', '2026-03-02', 'Kochi, IN', 'MN',
    90, 'Verified',
    array['Eval Harness Design', 'Python', 'Fraud Heuristics'],
    'Cochin University of Science and Technology — M.Tech CSE', 5,
    'Co-authored the scoring rubric that now powers the VeriSkill credentialing engine.'
  ),
  (
    'Rohan Das', 'rohan-das', 'Platform Engineering Intern',
    'Cohort 9 — Identity Core', '2026-03-02', 'Bengaluru, IN', 'RD',
    76, 'In Review',
    array['Auth', 'gRPC', 'Kubernetes'],
    'RV College of Engineering — B.E. ISE', 2,
    'Migrating shared identity core services onto the new multi-tenant cluster topology.'
  );

insert into public.ecosystem_metrics
  (entity_type, metric_key, metric_label, metric_value, display_order)
values
  ('foundation', 'partner_organizations', 'Partner organizations onboarded', '146', 1),
  ('foundation', 'communities_served', 'Active field deployments', '40+', 2),
  ('commercial', 'uptime_sla', 'Platform-wide uptime SLA', '99.9%', 1),
  ('commercial', 'ga_products', 'Products in GA', '3', 2);

-- =============================================================================
-- Done. Verify with:
--   select count(*) from public.projects;
--   select count(*) from public.interns;
--   select count(*) from public.ecosystem_metrics;
-- =============================================================================
