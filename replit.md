# undivisible.dev — Replit Workspace

## Overview

pnpm workspace monorepo using TypeScript. Personal portfolio site for Max Carter (undivisible.dev), migrated from Next.js to Vite + React.

## Artifacts

### `artifacts/undivisible` — Main Portfolio Site
- **Framework**: Vite + React + TypeScript
- **Routing**: Wouter (client-side, two routes)
- **Styling**: Tailwind CSS v4
- **Port**: `$PORT` (env var, assigned 19669 in dev)
- **Preview path**: `/`

#### Routes
- `/` — Home page: ASCII art, WebGL shader background, Hong Kong day/weather theme, LastFM now-playing integration, live clocks (HKG/MEL/NOC)
- `/brief` — Portfolio/resume page with desktop scroll view, mobile layout, and print-ready 3-page PDF

#### Key source files
```
src/
  App.tsx                         — Wouter router (/, /brief, 404)
  main.tsx                        — React root
  index.css                       — Tailwind + fonts + print/screen media
  pages/
    home.tsx                      — Home page
    brief.tsx                     — Brief page (desktop + mobile + print)
    not-found.tsx                 — 404 page
  components/
    Ascii.tsx                     — ASCII art canvas renderer
    Info.tsx                      — Left-panel info (clocks, weather, links)
    Light.tsx                     — WebGL shader wrapper
    randomized-text.tsx           — Animated randomized text component
    brief/
      desktop/                    — Desktop scrolljack portfolio view
        DesktopRoot.tsx
        Background.tsx            — WebGL fingerprint background
        NavDots.tsx
        sections/                 — HeroSection, ServicesSection, CasesSection, ProjectsSection
      mobile/
        MobileRoot.tsx            — Mobile portfolio layout
      print/
        PrintRoot.tsx             — Print layout wrapper
        Page1.tsx                 — Services overview (cream bg)
        Page2.tsx                 — Case studies (dark bg)
        Page3.tsx                 — Open source projects (cream bg)
      ui/
        constants.ts              — Color palette, font vars
        Ft.tsx, Rule.tsx, Tb.tsx  — Print UI helpers
  lib/
    useHongKongDayTheme.ts        — Hong Kong time/solar/weather theme hook
    useLastFmVisualData.ts        — LastFM API hook (needs VITE_LASTFM_API_KEY)
    utils.ts                      — cn() helper
  app/                            — Legacy Next.js files (not used by Vite, safe to ignore)
```

#### Environment variables
- `VITE_LASTFM_API_KEY` — optional; LastFM API key for now-playing track display. App works without it (shows no track).
- `PORT` — required by Vite config (set automatically by Replit)
- `BASE_PATH` — required by Vite config (set automatically by Replit)

### `artifacts/api-server` — API Server
- **Framework**: Express 5 + Drizzle ORM + PostgreSQL
- **Port**: 8080

### `artifacts/mockup-sandbox` — Canvas Component Preview Server
- **Framework**: Vite
- **Port**: 8081

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/undivisible run dev` — run portfolio site locally
