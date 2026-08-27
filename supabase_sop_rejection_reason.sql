-- =============================================================================
-- AarGa — Add rejection_reason column to sop_tasks
-- Run this script in the Supabase SQL Editor to store founder rejection feedback on sop_tasks.
-- =============================================================================

alter table public.sop_tasks
  add column if not exists rejection_reason text;

comment on column public.sop_tasks.rejection_reason is 'Founder / Lead rejection feedback notes returned to the employee for revisions.';
