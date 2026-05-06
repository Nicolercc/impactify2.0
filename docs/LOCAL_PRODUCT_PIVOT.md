# Local product context — News-centric pivot (do not commit)

This file is listed in `.gitignore`. Keep strategic notes here only.

## Problem statement (before)

Vote-centric flow with synthetic voting → weak “why care?” → missing news context → user confusion.

## Product direction (after)

**News is source of truth.** Journey: real article → relevance (“this matters to me”) → AI briefing (Claude) → rep stance (mock OK for demo, GovTrack later) → contact with script grounded in the story.

**Transparency for demos**

- News: real (Guardian / feeds).
- Briefings: real (Claude).
- Rep positions: mock for now; label as contextual / demo where appropriate.
- UX proves: filter → understand → connect → act in ~5 minutes.

## Sofia journey (phases)

1. **Discovery (landing)** — Hero + 5–6 Guardian stories; CTAs: neighborhood understanding + issue chips (climate, housing, voting rights, …).
2. **Selection (onboarding)** — Issue checkboxes + ZIP + Next.
3. **Context (/news)** — Feed filtered by issues + location; each card: article → AI briefing → YOUR REPS (mock, contextual) → Contact CTA.
4. **Action** — Modal: topic, user position, rep stance, call/email/script with article context.

## Target data model (conceptual)

- `ArticleNode`: id, title, source, date, content, issues[], locations[]
- `BriefingNode`: articleId, background, keyPlayers, impacts (national / local / user), actionItems[]
- `RepContextNode`: articleId → reps[] with position + reasoning
- Graph: Article 1:1 Briefing; Article 1:many Reps; Article many:many Issues/Locations

## Engineering implications (when implementing)

- Cache/isolate Guardian fetch; typed article pipeline.
- Briefings: server-side or edge generation with article id + user ZIP/issues; stale-while-revalidate for demo stability.
- Rep layer: adapter interface (`mock` now, `govtrack` later).
- Contact modal: props from article + briefing + rep context (no fabricated vote records as “truth”).

## Demo readiness — test strategy (FAANG-style, to implement next)

When code lands, validate with:

1. **Smoke E2E (Playwright or equivalent)** — Chromium + Firefox + WebKit; mobile viewport + desktop. Paths: landing → onboarding → news feed → open briefing block → open contact modal → assert script contains bill/issue tokens.
2. **Contract tests** — Guardian adapter response shape; Claude briefing JSON schema; mock rep adapter returns expected ids for ZIP.
3. **Performance budgets** — LCP/CLS on `/` and `/news`; TTFB for briefing route; image/`next/image` policy for article thumbnails.
4. **Resilience** — API timeout/fallback copy for news and briefing (no white screen); graceful degradation if Claude fails.
5. **Accessibility** — Modal focus trap, heading order on article cards, keyboard path to Contact.
6. **Synthetic monitoring (optional)** — Scheduled ping of prod/staging demo URLs post-deploy.

---

_Last updated from stakeholder pivot notes (news-first demo)._
