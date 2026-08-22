-- =============================================================================
-- AarGa — Supabase Admin RLS Policies for ecosystem_metrics
-- Run this script in the Supabase SQL Editor to establish admin-only write
-- policies (INSERT, UPDATE, DELETE) on the public.ecosystem_metrics table.
-- =============================================================================

-- Ensure RLS is enabled on ecosystem_metrics
alter table public.ecosystem_metrics enable row level security;

-- Admin-only INSERT policy
drop policy if exists "Admins can insert ecosystem_metrics" on public.ecosystem_metrics;
create policy "Admins can insert ecosystem_metrics"
  on public.ecosystem_metrics for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Admin-only UPDATE policy
drop policy if exists "Admins can update ecosystem_metrics" on public.ecosystem_metrics;
create policy "Admins can update ecosystem_metrics"
  on public.ecosystem_metrics for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Admin-only DELETE policy
drop policy if exists "Admins can delete ecosystem_metrics" on public.ecosystem_metrics;
create policy "Admins can delete ecosystem_metrics"
  on public.ecosystem_metrics for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- Verification Query
-- Confirm all active policies (Public READ + Admin INSERT/UPDATE/DELETE)
-- -----------------------------------------------------------------------------
select policyname, cmd, roles
from pg_policies
where tablename = 'ecosystem_metrics';
