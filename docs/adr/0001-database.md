# ADR 0001 — Database & backend platform

**Status:** Accepted · 2026-06-08

## Context

Glint is a South African, app-first platform (customer + technician mobile apps, admin
portal, marketing site). It needs: Postgres, auth with roles, file storage (proof photos),
realtime (the live wash board), and multi-tenant access control across sites/roles.

The question raised: **Supabase or AWS Cape Town (`af-south-1`)?**

## Key findings

- **Supabase does NOT offer an `af-south-1` (Cape Town) region.** Verified 2026-06-08 —
  long-standing community requests exist but Supabase has not made a South African region
  available. So "Supabase in Cape Town" is not currently an option.
- **POPIA does not mandate local data residency.** Cross-border transfer is lawful where
  the destination has comparable protection (EU/GDPR qualifies) or with the data subject's
  consent. So an EU-hosted managed database is compliant with proper handling.
- **Postgres is portable.** Whatever we pick, the data layer moves with `pg_dump` — no
  schema rewrite to migrate later.

## Options considered

| Option | Latency to Joburg | Data in SA | Build/ops effort |
|--------|------------------|-----------|------------------|
| **Managed Supabase (EU region)** | ~150–180ms | No (EU) | Lowest |
| AWS `af-south-1` native (RDS+Cognito+S3+AppSync) | ~10–20ms | Yes | Highest |
| Self-hosted Supabase on `af-south-1` | ~10–20ms | Yes | Medium |

## Decision

**Managed Supabase, provisioned in the nearest EU region** (eu-west-2 London /
eu-west-1 Ireland / eu-central-1 Frankfurt — pick lowest measured ping).

Chosen for time-to-market: Supabase collapses auth, realtime, storage, and row-level
security into one managed service, and ~150ms latency is fine for a booking/ops app.

## Consequences

- Fast to build; one backend serves all four surfaces.
- EU residency — acceptable under POPIA with user consent at signup.
- **Revisit when:** a customer/regulatory requirement demands SA residency, scale
  justifies dedicated infra, **or** Supabase ships `af-south-1`. Migration path is
  `pg_dump` → self-hosted Supabase or RDS in Cape Town.
