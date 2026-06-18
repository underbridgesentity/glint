-- ───────────────────────────────────────────────────────────────
-- 0005 - Let customers read sites (for booking) + privacy-safe slot load
-- ───────────────────────────────────────────────────────────────

-- Sites are locations, not sensitive - any signed-in user may read them
-- (needed for the booking slot picker: hours, capacity, name).
create policy "sites readable by authenticated" on sites
  for select to authenticated using (true);

-- Slot availability without exposing other customers' bookings:
-- returns only the booked times (no PII), bypassing RLS as definer.
create or replace function site_day_load(p_site uuid, p_from timestamptz, p_to timestamptz)
returns setof timestamptz
language sql stable security definer set search_path = public as $$
  select scheduled_for from washes
  where site_id = p_site
    and status in ('booked','scheduled','checked_in','in_progress')
    and scheduled_for >= p_from and scheduled_for < p_to;
$$;
grant execute on function site_day_load(uuid, timestamptz, timestamptz) to authenticated;
