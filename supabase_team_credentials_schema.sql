-- =============================================================================
-- AarGa — Team Member Email, Username & Credentials Migration
-- Run this script in the Supabase SQL Editor to add email, username, dob_year,
-- and default_password_hint tracking to public.team_members.
-- =============================================================================

alter table public.team_members
  add column if not exists email text,
  add column if not exists username text unique,
  add column if not exists dob_year integer,
  add column if not exists default_password_hint text;

comment on column public.team_members.email is 'Official contact/login email address.';
comment on column public.team_members.username is 'Unique system username handle derived from email handle before @.';
comment on column public.team_members.dob_year is 'Birth year used for default password generation (e.g. 2006, 2007).';
comment on column public.team_members.default_password_hint is 'Default initial password hint (e.g. emp@yuva#2007, int@arav#2006).';
