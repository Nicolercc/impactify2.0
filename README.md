# Impactify 2.0

### Civic Intelligence That Connects News to Action

**Impactify is a full-stack civic intelligence platform that turns current events into understandable context, relevant public information, and concrete ways to engage.**

The platform combines live journalism, AI-generated civic briefings, community events, representative and voting data, and personalized civic tools in a single application.

Instead of stopping at *“what happened?”*, Impactify is designed around a second question:

> **“What does this mean—and what can I do about it?”**

Built with **Next.js, React, TypeScript, Supabase, Anthropic Claude, The Guardian API, GovTrack, and ProPublica data integrations.**

---

## The Problem

News products are good at telling people that something happened.

They are often much worse at helping readers understand:

* the background behind an issue
* who the important actors are
* what happened before the current headline
* what is actually at stake
* which elected officials are involved
* how representatives voted
* what relevant civic events are happening
* what someone can realistically do next

Impactify explores what a more **action-oriented civic information system** could look like.

The product connects several traditionally separate experiences:

```text
News
  ↓
Context
  ↓
Public officials
  ↓
Votes & policy
  ↓
Local civic activity
  ↓
Action
```

---

# Product Experience

Impactify includes several connected surfaces.

### Live News Discovery

Current reporting is retrieved from **The Guardian Open Platform** and organized into a browsable news experience with:

* search
* issue/category filtering
* pagination
* article previews
* source attribution
* responsive discovery controls

### AI Civic Briefings

Articles can be supplemented with structured AI-generated context including:

* background
* key players
* timeline
* what's at stake

The briefing is intentionally presented as an additional context layer rather than a replacement for the source article.

### Civic Events

Users can discover upcoming events connected to civic causes, including:

* event details
* location and venue information
* virtual events
* organizers
* related causes
* capacity and attendance information
* RSVP state

### Representatives & Voting Records

Impactify also explores the relationship between policy and representation through:

* representative directories
* federal representative data
* bill/vote information
* representative stances
* issue alignment
* government-data integrations

### Action-Oriented Article Experience

Article pages are designed to move beyond passive consumption.

Readers can move from a story into related context, civic information, events, representatives, and other potential next steps.

---

# Architecture

```text
                         ┌───────────────────────┐
                         │         User          │
                         └───────────┬───────────┘
                                     │
                                     ▼
                     ┌───────────────────────────┐
                     │      Next.js 16 App       │
                     │     React + TypeScript    │
                     │                           │
                     │ Server + Client Components│
                     └─────────────┬─────────────┘
                                   │
             ┌─────────────────────┼───────────────────────┐
             │                     │                       │
             ▼                     ▼                       ▼
    ┌────────────────┐    ┌────────────────┐      ┌────────────────┐
    │ Guardian API   │    │   Supabase     │      │ Anthropic AI   │
    │                │    │                │      │                │
    │ Live news      │    │ Events         │      │ Civic briefing │
    │ Article data   │    │ Profiles       │      │ generation     │
    └───────┬────────┘    │ Briefing cache │      └───────┬────────┘
            │             │ Civic data     │              │
            │             └───────┬────────┘              │
            │                     │                       │
            └─────────────────────┼───────────────────────┘
                                  │
                                  ▼
                        ┌────────────────────┐
                        │ Civic Intelligence │
                        │    Experience      │
                        └─────────┬──────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
              Events       Representatives      Actions
                                 │
                                 ▼
                         Public Data APIs
                       GovTrack / ProPublica
```

---

# Engineering Highlights

## 1. Server-Side News Ingestion

Impactify integrates with The Guardian's content API through a dedicated server-side client.

The integration supports:

```text
search
section filters
keyword queries
tags
pagination
article detail retrieval
```

API credentials stay server-side rather than being exposed to the browser.

External requests are also bounded with request timeouts so a slow upstream service cannot indefinitely block a page request.

```ts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10_000);
```

The application gracefully returns an empty result when the upstream provider is unavailable rather than crashing the entire interface.

---

## 2. Caching Live News with Next.js

Fetching remote journalism on every request would unnecessarily increase latency and API traffic.

Guardian requests therefore use Next.js data-cache revalidation:

```ts
fetch(url, {
  signal: controller.signal,
  next: { revalidate: 3600 },
});
```

Article pages also use Incremental Static Regeneration.

```ts
export const revalidate = 3600;
```

This gives Impactify a useful tradeoff:

```text
Fresh enough for news discovery
        +
Reduced upstream API traffic
        +
Faster repeat requests
```

---

## 3. Structured AI Briefing Generation

Impactify uses Claude to transform an article excerpt into a compact civic briefing.

The model does not simply return arbitrary prose.

The expected response is defined through a Zod schema:

```ts
const briefingSchema = z.object({
  background: z.string(),
  keyPlayers: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
    }),
  ),
  timeline: z.array(
    z.object({
      date: z.string(),
      event: z.string(),
    }),
  ),
  whatsAtStake: z.string(),
});
```

The AI SDK then produces an object conforming to that structure.

This means frontend components consume predictable application data instead of parsing free-form model text.

---

## 4. AI Request Validation

Before an article can enter the AI pipeline, the API validates the request:

```ts
const bodySchema = z.object({
  articleId: z.string().min(1).max(500),
  title: z.string().min(1).max(500),
  body: z.string().min(1).max(120_000),
});
```

Malformed requests receive explicit `400` responses before invoking the model.

This keeps expensive AI operations behind deterministic application validation.

---

## 5. AI Result Persistence & Reuse

For database-backed articles, Impactify checks for an existing briefing before generating a new one.

```text
Briefing request
      ↓
Look for persisted briefing
      ↓
    HIT ─────────────→ return cached result
      │
     MISS
      ↓
Generate structured briefing
      ↓
Persist to Supabase
      ↓
Return result
```

Successful outputs can be stored in the `ai_briefings` table and reused on future requests.

This improves both latency and model-cost efficiency.

---

## 6. AI Rate Limiting

AI generation is considerably more expensive than a normal database request.

The briefing endpoint therefore includes per-client request limiting.

The current implementation allows a bounded number of requests per time window and returns `429 Too Many Requests` when that threshold is exceeded.

```text
Client request
     ↓
rate bucket
     ↓
allowed? ── no ──→ 429
     │
    yes
     ↓
AI pipeline
```

A distributed production deployment would move this state into infrastructure such as Redis rather than relying on process memory.

---

## 7. Eliminating Duplicate AI Requests

An earlier version of the article briefing interface allowed separate Context, Timeline, and Stakes components to independently trigger the same briefing request.

That meant one article could generate several identical backend calls.

The data-fetch lifecycle was refactored into a shared `BriefingProvider`.

```text
Before

Context ───────→ API
Timeline ──────→ API
Stakes ────────→ API


After

                 ┌→ Context
Article → Provider ─→ Timeline
                 └→ Stakes
             │
             └────→ ONE API request
```

This reduced redundant network requests and unnecessary model usage while creating a single source of truth for briefing state.

---

## 8. Supabase-Backed Civic Data

Supabase acts as the application data layer for civic information such as events, profiles, relationships, and cached AI briefings.

The application uses Supabase's SSR client with Next.js cookie integration so session-aware server code can query data without moving authentication state into client-only code.

Event data includes information such as:

```text
title
description
start/end time
venue
city/state
virtual status
capacity
attendance
organizer
related causes
publication state
```

Draft-event access also considers the active user and organizer/admin permissions before returning protected content.

---

## 9. Graceful Dependency Failure

Impactify depends on several external systems.

A core design principle is that **every external dependency should not become a single point of total UI failure**.

For example, upcoming-event queries treat Supabase as a recoverable dependency during the current demo stage:

```text
Supabase available
      ↓
return live events

Supabase unavailable
      ↓
return demonstration events
```

AI briefing lookups similarly return `null` when the optional database-backed context cannot be reached.

This keeps non-critical service failures from cascading across otherwise usable product surfaces.

---

## 10. Representatives + Legislative Data Pipeline

The representatives experience combines internal civic data with external government datasets.

The application can use data from sources including:

* **ProPublica**
* **GovTrack**
* Supabase representative records

A representative-vote workflow can:

1. retrieve representatives for a state/district
2. retrieve bill vote information
3. retrieve individual roll-call voters
4. map government identifiers
5. match those records back to stored representatives
6. derive representative voting stances for the UI

Conceptually:

```text
User location
     ↓
Representatives
     ↓
Bill
     ↓
GovTrack vote
     ↓
Individual voter records
     ↓
Government identifier mapping
     ↓
Representative stance
```

The system also distinguishes live data from fallback/example data rather than silently presenting demonstration records as live results.

---

## 11. Resilient Public-Data APIs

Government-data services can fail independently.

The representatives API is designed to preserve partial usefulness.

For example:

```text
Representatives loaded
        ↓
GovTrack unavailable
        ↓
Return representatives
+
explicitly mark vote data unavailable
```

Likewise, missing voter records can produce a `PENDING` or `UNDECIDED` state rather than fabricating a representative's vote.

This is an important product distinction: **absence of data is modeled as absence of data.**

---

## 12. Server and Client Responsibility Boundaries

Impactify uses the Next.js App Router to deliberately split responsibilities.

### Server

Handles:

* API credentials
* Guardian retrieval
* Supabase queries
* AI generation
* protected data access
* caching
* government-data aggregation

### Client

Handles:

* interaction
* discovery filters
* navigation state
* animated UI
* tabs and controls
* responsive presentation

This minimizes unnecessary client-side data access and keeps privileged credentials out of browser bundles.

---

# Performance Work

Impactify includes several performance optimizations beyond basic framework defaults.

### ISR

News pages can be regenerated periodically rather than rendered from scratch for every visitor.

### Data caching

Guardian requests use an explicit one-hour revalidation window.

### React request memoization

Server-side query functions use React's `cache()` where duplicate execution within a render lifecycle can be avoided.

### Deferred below-the-fold rendering

Some lower-priority article content uses browser-native `content-visibility` so off-screen work can be skipped until needed.

### Shared briefing state

AI briefing requests are deduplicated across UI tabs.

### Parallelized data fetching

Independent article-related operations can execute concurrently rather than serially where appropriate.

---

# Reliability Decisions

Impactify includes a number of smaller engineering decisions that make the application more robust:

* external request timeouts
* Zod request validation
* structured AI outputs
* AI rate limiting
* explicit HTTP error responses
* graceful upstream API fallbacks
* cached AI briefings
* stale-data caching policies
* server-only secret handling
* source attribution
* explicit demo/live-data distinctions

---

# Frontend Engineering

The frontend uses:

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS 4**
* **Radix UI**
* **Framer Motion**
* **Recharts**
* **React Hook Form**
* **Zod**

The application includes reusable interaction patterns across:

* news discovery
* article reading
* AI briefings
* event discovery
* representative directories
* civic-action surfaces
* responsive navigation

Accessibility considerations include semantic HTML, ARIA state where appropriate, and reduced-motion support in interactive components.

---

# Backend / Data Layer

Impactify uses Next.js route handlers and server-side modules rather than a separate backend service.

Core backend technologies include:

* Next.js Route Handlers
* TypeScript
* Supabase
* Anthropic Claude
* Vercel AI SDK
* Zod
* Guardian Open Platform
* GovTrack
* ProPublica integrations

---

# Tech Stack

| Layer               | Technology                       |
| ------------------- | -------------------------------- |
| Language            | TypeScript                       |
| Framework           | Next.js 16                       |
| UI                  | React 19                         |
| Styling             | Tailwind CSS 4                   |
| Database / Auth     | Supabase                         |
| AI                  | Anthropic Claude                 |
| AI SDK              | Vercel AI SDK                    |
| Validation          | Zod                              |
| News                | The Guardian Open Platform       |
| Legislative Data    | GovTrack                         |
| Representative Data | ProPublica / internal civic data |
| UI Components       | Radix UI                         |
| Animation           | Framer Motion                    |
| Visualization       | Recharts                         |
| Forms               | React Hook Form                  |
| Testing             | Vitest, Testing Library          |
| Analytics           | Vercel Analytics                 |

---

# Local Development

## Requirements

* Node.js
* npm
* Supabase project credentials
* Guardian API key
* Anthropic API key for AI briefings

Clone the repository:

```bash
git clone https://github.com/Nicolercc/impactify2.0.git
cd impactify2.0
```

Install dependencies:

```bash
npm install
```

Configure your environment variables.

A typical local configuration includes:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GUARDIAN_API_KEY=

ANTHROPIC_API_KEY=
```

Optional government-data integrations may require additional API configuration.

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# Testing

Run the test suite:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Build the production application:

```bash
npm run build
```

---

# Architectural Tradeoffs & Current Limitations

Impactify 2.0 is a portfolio-scale product, not a finished civic-data infrastructure platform.

Several current design choices would evolve for production-scale usage.

### In-memory AI rate limiting

The current briefing rate limiter is process-local.

A multi-instance production system should use a shared rate-limit store such as Redis.

### Mixed live and demonstration civic data

Some surfaces deliberately fall back to example datasets when an upstream data provider or database is unavailable.

These states are identified in the interface, but a production system would require more complete live-data coverage.

### Government API reliability

GovTrack and other public-data providers vary in latency, schema stability, and availability.

A mature architecture would likely ingest and normalize important legislative data asynchronously rather than depending entirely on user-time upstream requests.

### AI briefing provenance

AI briefings summarize provided article context but are still generated outputs.

A higher-trust version of Impactify would attach claim-level citations and provenance to briefing statements.

### Database typing

The current Supabase database type placeholder should be replaced with generated database types throughout the application to strengthen compile-time guarantees.

---

# What I Would Build Next

A production-oriented evolution of Impactify would add:

* generated Supabase database types
* persistent distributed rate limiting
* background government-data ingestion
* normalized legislative data models
* claim-level AI citations
* briefing provenance
* stronger observability and tracing
* structured external-API metrics
* end-to-end testing
* personalized civic feeds
* richer location-aware representative matching
* notification workflows
* stronger event recommendation logic
* explicit cache invalidation strategies

---

# What I Learned

Impactify required thinking across far more than a single frontend feature.

Building it involved reasoning about:

* external API reliability
* server/client boundaries
* AI output contracts
* request validation
* caching strategy
* model-cost control
* duplicate request elimination
* ISR and revalidation
* database-backed state
* user/session-aware data access
* government identifier mapping
* partial failure
* responsive interaction design
* accessibility
* and the relationship between information architecture and user action

One of the most important architectural ideas behind the project is:

> **A useful civic product should not only deliver information—it should connect information to context and context to action.**

---

## Author

**Nicole Rodriguez**
Software Engineer

[Portfolio](https://nicolerodriguez.dev) · [GitHub](https://github.com/Nicolercc)
