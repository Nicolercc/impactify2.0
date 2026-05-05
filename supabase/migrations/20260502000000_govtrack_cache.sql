begin;

-- Generic API cache for slow/limited public APIs (e.g., GovTrack).
-- Access pattern: server-side service-role only.
create table if not exists public.api_cache (
  id uuid primary key default gen_random_uuid(),
  namespace text not null,
  cache_key text not null,
  value jsonb not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (namespace, cache_key)
);

create index if not exists idx_api_cache_lookup
  on public.api_cache (namespace, cache_key);

create index if not exists idx_api_cache_expires
  on public.api_cache (expires_at);

-- Keep updated_at current (function created in initial schema).
drop trigger if exists api_cache_set_updated_at on public.api_cache;
create trigger api_cache_set_updated_at
before update on public.api_cache
for each row execute function public.set_updated_at();

-- Lock down via RLS (service_role bypasses; no public policies).
alter table public.api_cache enable row level security;

commit;

