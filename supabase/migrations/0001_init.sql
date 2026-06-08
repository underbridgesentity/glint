-- ───────────────────────────────────────────────────────────────
-- Glint — initial schema
-- Grounded in the Operational Flow: residential + office-park journeys,
-- sites as embedded micro-businesses, live washes with proof, key mgmt.
-- Money stored as integer cents (ZAR).
-- ───────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Enums ──────────────────────────────────────────────────────
create type user_role     as enum ('customer', 'technician', 'site_lead', 'admin');
create type site_type     as enum ('office_park', 'residential');
create type site_status   as enum ('live', 'onboarding', 'paused');
create type wash_status   as enum ('scheduled', 'en_route', 'arrived', 'in_progress', 'done', 'cancelled');
create type key_mode      as enum ('no_key', 'lockbox');
create type tech_status   as enum ('available', 'washing', 'break', 'offline');
create type academy_stage as enum ('week_1', 'week_2', 'certified');
create type invoice_status as enum ('paid', 'due', 'overdue');
create type plan_period   as enum ('mo', 'wk');

-- ── Sites (office parks & estates) ─────────────────────────────
create table sites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        site_type not null,
  area        text not null,
  bays        text,
  hours       text,
  target      int not null default 30,        -- target washes/day
  status      site_status not null default 'onboarding',
  lead_id     uuid,                            -- → profiles.id (set after team exists)
  created_at  timestamptz not null default now()
);

-- ── Profiles (1:1 with auth.users) ─────────────────────────────
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         user_role not null default 'customer',
  first_name   text,
  full_name    text,
  phone        text,
  email        text,
  member_since date default current_date,
  site_id      uuid references sites (id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table sites add constraint sites_lead_fk
  foreign key (lead_id) references profiles (id) on delete set null;

-- ── Technician profile (extra fields for washers/site leads) ───
create table technician_profiles (
  profile_id   uuid primary key references profiles (id) on delete cascade,
  site_id      uuid references sites (id) on delete set null,
  rating       numeric(2,1) default 5.0,
  status       tech_status not null default 'offline',
  academy      academy_stage not null default 'week_1',
  washes_today int not null default 0
);

-- ── Cars ───────────────────────────────────────────────────────
create table cars (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references profiles (id) on delete cascade,
  make       text not null,
  model      text not null,
  trim       text,
  color      text,
  plate      text,
  tone       text default '#c5c8cd',           -- glyph colour
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── One-off service tiers (catalogue) ──────────────────────────
create table service_tiers (
  id          text primary key,                 -- 'express' | 'full' | 'premium'
  name        text not null,
  price_cents int not null,
  mins        int not null,
  description text,
  includes    jsonb not null default '[]',
  popular     boolean not null default false,
  sort        int not null default 0
);

-- ── Subscription plans (catalogue) ─────────────────────────────
create table plans (
  id           text primary key,                -- 'basic' | 'premium'
  name         text not null,
  price_cents  int not null,
  period       plan_period not null default 'mo',
  washes_label text,
  description  text,
  includes     jsonb not null default '[]',
  popular      boolean not null default false,
  sort         int not null default 0
);

-- ── Active subscriptions ───────────────────────────────────────
create table subscriptions (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references profiles (id) on delete cascade,
  plan_id      text not null references plans (id),
  car_id       uuid references cars (id) on delete set null,
  days         text[] not null default '{}',    -- ['Tue','Fri']
  status       text not null default 'active',   -- active | paused | cancelled
  price_cents  int not null,
  billing_card text,
  next_billing date,
  created_at   timestamptz not null default now()
);

-- ── Washes (the core operational record) ───────────────────────
create table washes (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references profiles (id) on delete cascade,
  car_id          uuid references cars (id) on delete set null,
  site_id         uuid references sites (id) on delete set null,
  technician_id   uuid references profiles (id) on delete set null,
  tier            text not null,                 -- 'Express' | 'Full' | 'Premium'
  status          wash_status not null default 'scheduled',
  key_mode        key_mode not null default 'no_key',
  scheduled_for   timestamptz,
  started_at      timestamptz,
  eta_done        timestamptz,
  pct             int not null default 0,
  rating          int,                           -- 1..5
  litres_saved    int default 0,
  price_cents     int not null default 0,        -- 0 when covered by subscription
  is_subscription boolean not null default false,
  created_at      timestamptz not null default now()
);

create index washes_customer_idx on washes (customer_id);
create index washes_site_status_idx on washes (site_id, status);
create index washes_tech_idx on washes (technician_id);

-- ── Wash timeline steps (drives the live tracker) ──────────────
create table wash_steps (
  id       uuid primary key default gen_random_uuid(),
  wash_id  uuid not null references washes (id) on delete cascade,
  key      text not null,                        -- scheduled|arrived|in_progress|done
  label    text not null,
  sub      text,
  at_label text,                                 -- display time e.g. '11:06'
  done     boolean not null default false,
  active   boolean not null default false,
  sort     int not null default 0
);

-- ── QA checklist (15-point) ────────────────────────────────────
create table wash_checklist (
  id       uuid primary key default gen_random_uuid(),
  wash_id  uuid not null references washes (id) on delete cascade,
  item     text not null,
  checked  boolean not null default false,
  sort     int not null default 0
);

-- ── Proof photos (Storage paths) ───────────────────────────────
create table wash_proofs (
  id           uuid primary key default gen_random_uuid(),
  wash_id      uuid not null references washes (id) on delete cascade,
  label        text not null,                    -- Before | After | Interior | Wheels
  storage_path text not null,
  created_at   timestamptz not null default now()
);

-- ── Payment methods ────────────────────────────────────────────
create table payment_methods (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles (id) on delete cascade,
  brand       text not null,
  last4       text not null,
  exp         text,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Invoices ───────────────────────────────────────────────────
create table invoices (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references profiles (id) on delete cascade,
  ref          text not null,
  label        text not null,
  amount_cents int not null,
  status       invoice_status not null default 'paid',
  issued_on    date not null default current_date,
  wash_id      uuid references washes (id) on delete set null
);

-- ── updated/seed-friendly: keep profile in sync with auth.users ─
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, phone, email, full_name, first_name)
  values (
    new.id,
    'customer',
    new.phone,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
