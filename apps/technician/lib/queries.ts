import { useEffect, useState, useCallback } from 'react';
import type { Wash, ChecklistItem, Car, Profile, Site } from '@glint/types';
import { supabase } from './supabase';

export type Job = Wash & { car?: Car | null; customer?: Profile | null; site?: Site | null };

const SELECT = '*, car:cars(*), customer:profiles!washes_customer_id_fkey(*), site:sites(*)';
const ACTIVE = ['booked', 'scheduled', 'checked_in', 'in_progress', 'ready'];

const CHECKLIST_TEMPLATE = [
  'Pre-wash inspection', 'Wheels + tyres', 'Exterior panels', 'All glass',
  'Interior vacuum', 'Dash + console', 'Final dry buff', 'Site-lead QA sign-off',
];

async function mySiteId(): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from('profiles').select('site_id').eq('id', auth.user.id).single();
  return data?.site_id ?? null;
}

/** The technician's whole-site board, grouped by handoff stage. */
export function useQueue() {
  const [toCheckIn, setToCheckIn] = useState<Job[]>([]);
  const [working, setWorking] = useState<Job[]>([]);
  const [toCollect, setToCollect] = useState<Job[]>([]);
  const [done, setDone] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const site = await mySiteId();
    if (!site) return setLoading(false);
    const { data } = await supabase.from('washes').select(SELECT).eq('site_id', site).order('scheduled_for', { ascending: true });
    const all = (data ?? []) as Job[];
    setToCheckIn(all.filter((j) => j.status === 'booked' || j.status === 'scheduled'));
    setWorking(all.filter((j) => j.status === 'checked_in' || j.status === 'in_progress'));
    setToCollect(all.filter((j) => j.status === 'ready'));
    setDone(all.filter((j) => j.status === 'collected' || j.status === 'done'));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase.channel('site-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'washes' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  return { toCheckIn, working, toCollect, done, loading, reload: load };
}

export function useJob(id: string | undefined) {
  const [job, setJob] = useState<Job | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    const [w, c] = await Promise.all([
      supabase.from('washes').select(SELECT).eq('id', id).single(),
      supabase.from('wash_checklist').select('*').eq('wash_id', id).order('sort'),
    ]);
    setJob((w.data as Job) ?? null);
    setChecklist((c.data ?? []) as ChecklistItem[]);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const me = async () => (await supabase.auth.getUser()).data.user?.id ?? null;

  /** Verify the drop-off code, check the car in, seed the checklist, start the wash. */
  const checkIn = async (enteredCode: string): Promise<boolean> => {
    if (!job) return false;
    if ((enteredCode || '').trim() !== (job.drop_off_code ?? '')) return false;
    if (checklist.length === 0) {
      await supabase.from('wash_checklist').insert(CHECKLIST_TEMPLATE.map((item, sort) => ({ wash_id: id, item, sort })));
    }
    await supabase.from('washes').update({ status: 'in_progress', checked_in_at: new Date().toISOString(), checked_in_by: await me(), pct: 10 }).eq('id', id);
    await load();
    return true;
  };

  const toggleItem = async (item: ChecklistItem) => {
    setChecklist((cs) => cs.map((x) => (x.id === item.id ? { ...x, checked: !x.checked } : x)));
    await supabase.from('wash_checklist').update({ checked: !item.checked }).eq('id', item.id);
  };

  const addProof = async (label: string, phase: 'pre' | 'post') => {
    await supabase.from('wash_proofs').insert({ wash_id: id, label, phase, storage_path: `proofs/${id}/${phase}-${label.toLowerCase()}.jpg` });
  };

  const markReady = async () => { await supabase.from('washes').update({ status: 'ready', ready_at: new Date().toISOString(), pct: 100 }).eq('id', id); await load(); };

  /** Verify the collection code and release the car. */
  const release = async (enteredCode: string): Promise<boolean> => {
    if (!job) return false;
    if ((enteredCode || '').trim() !== (job.collection_code ?? '')) return false;
    await supabase.from('washes').update({ status: 'collected', collected_at: new Date().toISOString(), released_by: await me() }).eq('id', id);
    await load();
    return true;
  };

  return { job, checklist, reload: load, checkIn, toggleItem, addProof, markReady, release };
}
