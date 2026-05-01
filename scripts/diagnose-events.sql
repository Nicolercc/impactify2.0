-- Run in Supabase SQL Editor or: psql $DATABASE_URL -f scripts/diagnose-events.sql
-- STEP 1: counts
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'published' AND deleted_at IS NULL) AS published,
       COUNT(*) FILTER (WHERE starts_at > now()) AS upcoming,
       COUNT(*) FILTER (
         WHERE status = 'published' AND deleted_at IS NULL AND starts_at > now()
       ) AS visible
FROM public.events;

-- Recent rows by starts_at
SELECT title, starts_at, status, deleted_at
FROM public.events
ORDER BY starts_at DESC
LIMIT 5;

-- RLS policies on events (polqual is internal expression; use pg_get_expr for readable form)
SELECT polname,
       polcmd,
       pg_get_expr(polqual, polrelid) AS using_expr
FROM pg_policy
WHERE polrelid = 'public.events'::regclass;
