# AarGa — Ecosystem Portal

Production-ready Next.js (App Router) starter for aarga.org: a multi-product
SaaS ecosystem with grassroots NGO roots.

## Stack

- Next.js 14 (App Router) + React 18
- Tailwind CSS (light-mode enterprise theme, glassmorphism, Bento grids)
- `next/font/google` — Urbanist (display/body) + JetBrains Mono (data/telemetry)
- Mock "database" layer in `src/data/*` — swap for real queries without
  touching any component

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Structure

```
src/
  app/
    layout.js            Root layout, fonts, header/footer
    page.js               Home ("/") — hero, dual mission, ecosystem grid
    globals.css           Tailwind layers + matrix hero / glass utilities
    tech/page.js           "/tech" — capabilities + engineering lifecycle
    interns/page.js        "/interns" — Verified Interns registry
    portal/page.js          "/portal" — simulated founder sign-in
    portal/dashboard/
      layout.js             Client-side auth guard + sidebar shell
      page.js                Dashboard skeleton
  components/              Shared UI: header, footer, hero, cards, sidebar
  data/                     Mock DB tables: tools, lifecycle, interns
  lib/auth.js               Simulated session helper (sessionStorage)
```

## Notes

- The Founder Portal auth is a client-side simulation (`sessionStorage`) to
  demonstrate the protected-route pattern. Replace `src/lib/auth.js` with a
  real provider (NextAuth, Clerk, custom JWT/session cookie validated on the
  server) before shipping.
- All ecosystem, lifecycle, and intern data is served from plain JS modules
  in `src/data/`. Each module's shape mirrors what a real DB query would
  return, so swapping in Prisma/Drizzle/REST calls requires no changes to
  the components that consume them.
- Reduced-motion and visible keyboard focus are respected globally in
  `globals.css`.
