# Impactify — Deferred Technical Debt

Items from the Phase 3 audit to address in later phases or
polish rounds. Not blocking.

## Accessibility (address in Phase 7 a11y pass)
- [ ] RSVP button needs aria-pressed (components/events/rsvp-widget.tsx)
- [ ] Onboarding cause chips need aria-pressed or role="checkbox"
      (app/onboarding/page.tsx)
- [ ] News filter buttons should be role="tablist"/"tab" or
      Radiogroup (components/news/news-feed.tsx)
- [ ] Sign-in form: focus first invalid field on server error
      (components/auth/sign-in-form.tsx)
- [ ] Article card alt text should derive from title/dek, not
      empty string (components/news/article-card.tsx)
- [ ] Automated contrast audit with axe or Polypane

## Correctness (address when touching these files)
- [ ] listSaves return type: ActionResult<SaveRow[]> not unknown[]
      (app/actions/saves.ts)
- [ ] Remove `as unknown as` casts in lib/events/queries.ts and
      lib/news/queries.ts after tightening Database types
- [ ] Briefing API: map OpenAI rate-limit errors to 429 + Retry-After
- [ ] Auth callback: support ?next= safe redirect allowlist

## Performance (Phase 7 perf pass)
- [ ] Gate middleware anon-session creation if re-enabled

## Schema (review in Phase 5/6)
- [ ] event_causes RLS: restrict SELECT to published events
      (currently public for all pairs)
- [ ] notifications RLS: document that client-side inserts will
      fail; add policy if/when needed

## Build hygiene
- [ ] Multiple lockfiles warning — consolidate if duplicates exist
- [ ] Plan Next.js middleware → proxy migration before Next 16 EOL
- [ ] Commit generated lib/supabase/types.ts; add to CI check

## Polish
- [ ] Google brand hex in GoogleButton is OK (standard exception)
- [ ] Nav state colors use rgba literals instead of tokens
      (components/nav/site-header-client.tsx)
