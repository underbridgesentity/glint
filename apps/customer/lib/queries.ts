import { useEffect, useState, useCallback } from 'react';
import type { Car, Subscription, Wash, Profile, Site } from '@glint/types';
import { supabase } from './supabase';

export type HomeData = {
  profile: Profile | null;
  cars: Car[];
  subscription: Subscription | null;
  liveWash: Wash | null;
  recent: Wash[];
  eco: { washes: number };
};

// Statuses that mean "a wash is currently happening / pending" for the home hero.
const LIVE_STATES = ['booked', 'scheduled', 'en_route', 'arrived', 'checked_in', 'in_progress', 'ready'];

export function useHome() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return setLoading(false);

    const [profile, cars, subs, washes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).single(),
      supabase.from('cars').select('*').eq('owner_id', uid).order('is_primary', { ascending: false }),
      supabase.from('subscriptions').select('*').eq('customer_id', uid).eq('status', 'active').maybeSingle(),
      supabase.from('washes').select('*').eq('customer_id', uid).order('created_at', { ascending: false }),
    ]);

    const all = (washes.data ?? []) as Wash[];
    const live = all.find((w) => LIVE_STATES.includes(w.status)) ?? null;
    const done = all.filter((w) => w.status === 'done' || w.status === 'collected');

    setData({
      profile: (profile.data as Profile) ?? null,
      cars: (cars.data ?? []) as Car[],
      subscription: (subs.data as Subscription) ?? null,
      liveWash: live,
      recent: all.slice(0, 4),
      eco: { washes: done.length },
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, reload: load };
}

/** A single wash, kept fresh over Realtime - drives the handoff pass + live tracker. */
export function useWash(washId: string | undefined) {
  const [wash, setWash] = useState<Wash | null>(null);

  const load = useCallback(async () => {
    if (!washId) return;
    const { data } = await supabase.from('washes').select('*').eq('id', washId).single();
    setWash((data as Wash) ?? null);
  }, [washId]);

  useEffect(() => {
    load();
    if (!washId) return;
    const ch = supabase
      .channel(`wash:${washId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'washes', filter: `id=eq.${washId}` },
        (p) => setWash(p.new as Wash))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [washId, load]);

  return { wash, reload: load };
}

// ── Booking ───────────────────────────────────────────────────
export type BookingCtx = { site: Site | null; cars: Car[]; subscription: Subscription | null };

export async function fetchBookingCtx(): Promise<BookingCtx> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { site: null, cars: [], subscription: null };
  const { data: profile } = await supabase.from('profiles').select('site_id').eq('id', uid).single();
  const [site, cars, sub] = await Promise.all([
    profile?.site_id ? supabase.from('sites').select('*').eq('id', profile.site_id).single() : Promise.resolve({ data: null }),
    supabase.from('cars').select('*').eq('owner_id', uid).order('is_primary', { ascending: false }),
    supabase.from('subscriptions').select('*').eq('customer_id', uid).eq('status', 'active').maybeSingle(),
  ]);
  return { site: (site.data as Site) ?? null, cars: (cars.data ?? []) as Car[], subscription: (sub.data as Subscription) ?? null };
}

/** Slot load for a site/day via a privacy-safe RPC (no other customers' data). */
export async function fetchDayLoad(siteId: string, dayStartISO: string, dayEndISO: string) {
  const { data } = await supabase.rpc('site_day_load', { p_site: siteId, p_from: dayStartISO, p_to: dayEndISO });
  return (data ?? []) as string[];
}

export async function createBooking(input: {
  carId: string; siteId: string; tier: string; priceCents: number;
  keyMode: 'no_key' | 'lockbox'; slotISO: string; isSubscription: boolean;
}): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from('washes')
    .insert({
      customer_id: uid, car_id: input.carId, site_id: input.siteId, tier: input.tier,
      status: 'booked', key_mode: input.keyMode, scheduled_for: input.slotISO,
      price_cents: input.priceCents, is_subscription: input.isSubscription,
    })
    .select('id')
    .single();
  if (error) { console.warn('[glint] booking failed', error.message); return null; }
  return data?.id ?? null;
}
