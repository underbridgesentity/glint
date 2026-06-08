import { useEffect, useState, useCallback } from 'react';
import type { Car, Subscription, Wash, WashStep, Profile } from '@glint/types';
import { supabase } from './supabase';

export type HomeData = {
  profile: Profile | null;
  cars: Car[];
  subscription: Subscription | null;
  liveWash: Wash | null;
  recent: Wash[];
  eco: { litres: number; washes: number; co2: number };
};

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
    const live = all.find((w) => ['scheduled', 'en_route', 'arrived', 'in_progress'].includes(w.status)) ?? null;
    const done = all.filter((w) => w.status === 'done');
    const litres = all.reduce((s, w) => s + (w.litres_saved ?? 0), 0);

    setData({
      profile: (profile.data as Profile) ?? null,
      cars: (cars.data ?? []) as Car[],
      subscription: (subs.data as Subscription) ?? null,
      liveWash: live,
      recent: all.slice(0, 4),
      eco: { litres, washes: done.length, co2: Math.round(litres * 0.009) },
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, reload: load };
}

/** Live wash + steps, kept fresh over Supabase Realtime (the signature moment). */
export function useLiveWash(washId: string | undefined) {
  const [wash, setWash] = useState<Wash | null>(null);
  const [steps, setSteps] = useState<WashStep[]>([]);

  const load = useCallback(async () => {
    if (!washId) return;
    const [w, s] = await Promise.all([
      supabase.from('washes').select('*').eq('id', washId).single(),
      supabase.from('wash_steps').select('*').eq('wash_id', washId).order('sort'),
    ]);
    setWash((w.data as Wash) ?? null);
    setSteps((s.data ?? []) as WashStep[]);
  }, [washId]);

  useEffect(() => {
    load();
    if (!washId) return;
    const ch = supabase
      .channel(`wash:${washId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'washes', filter: `id=eq.${washId}` },
        (p) => setWash(p.new as Wash))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wash_steps', filter: `wash_id=eq.${washId}` },
        () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [washId, load]);

  return { wash, steps, reload: load };
}
