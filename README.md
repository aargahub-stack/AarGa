# AarGa — Ecosystem Portal

Production-ready Next.js (App Router) site for aarga.org: a multi-product
SaaS ecosystem with grassroots NGO roots, now backed by a real database
(Supabase) with a static-data fallback for zero-config local development.

## Stack

- Next.js (App Router) + React 18
- Tailwind CSS (light-mode enterprise theme, glassmorphism, Bento grids)
- `next/font/google` — Urbanist (display/body) + JetBrains Mono (data/telemetry)
- **Supabase** (Postgres) as the primary data source, via `@supabase/supabase-js`
- A thin service layer (`src/lib/api/*`) that every page and API route reads
  through — swap the data source without touching a single component
- Static fallback data in `src/data/*` so the site renders correctly even
  before Supabase is configured

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + service role key
npm run dev
```

Visit `http://localhost:3000`. If you skip the `.env.local` step, the site
still works — every page falls back to the static seed data in `src/data/*`
and logs a warning in the terminal.

### Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run the entire contents of `supabase_schema.sql`
   in this repo — it creates the `projects` and `interns` tables, enables
   Row Level Security with public read policies, and inserts seed rows so
   the site populates immediately.
3. Copy `Project Settings -> API -> Project URL` into
   `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy `Project Settings -> API -> service_role` (secret) key into
   `SUPABASE_SERVICE_ROLE_KEY`. **Never** expose this key to the browser —
   it's only read inside `src/lib/supabase/server.js`, which is marked
   `import "server-only"` so a client-side import will fail the build.
5. Restart `npm run dev`. Pages now render live data from Postgres.

## Structure

```
src/
  app/
    layout.js               Root layout, fonts, header/footer
    page.js                  Home ("/") — hero, dual mission, ecosystem grid
    globals.css              Tailwind layers + matrix hero / glass utilities
    tech/page.js              "/tech" — capabilities + engineering lifecycle
    interns/page.js           "/interns" — Verified Interns registry
    api/
      projects/route.js        GET /api/projects — list all projects
      projects/[slug]/route.js GET /api/projects/:slug — single project
      interns/route.js         GET /api/interns — list + aggregate stats
  components/                Shared UI: header, footer, hero, cards
  lib/
    supabase/server.js        Server-only Supabase client (service role key)
    api/
      projects.js              Service layer for the `projects` table
      interns.js                Service layer for the `interns` table
  data/                       Static seed/fallback data (dev-only safety net)
supabase_schema.sql           Full schema + RLS policies + seed data
.env.example                  Copy to .env.local and fill in your project
```

## Founder Portal

The founder-facing admin portal now lives on its own domain
(`https://portal.aarga.org`) and is no longer part of this repo. The
"Founder Sign In" buttons in the header and footer are plain external links
(`target="_blank"`) — there is no `/portal` route, sign-in form, or
`sessionStorage` auth simulation in this project anymore.

## API routes

Three read-only REST endpoints are exposed for anything outside the Next.js
app that needs the same data (mobile app, partner integrations, etc.):

- `GET /api/projects` — all ecosystem products
- `GET /api/projects/:slug` — a single product by slug
- `GET /api/interns` — all interns + aggregate telemetry stats

All three are backed by `src/lib/api/*` and cached with `revalidate = 60`
(ISR), so Supabase is queried at most once a minute per route.

## Notes

- `src/lib/supabase/server.js` uses the **service role** key and must only
  ever run on the server. It is imported exclusively by `src/lib/api/*`,
  which in turn is imported exclusively by Server Components and Route
  Handlers — never by a `"use client"` component.
- Reduced-motion and visible keyboard focus are respected globally in
  `globals.css`.

