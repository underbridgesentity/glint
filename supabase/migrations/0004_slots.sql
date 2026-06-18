-- ───────────────────────────────────────────────────────────────
-- 0004 - Station capacity + operating window for slot booking
-- Availability is derived: capacity − (active bookings overlapping a slot).
-- ───────────────────────────────────────────────────────────────
alter table sites add column if not exists capacity     int  not null default 2;   -- concurrent bays
alter table sites add column if not exists slot_minutes int  not null default 30;
alter table sites add column if not exists open_time    text not null default '08:00';
alter table sites add column if not exists close_time   text not null default '16:00';
