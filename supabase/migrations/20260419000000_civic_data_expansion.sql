-- Phase 4: civic intelligence schema (Congress.gov, Open States, Google Civic)
-- Sensitive profile fields: public reads use profiles_directory view (definer).

begin;

-- PROFILES: district cache (never expose raw address)
alter table public.profiles
  add column if not exists home_address_hash text,
  add column if not exists ocd_ids text[] not null default '{}'::text[];

-- REPRESENTATIVES: external IDs + sync metadata
alter table public.representatives
  add column if not exists bioguide_id text,
  add column if not exists openstates_id text,
  add column if not exists chamber text,
  add column if not exists level text,
  add column if not exists email text,
  add column if not exists twitter text,
  add column if not exists office_address text,
  add column if not exists term_start date,
  add column if not exists term_end date,
  add column if not exists synced_at timestamptz;

create unique index if not exists representatives_bioguide_id_key
  on public.representatives (bioguide_id)
  where bioguide_id is not null;

create unique index if not exists representatives_openstates_id_key
  on public.representatives (openstates_id)
  where openstates_id is not null;

create index if not exists idx_reps_ocd_id on public.representatives (ocd_id);
create index if not exists idx_reps_level_state on public.representatives (level, state);

-- BILLS: jurisdiction + sync metadata
alter table public.bills
  add column if not exists level text,
  add column if not exists state text,
  add column if not exists chamber text,
  add column if not exists last_action text,
  add column if not exists last_action_date date,
  add column if not exists sponsor_id uuid references public.representatives (id),
  add column if not exists source_url text,
  add column if not exists synced_at timestamptz;

-- USER ↔ REP alignment (computed server-side / jobs)
create table if not exists public.user_rep_alignments (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  rep_id uuid not null references public.representatives (id) on delete cascade,
  alignment_score numeric(5, 2),
  votes_aligned int not null default 0,
  votes_total int not null default 0,
  computed_at timestamptz not null default now (),
  unique (user_id, rep_id)
);

create index if not exists idx_user_rep_alignments_user_id on public.user_rep_alignments (user_id);

-- SYNC observability (written by service role / cron)
create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid (),
  job_type text not null,
  status text not null,
  started_at timestamptz not null default now (),
  completed_at timestamptz,
  error_message text,
  records_upserted int,
  records_failed int,
  constraint sync_jobs_status_enum check (status in ('running', 'success', 'failed'))
);

-- Public-safe profile directory (excludes home_address_hash, ocd_ids)
drop view if exists public.profiles_directory;
create view public.profiles_directory with (security_invoker = false) as
select
  p.id,
  p.username,
  p.display_name,
  p.bio,
  p.avatar_url,
  p.role,
  p.interests,
  p.location_city,
  p.location_state,
  p.created_at,
  p.updated_at
from public.profiles p
where p.deleted_at is null;

grant select on public.profiles_directory to anon, authenticated, service_role;

-- Tighten profiles SELECT: own row only on base table (full row incl. civic fields)
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_self"
on public.profiles
for select
to public
using (deleted_at is null and id = auth.uid ());

drop policy if exists "profiles_select_admin_all" on public.profiles;
create policy "profiles_select_admin_all"
on public.profiles
for select
to public
using (deleted_at is null and public.is_admin (auth.uid ()));

-- USER REP ALIGNMENTS
alter table public.user_rep_alignments enable row level security;

drop policy if exists "user_rep_alignments_select_own" on public.user_rep_alignments;
create policy "user_rep_alignments_select_own"
on public.user_rep_alignments
for select
to public
using (user_id = auth.uid ());

-- SYNC JOBS (admin read; writes via service_role bypass RLS)
alter table public.sync_jobs enable row level security;

drop policy if exists "sync_jobs_select_admin" on public.sync_jobs;
create policy "sync_jobs_select_admin"
on public.sync_jobs
for select
to public
using (public.is_admin (auth.uid ()));

commit;
