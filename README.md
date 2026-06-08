# Glint

App-led car wash for South African office parks and estates. Responsible, low-impact wash (controlled water, zero runoff, biodegradable products), booked and tracked from your phone — "your car is done" with photo proof, no keys needed.

Built from the Claude Design handoff (`Glint` brand bible: Carbon Black + Electric Lemon + Inter, dark mode always) and the Operational Flow.

## The four surfaces

| App | Who | Stack | Status |
|-----|-----|-------|--------|
| **Customer** | Drivers | Expo (React Native) → iOS / Android / web | ✅ Built |
| **Technician** | Washers in the bay | Expo (React Native) | ✅ Built |
| **Admin / Ops** | Ops staff & site leads | Next.js (port 3001) | ✅ Built |
| **Marketing** | Estates, office parks, drivers | Next.js (port 3000) | ✅ Built |

## Architecture

- **Backend:** Supabase (Postgres + Auth + Realtime + Storage + RLS), provisioned in the nearest EU region. See [`docs/adr/0001-database.md`](docs/adr/0001-database.md) for why (and why not `af-south-1`).
- **Monorepo:** pnpm workspaces + Turborepo.
- **Shared packages:** `@glint/design-tokens` (the brand bible, defined once), `@glint/types` (DB + domain types).
- **Booking:** WhatsApp-native (per product decision).
- **Payments:** Yoco (SA-native) — subscription debit, once-off, fleet invoicing.

```
glint/
├── apps/
│   ├── customer/      # Expo — the centerpiece (built)
│   ├── technician/    # Expo (planned)
│   ├── admin/         # Next.js (planned)
│   └── marketing/     # Next.js (planned)
├── packages/
│   ├── design-tokens/ # brand bible → JS tokens + glint.css
│   ├── mobile-ui/     # shared RN components (Icon, Card, Button, …) for both Expo apps
│   └── types/         # shared TypeScript domain types
└── supabase/
    ├── migrations/    # 0001 schema · 0002 RLS
    ├── seed.sql       # demo data mirroring the design
    └── config.toml
```

## Getting started

```bash
# 1. Install
pnpm install

# 2. Backend — local Supabase (Docker required)
pnpm db:start          # boots Postgres + Studio at http://localhost:54323
pnpm db:reset          # applies migrations + seed

# …or point at a cloud project: create one in an EU region, then:
cp .env.example .env   # fill in the project URL + anon key

# 3. Run any surface
pnpm customer          # Expo — customer app   (press i / a / w)
pnpm technician        # Expo — technician app
pnpm marketing         # Next.js marketing site  → http://localhost:3000
pnpm admin             # Next.js ops portal      → http://localhost:3001
```

**Demo logins** (all password `glint1234`):
- Customer — `thabo.m@meridian.co.za`
- Technician — `sipho.m@glint.co.za`
- Admin / Ops — `ops@glint.co.za`

## What the customer app does today

- Phone-native, full-bleed, dark-mode-always, on the brand bible.
- **Home** — greeting, the live "your car is done" hero, quick actions, subscription strip, your cars, eco impact, recent activity (all live from Supabase).
- **Live tracking** — realtime progress + timeline, technician, key mode, proof grid, star rating (writes back to DB). Updates over Supabase Realtime.
- **Book** — one-off tiers / subscription plans from the catalogue, WhatsApp-native CTA.
- **Wallet** — payment methods + invoices.
- **Profile** — plan, vehicles, sign out.

## What each surface does

- **Technician app** (`apps/technician`) — job queue + shift progress, the active-job wizard (lockbox key check-out → live 15-point checklist → four-shot photo proof → complete), today's stats, profile. All reads/writes go through Supabase against the signed-in washer's jobs.
- **Admin portal** (`apps/admin`) — Live Ops board + KPIs, Dispatch (per-site team + schedule lanes), Sites (with onboarding go-live checklist), Customer/vehicle database, Revenue (trend, mix donut, by-site, money-flow). Authenticated as an admin; data is live from Supabase.
- **Marketing site** (`apps/marketing`) — hero, two journeys, pricing (placeholders), trust, B2B "bring Glint to your building", download CTA.

## Roadmap (next)

1. ✅ All four surfaces + Supabase backend (schema, RLS, seed) + shared design system.
2. Integrations: Yoco payments, WhatsApp Business booking, push notifications, Storage upload for real proof photos.
3. Thread real pricing through seed + every surface (currently design placeholders).
4. Publish: EAS build → App Store + Google Play; deploy web apps (Vercel).
