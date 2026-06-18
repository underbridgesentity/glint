-- ───────────────────────────────────────────────────────────────
-- Glint - Row Level Security
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
