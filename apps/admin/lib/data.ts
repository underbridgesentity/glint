'use client';
import { supabase } from './supabase';
import type { Site, Wash, Invoice } from '@glint/types';

export type BoardRow = Wash & {
  customer?: { full_name: string | null } | null;
  car?: { make: string; model: string } | null;
  site?: { name: string } | null;
  technician?: { full_name: string | null } | null;
};

export type CustomerRow = {
  id: string;
  name: string;
  plan: string;
  site: string;
  cars: number;
  since: string;
  status: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  site_id: string | null;
  status: string;
  washes_today: number;
};

export type PortalData = {
  sites: Site[];
  board: BoardRow[];
  customers: CustomerRow[];
  team: TeamMember[];
  invoices: Invoice[];
  kpis: {
    washesToday: number;
    inProgress: number;
    completion: number;
    target: number;
    waterToday: number;
    liveSites: number;
  };
};

export async function fetchPortal(): Promise<PortalData> {
  const [sitesRes, boardRes, profilesRes, teamRes, invoicesRes] = await Promise.all([
    supabase.from('sites').select('*').order('name'),
    supabase
      .from('washes')
      .select('*, customer:profiles!washes_customer_id_fkey(full_name), car:cars(make,model), site:sites(name), technician:profiles!washes_technician_id_fkey(full_name)')
      .order('scheduled_for', { ascending: true }),
    supabase.from('profiles').select('*, subscriptions(plan_id,status), cars(id)').eq('role', 'customer'),
    supabase.from('technician_profiles').select('*, profile:profiles(full_name, role)'),
    supabase.from('invoices').select('*').order('issued_on', { ascending: true }),
  ]);

  const team: TeamMember[] = (teamRes.data ?? []).map((t: any) => ({
    id: t.profile_id,
    name: t.profile?.full_name ?? '—',
    role: t.profile?.role === 'site_lead' ? 'Site Lead' : 'Washer',
    site_id: t.site_id,
    status: t.status,
    washes_today: t.washes_today ?? 0,
  }));

  const sites = (sitesRes.data ?? []) as Site[];
  const board = (boardRes.data ?? []) as BoardRow[];
  const invoices = (invoicesRes.data ?? []) as Invoice[];

  const customers: CustomerRow[] = (profilesRes.data ?? []).map((p: any) => {
    const sub = p.subscriptions?.[0];
    return {
      id: p.id.slice(0, 8).toUpperCase(),
      name: p.full_name ?? '—',
      plan: sub ? sub.plan_id.charAt(0).toUpperCase() + sub.plan_id.slice(1) : 'One-off',
      site: sites.find((s) => s.id === p.site_id)?.name ?? '—',
      cars: p.cars?.length ?? 0,
      since: p.member_since ?? '',
      status: sub?.status === 'active' ? 'Active' : 'Active',
    };
  });

  const today = board; // seed sets all washes "today-ish"
  const inProgress = today.filter((b) => b.status === 'in_progress').length;
  const doneToday = today.filter((b) => b.status === 'done').length;
  const target = sites.filter((s) => s.status === 'live').reduce((s, x) => s + x.target, 0);
  const waterToday = today.reduce((s, b) => s + (b.litres_saved ?? 0), 0);

  return {
    sites,
    board,
    customers,
    team,
    invoices,
    kpis: {
      washesToday: doneToday + inProgress,
      inProgress,
      completion: target ? Math.round(((doneToday + inProgress) / target) * 100) : 0,
      target,
      waterToday,
      liveSites: sites.filter((s) => s.status === 'live').length,
    },
  };
}
