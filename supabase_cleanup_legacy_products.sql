-- =============================================================================
-- AarGa — Supabase Cleanup: Legacy Products Deprecation
-- Run this script in the Supabase SQL Editor to remove legacy products
-- (PayCircle, AarFlow, VeriSkill, GridPay) and retain only the 3 flagship tools:
-- NexFix, Exora, AarVed.
-- =============================================================================

-- Delete legacy product rows by slug safely
delete from public.projects
where slug in ('paycircle', 'aarflow', 'veriskill', 'gridpay');

-- Verify that exactly 3 flagship products remain in public.projects
select slug, title, status, category, created_at 
from public.projects 
order by created_at;
