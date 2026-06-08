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
