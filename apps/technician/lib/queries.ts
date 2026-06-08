import { useEffect, useState, useCallback } from 'react';
import type { Wash, ChecklistItem, Car, Profile, Site } from '@glint/types';
import { supabase } from './supabase';

export type Job = Wash & { car?: Car | null; customer?: Profile | null; site?: Site | null };

const ACTIVE_STATES = ['scheduled', 'en_route', 'arrived', 'in_progress'];

/** The signed-in technician's job queue + today's completed washes. */
export function useQueue() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [done, setDone] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return setLoading(false);

    const { data } = await supabase
      .from('washes')
      .select('*, car:cars(*), customer:profiles!washes_customer_id_fkey(*), site:sites(*)')
      .eq('technician_id', uid)
      .order('scheduled_for', { ascending: true });

    const all = (data ?? []) as Job[];
    setJobs(all.filter((j) => ACTIVE_STATES.includes(j.status)));
    setDone(all.filter((j) => j.status === 'done'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { jobs, done, loading, reload: load };
}

/** A single job + its 15-point checklist, for the active-job wizard. */
export function useJob(id: string | undefined) {
  const [job, setJob] = useState<Job | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    const [w, c] = await Promise.all([
      supabase.from('washes').select('*, car:cars(*), customer:profiles!washes_customer_id_fkey(*), site:sites(*)').eq('id', id).single(),
      supabase.from('wash_checklist').select('*').eq('wash_id', id).order('sort'),
    ]);
    setJob((w.data as Job) ?? null);
    setChecklist((c.data ?? []) as ChecklistItem[]);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggleItem = async (item: ChecklistItem) => {
    setChecklist((cs) => cs.map((x) => (x.id === item.id ? { ...x, checked: !x.checked } : x)));
    await supabase.from('wash_checklist').update({ checked: !item.checked }).eq('id', item.id);
  };

  const setStatus = async (status: Wash['status'], pct?: number) => {
    await supabase.from('washes').update({ status, ...(pct != null ? { pct } : {}) }).eq('id', id);
    load();
  };

  const addProof = async (label: string) => {
    await supabase.from('wash_proofs').insert({ wash_id: id, label, storage_path: `proofs/${id}/${label.toLowerCase()}.jpg` });
  };

  return { job, checklist, reload: load, toggleItem, setStatus, addProof };
}
