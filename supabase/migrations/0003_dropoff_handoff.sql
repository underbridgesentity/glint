-- ───────────────────────────────────────────────────────────────
-- 0003 - Demarcated drop-off station model + secure code handoff
-- New lifecycle: booked → checked_in → in_progress → ready → collected
-- Non-breaking: old statuses kept; status moved enum→text+check so new
-- states can be added without enum-in-transaction headaches.
-- ───────────────────────────────────────────────────────────────

-- ── Wash lifecycle: enum → text + check constraint ──
alter table washes alter column status drop default;
alter table washes alter column status type text using status::text;
alter table washes alter column status set default 'booked';
alter table washes add constraint washes_status_chk
  check (status in (
    'booked','scheduled','en_route','arrived','checked_in',
    'in_progress','ready','done','collected','cancelled'
  ));

-- ── Site service mode (we run drop-off stations; 'roving' kept for future hybrid) ──
do $$ begin
  create type service_mode as enum ('station', 'roving');
exception when duplicate_object then null; end $$;
alter table sites add column if not exists service_mode service_mode not null default 'station';

-- ── Secure handoff: per-wash codes + custody timestamps ──
alter table washes add column if not exists drop_off_code   text;  -- shown by customer / verified at check-in
alter table washes add column if not exists collection_code text;  -- shown by customer / verified at release
alter table washes add column if not exists checked_in_at   timestamptz;
alter table washes add column if not exists ready_at        timestamptz;
alter table washes add column if not exists collected_at    timestamptz;
alter table washes add column if not exists checked_in_by   uuid references profiles (id) on delete set null;
alter table washes add column if not exists released_by     uuid references profiles (id) on delete set null;
alter table washes add column if not exists bay_label       text;  -- station bay assigned at check-in

-- ── Inspection: pre/post phase + free-text note on proof photos ──
do $$ begin
  create type proof_phase as enum ('pre', 'post', 'progress');
exception when duplicate_object then null; end $$;
alter table wash_proofs add column if not exists phase proof_phase not null default 'post';
alter table wash_proofs add column if not exists note  text;

-- ── 4-digit handoff code generator ──
create or replace function gen_handoff_code()
returns text language sql volatile as $$
  select lpad((floor(random() * 10000))::int::text, 4, '0')
$$;

-- Default new washes to a generated collection code.
alter table washes alter column collection_code set default gen_handoff_code();
alter table washes alter column drop_off_code   set default gen_handoff_code();
