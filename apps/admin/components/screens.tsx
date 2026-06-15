'use client';
import { useState } from 'react';
import { fmtR } from '@glint/types';
import type { PortalData } from '../lib/data';
import { Icon, Avatar } from './Icon';
import { Bars, Donut, Kpi } from './charts';

const SB_STATUS: Record<string, { label: string; c: string; bg: string; bd: string }> = {
  in_progress: { label: 'Washing', c: 'var(--lemon)', bg: 'var(--lemon-dim)', bd: 'var(--lemon-border)' },
  scheduled: { label: 'Queued', c: 'var(--mist)', bg: 'rgba(140,140,140,0.1)', bd: 'var(--carbon-border)' },
  arrived: { label: 'Arrived', c: 'var(--mist)', bg: 'rgba(140,140,140,0.1)', bd: 'var(--carbon-border)' },
  done: { label: 'Done', c: 'var(--steel)', bg: 'rgba(90,90,90,0.12)', bd: 'var(--carbon-border)' },
};
const fmtK = (n: number) => 'R' + (n / 1000 >= 1 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'k' : String(n));
const PLAN_PRICE: Record<string, number> = { Premium: 75000, Basic: 45000, 'One-off': 19900 };

/* ── LIVE OPS ─────────────────────────────────────────────────── */
export function Ops({ d }: { d: PortalData }) {
  const k = d.kpis;
  const crew = d.team.filter((t) => t.status === 'washing' || t.status === 'available').length;
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'scheduled' | 'done'>('all');
  const board = filter === 'all' ? d.board : d.board.filter((b) => b.status === filter);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
        <Kpi label="Washes today" value={k.washesToday} sub={`of ${k.target} network target`} spark={[42, 51, 48, 60, 71, k.washesToday]} />
        <Kpi label="In progress" value={k.inProgress} sub={`across ${k.liveSites} live sites`} accent />
        <Kpi label="Completion" value={`${k.completion}%`} sub="of daily target" />
        <Kpi label="Crew on shift" value={crew} sub="technicians working now" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16, marginTop: 16 }} className="ops-grid">
        <div className="g-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '18px 20px', borderBottom: '1px solid var(--carbon-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="g-dot g-dot--pulse" />
              <h3 className="g-h3" style={{ fontSize: 16 }}>Live wash board</h3>
            </div>
            <div style={{ display: 'flex', gap: 4, background: 'var(--carbon-raise)', borderRadius: 8, padding: 3, border: '1px solid var(--carbon-border)' }}>
              {([['all', 'All'], ['in_progress', 'Washing'], ['scheduled', 'Queued'], ['done', 'Done']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setFilter(v)} style={{ border: 'none', cursor: 'pointer', borderRadius: 6, padding: '6px 11px', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, background: filter === v ? 'var(--white)' : 'transparent', color: filter === v ? 'var(--carbon)' : 'var(--mist)' }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 1fr 0.7fr 1.1fr', gap: 12, padding: '11px 20px', borderBottom: '1px solid var(--carbon-border)' }}>
            {['Customer / Vehicle', 'Site', 'Technician', 'Tier', 'Status'].map((h) => <span key={h} className="g-label muted" style={{ color: 'var(--steel)', fontSize: 10 }}>{h}</span>)}
          </div>
          {board.map((b) => {
            const st = SB_STATUS[b.status] ?? SB_STATUS.scheduled;
            return (
              <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 1fr 0.7fr 1.1fr', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--carbon-border)', alignItems: 'center' }}>
                <div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{b.customer?.full_name ?? '—'}</div><div className="g-meta">{b.car ? `${b.car.make} ${b.car.model}` : ''}</div></div>
                <div className="g-meta" style={{ fontSize: 12.5, color: 'var(--mist)' }}>{b.site?.name}</div>
                <div className="g-meta" style={{ fontSize: 12.5, color: 'var(--mist)' }}>{b.technician?.full_name ?? '—'}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{b.tier}</div>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, color: st.c, background: st.bg, border: '1px solid ' + st.bd }}>
                    {b.status === 'in_progress' && <span className="g-dot g-dot--pulse" />}{st.label}{b.status === 'in_progress' ? ' ' + b.pct + '%' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="g-card" style={{ padding: 18 }}>
            <h3 className="g-h3" style={{ fontSize: 15, marginBottom: 14 }}>Sites today</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {d.sites.filter((s) => s.status === 'live').map((s) => {
                const washed = d.board.filter((b) => b.site?.name === s.name && (b.status === 'done' || b.status === 'in_progress')).length;
                return (
                  <div key={s.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                      <span className="g-meta tnum">{washed}/{s.target}</span>
                    </div>
                    <div className="g-progress"><span style={{ width: `${Math.min(100, (washed / s.target) * 100)}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SITES ────────────────────────────────────────────────────── */
export function Sites({ d }: { d: PortalData }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: 16 }}>
      {d.sites.map((s) => {
        const onboarding = s.status === 'onboarding';
        const washed = d.board.filter((b) => b.site?.name === s.name && (b.status === 'done' || b.status === 'in_progress')).length;
        const team = d.team.filter((t) => t.site_id === s.id).length;
        return (
          <div key={s.id} className="g-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--carbon-raise)', border: '1px solid var(--carbon-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lemon)' }}><Icon name="building" size={21} /></div>
              <span className="g-pill" style={{ color: onboarding ? 'var(--mist)' : 'var(--lemon)', background: onboarding ? 'rgba(140,140,140,0.1)' : 'var(--lemon-dim)', border: '1px solid ' + (onboarding ? 'var(--carbon-border)' : 'var(--lemon-border)') }}>{onboarding ? 'Onboarding' : 'Live'}</span>
            </div>
            <h3 className="g-h3" style={{ fontSize: 19, marginTop: 16 }}>{s.name}</h3>
            <div className="g-meta" style={{ marginTop: 3, textTransform: 'capitalize' }}>{s.type.replace('_', ' ')} · {s.area}</div>
            {!onboarding ? (
              <>
                <div style={{ display: 'flex', gap: 20, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--carbon-border)' }}>
                  <div><div className="tnum" style={{ fontSize: 20, fontWeight: 700 }}>{washed}<span style={{ color: 'var(--steel)', fontSize: 14 }}>/{s.target}</span></div><div className="g-meta">Today</div></div>
                  <div><div className="tnum" style={{ fontSize: 20, fontWeight: 700 }}>{team}</div><div className="g-meta">Team</div></div>
                  <div><div className="tnum" style={{ fontSize: 20, fontWeight: 700, color: 'var(--lemon)' }}>{s.hours}</div><div className="g-meta">Hours</div></div>
                </div>
                <div className="g-progress" style={{ marginTop: 16 }}><span style={{ width: `${Math.min(100, (washed / s.target) * 100)}%` }} /></div>
              </>
            ) : (
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--carbon-border)' }}>
                <div className="g-meta" style={{ marginBottom: 12 }}>Go-live checklist · 3 of 5</div>
                {([['Space secured', true], ['Equipment cage', true], ['Power + access', true], ['Team hired', false], ['Signage installed', false]] as const).map(([l, done]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0', fontSize: 13, color: done ? 'var(--white)' : 'var(--steel)' }}>
                    <Icon name={done ? 'checkCircle' : 'slash'} size={16} color={done ? 'var(--lemon)' : 'var(--steel)'} />{l}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="g-card" style={{ padding: 22, background: 'transparent', borderStyle: 'dashed', display: 'flex', flexDirection: 'column' }}>
        <span className="g-label">New site footprint</span>
        <p className="g-body" style={{ fontSize: 13, marginTop: 12 }}>Each Glint station needs less than <span className="g-strong">4m²</span>:</p>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {([['pin', '1–2 parking bays'], ['bolt', '1 power outlet'], ['lock', '1m × 1m equipment cage'], ['droplet', 'No plumbing needed']] as const).map(([ic, t]) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--mist)' }}><Icon name={ic} size={16} color="var(--lemon)" />{t}</div>
          ))}
        </div>
        <button className="g-btn g-btn--lemon" style={{ marginTop: 'auto' }}><Icon name="plus" size={17} stroke={2.5} />Add a site</button>
      </div>
    </div>
  );
}

/* ── DISPATCH ─────────────────────────────────────────────────── */
export function Dispatch({ d }: { d: PortalData }) {
  const liveSites = d.sites.filter((s) => s.status === 'live');
  const [siteId, setSiteId] = useState(liveSites[0]?.id ?? '');
  const site = d.sites.find((s) => s.id === siteId);
  const team = d.team.filter((t) => t.site_id === siteId);
  const queued = d.board.filter((b) => b.site?.name === site?.name && (b.status === 'scheduled' || b.status === 'arrived'));

  const TS: Record<string, string> = { washing: 'var(--lemon)', available: 'var(--white)', break: 'var(--steel)', offline: 'var(--steel)' };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {liveSites.map((s) => (
          <button key={s.id} onClick={() => setSiteId(s.id)} style={{ cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13.5, fontWeight: 600, padding: '10px 16px', borderRadius: 8, background: siteId === s.id ? 'var(--lemon)' : 'var(--carbon-mid)', color: siteId === s.id ? 'var(--carbon)' : 'var(--mist)', border: '1px solid ' + (siteId === s.id ? 'var(--lemon)' : 'var(--carbon-border)') }}>{s.name} <span style={{ opacity: 0.6 }}>· {d.team.filter((t) => t.site_id === s.id).length}</span></button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }} className="ops-grid">
        <div className="g-card" style={{ padding: 18, height: 'fit-content' }}>
          <h3 className="g-h3" style={{ fontSize: 15, marginBottom: 16 }}>Team on site · {team.length}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {team.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', borderRadius: 9, background: 'var(--carbon-raise)', border: '1px solid var(--carbon-border)' }}>
                <Avatar name={t.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</div>
                  <div className="g-meta" style={{ fontSize: 11.5 }}>{t.role} · {t.washes_today} today</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: TS[t.status], textTransform: 'capitalize' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: TS[t.status] }} />{t.status}
                </span>
              </div>
            ))}
            {team.length === 0 && <div className="g-meta">No team assigned yet.</div>}
          </div>
          <button className="g-btn g-btn--ghost" style={{ width: '100%', marginTop: 14, borderStyle: 'dashed' }}><Icon name="plus" size={17} />Assign washer</button>
        </div>

        <div className="g-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 className="g-h3" style={{ fontSize: 15 }}>Today's schedule</h3>
            <span className="g-meta">{site?.hours}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid var(--carbon-border)', paddingBottom: 8, marginBottom: 14 }}>
            {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'].map((h) => <span key={h} className="g-meta tnum" style={{ fontSize: 11 }}>{h}</span>)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {team.length ? team.map((t, ti) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 70, fontSize: 12, fontWeight: 600, color: 'var(--mist)', flexShrink: 0 }}>{t.name.split(' ')[0]}</span>
                <div style={{ flex: 1, position: 'relative', height: 30, background: 'var(--carbon-raise)', borderRadius: 6, overflow: 'hidden' }}>
                  {[[ti * 12, 22 + ti * 4, 'Full'], [50 + ti * 8, 18, ti % 2 ? 'Express' : 'Premium']].map(([left, w, label], bi) => (
                    <div key={bi} style={{ position: 'absolute', top: 3, bottom: 3, left: `${left}%`, width: `${w}%`, background: bi === 0 && ti === 0 ? 'var(--lemon)' : 'var(--carbon-hi)', color: bi === 0 && ti === 0 ? 'var(--carbon)' : 'var(--white)', borderRadius: 4, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', paddingLeft: 7, overflow: 'hidden', whiteSpace: 'nowrap', border: bi === 0 && ti === 0 ? 'none' : '1px solid var(--carbon-border)' }}>{label as string}</div>
                  ))}
                </div>
              </div>
            )) : <div className="g-meta">Assign a team to schedule washes.</div>}
          </div>

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--carbon-border)' }}>
            <div className="g-label" style={{ marginBottom: 12, display: 'block' }}>Unassigned · {queued.length}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {queued.map((b) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 8, background: 'var(--carbon-raise)', border: '1px solid var(--carbon-border)' }}>
                  <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{b.car ? `${b.car.make} ${b.car.model}` : 'Vehicle'}</div><div className="g-meta" style={{ fontSize: 11 }}>{b.tier}</div></div>
                  <button className="g-btn g-btn--lemon g-btn--sm" style={{ padding: '6px 10px', fontSize: 12 }}>Assign</button>
                </div>
              ))}
              {queued.length === 0 && <div className="g-meta">All washes assigned.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CUSTOMERS ────────────────────────────────────────────────── */
export function Customers({ d }: { d: PortalData }) {
  const [plan, setPlan] = useState('All');
  const rows = plan === 'All' ? d.customers : d.customers.filter((c) => c.plan === plan);
  const planColor = (p: string) => (p === 'Premium' ? 'var(--lemon)' : p === 'Basic' ? 'var(--white)' : 'var(--mist)');
  const active = d.customers.filter((c) => c.plan !== 'One-off').length;
  const vehicles = d.customers.reduce((s, c) => s + c.cars, 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 20 }}>
        <Kpi label="Total customers" value={d.customers.length} sub={`across ${d.kpis.liveSites} sites`} />
        <Kpi label="Active subscriptions" value={active} sub={`${d.customers.length ? Math.round((active / d.customers.length) * 100) : 0}% of base`} accent />
        <Kpi label="Vehicles" value={vehicles} sub={`${d.customers.length ? (vehicles / d.customers.length).toFixed(1) : 0} avg per customer`} />
        <Kpi label="Churn (30d)" value="2.1%" sub="below 3% target" />
      </div>

      <div className="g-card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--carbon-border)' }}>
          <h3 className="g-h3" style={{ fontSize: 16 }}>Customer &amp; vehicle database</h3>
          <div style={{ display: 'flex', gap: 4, background: 'var(--carbon-raise)', borderRadius: 8, padding: 3, border: '1px solid var(--carbon-border)' }}>
            {['All', 'Premium', 'Basic', 'One-off'].map((v) => (
              <button key={v} onClick={() => setPlan(v)} style={{ border: 'none', cursor: 'pointer', borderRadius: 6, padding: '6px 12px', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, background: plan === v ? 'var(--white)' : 'transparent', color: plan === v ? 'var(--carbon)' : 'var(--mist)' }}>{v}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1.3fr 0.6fr 1fr 0.9fr', gap: 12, padding: '11px 20px', borderBottom: '1px solid var(--carbon-border)' }}>
          {['Customer', 'Plan', 'Site', 'Cars', 'Since', 'Status'].map((h) => <span key={h} className="g-label muted" style={{ color: 'var(--steel)', fontSize: 10 }}>{h}</span>)}
        </div>
        {rows.map((c) => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1.3fr 0.6fr 1fr 0.9fr', gap: 12, padding: '13px 20px', borderBottom: '1px solid var(--carbon-border)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><Avatar name={c.name} size={32} /><div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div><div className="g-meta" style={{ fontSize: 11 }}>{c.id}</div></div></div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: planColor(c.plan) }}>{c.plan}</span>
            <span className="g-meta" style={{ fontSize: 12.5 }}>{c.site}</span>
            <span className="tnum" style={{ fontSize: 13 }}>{c.cars}</span>
            <span className="g-meta tnum" style={{ fontSize: 12.5 }}>{c.since ? new Date(c.since).toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }) : '—'}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: c.status === 'Active' ? 'var(--lemon)' : 'var(--steel)' }}>{c.status}</span>
          </div>
        ))}
        {rows.length === 0 && <div className="g-meta" style={{ padding: 20 }}>No customers in this segment.</div>}
      </div>
    </div>
  );
}

/* ── REVENUE ──────────────────────────────────────────────────── */
export function Revenue({ d }: { d: PortalData }) {
  // Aggregate real invoices by month.
  const byMonth = new Map<string, number>();
  d.invoices.forEach((inv) => {
    const m = new Date(inv.issued_on).toLocaleDateString('en-ZA', { month: 'short' });
    byMonth.set(m, (byMonth.get(m) ?? 0) + inv.amount_cents);
  });
  const months = [...byMonth.entries()].map(([label, v]) => ({ label, v: Math.round(v / 1000) }));
  const revMonth = d.invoices.filter((i) => new Date(i.issued_on).getMonth() === new Date().getMonth()).reduce((s, i) => s + i.amount_cents, 0);

  // Recurring revenue + mix from active customer plans.
  const mrr = d.customers.filter((c) => c.plan !== 'One-off').reduce((s, c) => s + (PLAN_PRICE[c.plan] ?? 0), 0);
  const oneOff = d.invoices.filter((i) => /wash/i.test(i.label)).reduce((s, i) => s + i.amount_cents, 0);
  const mix = [
    { label: 'Subscriptions', v: Math.round(mrr / 1000), c: 'var(--lemon)' },
    { label: 'One-off', v: Math.max(1, Math.round(oneOff / 1000)), c: 'var(--white)' },
    { label: 'Fleet / corporate', v: Math.round(mrr / 1000 * 0.1), c: 'var(--steel)' },
  ];
  const mixTotal = mix.reduce((a, b) => a + b.v, 0);

  // Recurring revenue by site (from customer plans).
  const bySite = d.sites.filter((s) => s.status === 'live').map((s) => ({
    s: s.name,
    v: Math.round(d.customers.filter((c) => c.site === s.name).reduce((sum, c) => sum + (PLAN_PRICE[c.plan] ?? 0), 0) / 1000),
  })).sort((a, b) => b.v - a.v);
  const maxSite = Math.max(...bySite.map((x) => x.v), 1);
  const activeCust = d.customers.filter((c) => c.plan !== 'One-off').length || 1;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
        <Kpi label="Revenue this month" value={fmtK(revMonth)} sub="invoiced" spark={months.map((m) => m.v)} />
        <Kpi label="MRR" value={fmtK(mrr)} sub="recurring subscriptions" accent />
        <Kpi label="ARPU" value={fmtR(Math.round(mrr / activeCust))} sub="per active customer" />
        <Kpi label="Avg wash value" value="R187" sub="blended one-off + sub" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginTop: 16 }} className="ops-grid">
        <div className="g-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
            <h3 className="g-h3" style={{ fontSize: 16 }}>Revenue trend</h3>
            <span className="g-meta">By month · R000s</span>
          </div>
          <Bars data={months} h={180} />
        </div>

        <div className="g-card" style={{ padding: 22 }}>
          <h3 className="g-h3" style={{ fontSize: 16, marginBottom: 18 }}>Revenue mix</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Donut data={mix} size={130} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="tnum" style={{ fontSize: 20, fontWeight: 700 }}>{fmtK(mixTotal * 1000)}</span>
                <span className="g-meta" style={{ fontSize: 10 }}>total</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mix.map((m) => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: m.c, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{m.label}</span>
                  <span className="tnum" style={{ fontSize: 13, fontWeight: 600 }}>{Math.round((m.v / mixTotal) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }} className="ops-grid">
        <div className="g-card" style={{ padding: 22 }}>
          <h3 className="g-h3" style={{ fontSize: 16, marginBottom: 18 }}>Recurring revenue by site</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bySite.map((s, i) => (
              <div key={s.s}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.s}</span>
                  <span className="tnum g-meta">R{s.v}k</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--carbon-raise)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(s.v / maxSite) * 100}%`, background: i === 0 ? 'var(--lemon)' : 'var(--carbon-hi)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="g-card" style={{ padding: 22 }}>
          <h3 className="g-h3" style={{ fontSize: 16, marginBottom: 18 }}>How money flows in</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {([['repeat', 'Subscription', 'Auto-debit / card-on-file, monthly'], ['wallet', 'Once-off', 'Card via PayFast at booking'], ['building', 'Fleet / corporate', 'Monthly invoice · 30-day terms'], ['shield', 'Developer', 'Monthly reconciliation + payment']] as const).map(([ic, t, s]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 14px', borderRadius: 9, background: 'var(--carbon-raise)', border: '1px solid var(--carbon-border)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--carbon-hi)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lemon)', flexShrink: 0 }}><Icon name={ic} size={17} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{t}</div><div className="g-meta" style={{ fontSize: 11.5 }}>{s}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
