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
-- ───────────────────────────────────────────────────────────────
-- Glint — Row Level Security
-- Customers see only their own data. Technicians/site leads see their
-- site's washes. Admins see everything. Catalogues are public-read.
-- ───────────────────────────────────────────────────────────────

-- Helper: current user's role (security definer to read profiles safely)
create or replace function auth_role()
returns user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function auth_site()
returns uuid
language sql stable security definer set search_path = public
as $$ select site_id from public.profiles where id = auth.uid() $$;

create or replace function is_staff()
returns boolean
language sql stable
as $$ select auth_role() in ('technician', 'site_lead', 'admin') $$;

create or replace function is_admin()
returns boolean
language sql stable
as $$ select auth_role() = 'admin' $$;

-- Enable RLS everywhere
alter table profiles            enable row level security;
alter table technician_profiles enable row level security;
alter table sites               enable row level security;
alter table cars                enable row level security;
alter table service_tiers       enable row level security;
alter table plans               enable row level security;
alter table subscriptions       enable row level security;
alter table washes              enable row level security;
alter table wash_steps          enable row level security;
alter table wash_checklist      enable row level security;
alter table wash_proofs         enable row level security;
alter table payment_methods     enable row level security;
alter table invoices            enable row level security;

-- ── Catalogues: readable by any authenticated user ─────────────
create policy "tiers readable" on service_tiers for select to authenticated using (true);
create policy "plans readable" on plans for select to authenticated using (true);
create policy "tiers admin write" on service_tiers for all to authenticated using (is_admin()) with check (is_admin());
create policy "plans admin write" on plans for all to authenticated using (is_admin()) with check (is_admin());

-- ── Profiles ───────────────────────────────────────────────────
create policy "own profile read"  on profiles for select to authenticated
  using (id = auth.uid() or is_staff());
create policy "own profile write" on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "admin profile all" on profiles for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── Technician profiles ────────────────────────────────────────
create policy "tech read" on technician_profiles for select to authenticated
  using (profile_id = auth.uid() or is_staff());
create policy "tech admin write" on technician_profiles for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── Sites: staff read; admin write ─────────────────────────────
create policy "sites staff read" on sites for select to authenticated
  using (is_staff());
create policy "sites admin write" on sites for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── Cars: owner CRUD; staff read ───────────────────────────────
create policy "cars owner all" on cars for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "cars staff read" on cars for select to authenticated
  using (is_staff());

-- ── Subscriptions: owner CRUD; admin read ──────────────────────
create policy "subs owner all" on subscriptions for all to authenticated
  using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "subs admin read" on subscriptions for select to authenticated
  using (is_admin());

-- ── Washes: customer owns; site staff sees own site; admin all ─
create policy "washes customer read" on washes for select to authenticated
  using (customer_id = auth.uid());
create policy "washes customer create" on washes for insert to authenticated
  with check (customer_id = auth.uid());
create policy "washes site staff read" on washes for select to authenticated
  using (is_staff() and (is_admin() or site_id = auth_site()));
create policy "washes site staff update" on washes for update to authenticated
  using (is_staff() and (is_admin() or site_id = auth_site()))
  with check (is_staff());

-- ── Wash children (steps/checklist/proofs): follow the wash ────
create policy "steps read" on wash_steps for select to authenticated
  using (exists (select 1 from washes w where w.id = wash_id
    and (w.customer_id = auth.uid() or (is_staff() and (is_admin() or w.site_id = auth_site())))));
create policy "steps staff write" on wash_steps for all to authenticated
  using (is_staff()) with check (is_staff());

create policy "checklist read" on wash_checklist for select to authenticated
  using (exists (select 1 from washes w where w.id = wash_id
    and (w.customer_id = auth.uid() or (is_staff() and (is_admin() or w.site_id = auth_site())))));
create policy "checklist staff write" on wash_checklist for all to authenticated
  using (is_staff()) with check (is_staff());

create policy "proofs read" on wash_proofs for select to authenticated
  using (exists (select 1 from washes w where w.id = wash_id
    and (w.customer_id = auth.uid() or (is_staff() and (is_admin() or w.site_id = auth_site())))));
create policy "proofs staff write" on wash_proofs for all to authenticated
  using (is_staff()) with check (is_staff());

-- ── Payment methods & invoices: owner; admin read ──────────────
create policy "pm owner all" on payment_methods for all to authenticated
  using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "pm admin read" on payment_methods for select to authenticated
  using (is_admin());

create policy "inv owner read" on invoices for select to authenticated
  using (customer_id = auth.uid() or is_admin());
create policy "inv admin write" on invoices for all to authenticated
  using (is_admin()) with check (is_admin());
-- ───────────────────────────────────────────────────────────────
-- Glint — seed data (dev). Mirrors the design's mock data so every
-- surface shows real content the moment you run `supabase db reset`.
-- Money is integer cents (ZAR): R450 -> 45000.
-- ───────────────────────────────────────────────────────────────

-- ── Catalogue: one-off service tiers ───────────────────────────
insert into service_tiers (id, name, price_cents, mins, description, includes, popular, sort) values
  ('express', 'Express', 9900,  25, 'Exterior wash. Wheels and glass.',
    '["Exterior body wash","Wheel faces + tyres","All glass","Quick dry buff"]', false, 0),
  ('full', 'Full', 19900, 45, 'Interior and exterior. The everyday standard.',
    '["Everything in Express","Interior vacuum","Dash + console wipe","Door jambs","Mats shaken + cleaned"]', true, 1),
  ('premium', 'Premium', 29900, 75, 'Full detail. Paint protected, interior dressed.',
    '["Everything in Full","Spray sealant + gloss","Leather conditioner","Interior fragrance","Tyre dressing"]', false, 2);

-- ── Catalogue: subscription plans ──────────────────────────────
insert into plans (id, name, price_cents, period, washes_label, description, includes, popular, sort) values
  ('basic', 'Basic', 45000, 'mo', '4 washes / month', 'Exterior wash, weekly.',
    '["1 Express wash per week","Same wash days each week","Pause anytime","No keys needed"]', false, 0),
  ('premium', 'Premium', 75000, 'mo', '8 washes / month', 'Full interior + exterior, twice weekly.',
    '["2 Full washes per week","Monthly Premium detail","Priority morning slots","Free re-wash guarantee"]', true, 1);

-- ── Sites ──────────────────────────────────────────────────────
insert into sites (id, name, type, area, bays, hours, target, status) values
  ('11111111-1111-1111-1111-111111111111', 'Katherine & West', 'office_park', 'Sandton',   'B2 · Level 1',      '09:00 – 15:00', 38, 'live'),
  ('22222222-2222-2222-2222-222222222222', 'Waterfall Corner', 'office_park', 'Midrand',    'P1 East',           '09:00 – 15:00', 32, 'live'),
  ('33333333-3333-3333-3333-333333333333', 'The Polofields',   'residential', 'Waterfall',  'Visitor 3-4',       '07:00 – 16:00', 40, 'live'),
  ('44444444-4444-4444-4444-444444444444', 'Melrose Arch',     'office_park', 'Melrose',    'Hong Kong Lvl 2',   '09:00 – 15:00', 24, 'live'),
  ('55555555-5555-5555-5555-555555555555', 'Steyn City',       'residential', 'Fourways',   'Clubhouse',         '—',             36, 'onboarding');

-- ── Demo auth users (DEV ONLY) ─────────────────────────────────
-- Password for all demo accounts: "glint1234"
-- The on_auth_user_created trigger creates matching profiles automatically.
do $$
declare
  thabo uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  sipho uuid := 'bbbbbbbb-0000-0000-0000-000000000002';
  admin uuid := 'cccccccc-0000-0000-0000-000000000003';
  pw text := crypt('glint1234', gen_salt('bf'));
begin
  insert into auth.users (instance_id, id, aud, role, email, phone, encrypted_password,
      email_confirmed_at, phone_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data)
  values
    ('00000000-0000-0000-0000-000000000000', thabo, 'authenticated', 'authenticated',
      'thabo.m@meridian.co.za', '+27825510192', pw, now(), now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Thabo Mokoena","first_name":"Thabo"}'),
    ('00000000-0000-0000-0000-000000000000', sipho, 'authenticated', 'authenticated',
      'sipho.m@glint.co.za', '+27820000114', pw, now(), now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Sipho Mokwena","first_name":"Sipho"}'),
    ('00000000-0000-0000-0000-000000000000', admin, 'authenticated', 'authenticated',
      'ops@glint.co.za', '+27820000001', pw, now(), now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Glint Ops","first_name":"Ops"}')
  on conflict (id) do nothing;

  -- GoTrue cannot scan NULL token columns on login ("Database error querying
  -- schema"); manually-seeded users need empty-string defaults.
  update auth.users set
    confirmation_token = '', recovery_token = '', email_change = '',
    email_change_token_new = '', email_change_token_current = '',
    phone_change = '', phone_change_token = '', reauthentication_token = ''
  where id in (thabo, sipho, admin);

  -- Promote roles + assign sites
  update profiles set role = 'customer', site_id = '11111111-1111-1111-1111-111111111111',
    member_since = date '2025-08-01' where id = thabo;
  update profiles set role = 'technician', site_id = '11111111-1111-1111-1111-111111111111' where id = sipho;
  update profiles set role = 'admin' where id = admin;

  insert into technician_profiles (profile_id, site_id, rating, status, academy, washes_today)
  values (sipho, '11111111-1111-1111-1111-111111111111', 4.9, 'washing', 'certified', 7)
  on conflict (profile_id) do nothing;

  update sites set lead_id = sipho where id = '11111111-1111-1111-1111-111111111111';

  -- Thabo's cars
  insert into cars (id, owner_id, make, model, trim, color, plate, tone, is_primary) values
    ('dddddddd-0000-0000-0000-000000000001', thabo, 'BMW', '3 Series', '320i', 'Glacier Silver', 'CA 481-220', '#c5c8cd', true),
    ('dddddddd-0000-0000-0000-000000000002', thabo, 'Volkswagen', 'Polo', 'GTI', 'Deep Black', 'CA 119-887', '#202225', false)
  on conflict (id) do nothing;

  -- Active subscription
  insert into subscriptions (customer_id, plan_id, car_id, days, price_cents, billing_card, next_billing)
  values (thabo, 'premium', 'dddddddd-0000-0000-0000-000000000001', array['Tue','Fri'], 75000, 'Visa ·· 4471', date '2026-04-01');

  -- Payment methods
  insert into payment_methods (customer_id, brand, last4, exp, is_primary) values
    (thabo, 'Visa', '4471', '08/27', true),
    (thabo, 'Mastercard', '2208', '11/26', false);

  -- Invoices
  insert into invoices (customer_id, ref, label, amount_cents, status, issued_on) values
    (thabo, 'INV-2026-03', 'Premium subscription', 75000, 'paid', date '2026-03-01'),
    (thabo, 'INV-2026-02', 'Premium subscription', 75000, 'paid', date '2026-02-01'),
    (thabo, 'INV-OFF-118', 'Express wash — VW Polo', 9900, 'paid', date '2026-02-18'),
    (thabo, 'INV-2026-01', 'Premium subscription', 75000, 'paid', date '2026-01-01');

  -- Live wash in progress (the signature moment)
  insert into washes (id, customer_id, car_id, site_id, technician_id, tier, status, key_mode,
      scheduled_for, started_at, eta_done, pct, litres_saved, is_subscription, price_cents)
  values ('eeeeeeee-0000-0000-0000-000000000001', thabo,
      'dddddddd-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', sipho,
      'Full', 'in_progress', 'no_key',
      now() - interval '6 minutes', now() - interval '6 minutes', now() + interval '39 minutes',
      64, 280, true, 0);

  insert into wash_steps (wash_id, key, label, sub, at_label, done, active, sort) values
    ('eeeeeeee-0000-0000-0000-000000000001', 'scheduled',   'Scheduled',            'Today · 11:00',               '08:30', true,  false, 0),
    ('eeeeeeee-0000-0000-0000-000000000001', 'arrived',     'Team at your car',     'Bay B2 · Level 1',            '11:06', true,  false, 1),
    ('eeeeeeee-0000-0000-0000-000000000001', 'in_progress', 'Wash in progress',     'Full · interior + exterior',  '11:06', false, true,  2),
    ('eeeeeeee-0000-0000-0000-000000000001', 'done',        'Clean. You weren''t there.', 'Proof photos attached', '~11:51', false, false, 3);

  -- 15-point QA checklist for the live wash
  insert into wash_checklist (wash_id, item, sort) values
    ('eeeeeeee-0000-0000-0000-000000000001', 'Pre-rinse inspection', 0),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Body wash — panels', 1),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Wheel faces + tyres', 2),
    ('eeeeeeee-0000-0000-0000-000000000001', 'All glass — exterior', 3),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Door jambs', 4),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Mirrors + handles', 5),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Interior vacuum — front', 6),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Interior vacuum — rear + boot', 7),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Dash + console wipe', 8),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Door cards + sills', 9),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Glass — interior', 10),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Mats shaken + cleaned', 11),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Final dry buff', 12),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Tyre dressing', 13),
    ('eeeeeeee-0000-0000-0000-000000000001', 'Site-lead QA sign-off', 14);

  -- Past activity
  insert into washes (customer_id, car_id, site_id, technician_id, tier, status, key_mode,
      scheduled_for, eta_done, pct, rating, litres_saved, is_subscription, price_cents) values
    (thabo, 'dddddddd-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', sipho, 'Full',    'done', 'no_key', now() - interval '4 days', now() - interval '4 days', 100, 5, 290, true,  0),
    (thabo, 'dddddddd-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', sipho, 'Full',    'done', 'no_key', now() - interval '7 days', now() - interval '7 days', 100, 5, 285, true,  0),
    (thabo, 'dddddddd-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', sipho, 'Express', 'done', 'lockbox', now() - interval '14 days', now() - interval '14 days', 100, 5, 240, false, 9900);
end $$;
