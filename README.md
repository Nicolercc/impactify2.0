## Impactify

Next.js app with a Supabase (Postgres) backend foundation: schema migrations, RLS, auth trigger, seed data, typed Supabase clients, middleware session refresh, and server actions.

## Local setup

1. Install dependencies

```bash
npm install
```

2. Start Supabase (local) or link a cloud project

```bash
npx supabase start
```

3. Reset DB (runs migrations + seed)

```bash
npx supabase db reset
```

4. Generate TypeScript DB types

```bash
npm run db:types
```

5. Configure environment

- Copy `.env.example` → `.env.local`
- Fill in values (for local Supabase, use `npx supabase status` to find URL/keys)

6. Run the dev server

```bash
npm run dev
```

## Notes

- Server Components are the default. Mutations go through server actions under `app/actions/*`.
- The root `middleware.ts` refreshes Supabase auth sessions and creates an anonymous session for first-time visitors.
