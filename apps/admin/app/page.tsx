'use client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchPortal, PortalData } from '../lib/data';
import { Icon, GlintMark, Avatar } from '../components/Icon';
import { Ops, Sites, Dispatch, Customers, Revenue } from '../components/screens';

const NAV = [
  { id: 'ops', label: 'Live Ops', icon: 'dashboard', title: 'Live Operations', sub: "Today's washes across the network" },
  { id: 'dispatch', label: 'Dispatch', icon: 'truck', title: 'Dispatch', sub: 'Team scheduling by site' },
  { id: 'sites', label: 'Sites', icon: 'building', title: 'Sites', sub: 'Office parks & estates' },
  { id: 'customers', label: 'Customers', icon: 'users', title: 'Customers', sub: 'Customer & vehicle database' },
  { id: 'revenue', label: 'Revenue', icon: 'chart', title: 'Revenue', sub: 'Money in, across all channels' },
] as const;

export default function Portal() {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecked(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!checked) return <div style={{ height: '100vh', background: 'var(--carbon)' }} />;
  if (!session) return <SignIn />;
  return <Shell />;
}

function SignIn() {
  const [email, setEmail] = useState('ops@glint.co.za');
  const [password, setPassword] = useState('glint1234');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    setBusy(false);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--carbon)' }}>
      <form onSubmit={submit} style={{ width: 360, padding: 32 }}>
        <GlintMark size={22} />
        <div className="g-meta" style={{ marginTop: 6, letterSpacing: '0.06em' }}>OPERATIONS</div>
        <h1 className="g-h1" style={{ fontSize: 28, marginTop: 18 }}>Control room.</h1>
        <p className="g-body" style={{ fontSize: 14, marginTop: 8, marginBottom: 20 }}>Sign in to run dispatch and live ops.</p>
        <input className="g-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ marginBottom: 10 }} />
        <input className="g-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {err && <div style={{ color: 'var(--alert)', fontSize: 13, marginTop: 10 }}>{err}</div>}
        <button className="g-btn g-btn--lemon g-btn--block" style={{ marginTop: 16 }} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <div className="g-meta" style={{ textAlign: 'center', marginTop: 12 }}>Demo: ops@glint.co.za · glint1234</div>
      </form>
    </div>
  );
}

function Shell() {
  const [nav, setNav] = useState<(typeof NAV)[number]['id']>('ops');
  const [data, setData] = useState<PortalData | null>(null);
  const cur = NAV.find((n) => n.id === nav)!;

  useEffect(() => { fetchPortal().then(setData); }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--carbon)', overflow: 'hidden' }}>
      <aside style={{ width: 232, flexShrink: 0, borderRight: '1px solid var(--carbon-border)', display: 'flex', flexDirection: 'column', background: 'var(--carbon-mid)' }}>
        <div style={{ padding: '24px 22px 22px', borderBottom: '1px solid var(--carbon-border)' }}>
          <GlintMark size={19} />
          <div className="g-meta" style={{ marginTop: 6, fontSize: 11, letterSpacing: '0.06em' }}>OPERATIONS</div>
        </div>
        <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV.map((it) => {
            const on = nav === it.id;
            return (
              <button key={it.id} onClick={() => setNav(it.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 8, cursor: 'pointer', border: 'none', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, textAlign: 'left', background: on ? 'var(--lemon-dim)' : 'transparent', color: on ? 'var(--lemon)' : 'var(--mist)' }}>
                <Icon name={it.icon} size={19} stroke={on ? 2.2 : 1.9} />{it.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: 14, borderTop: '1px solid var(--carbon-border)', display: 'flex', alignItems: 'center', gap: 11 }}>
          <Avatar name="Glint Ops" size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Glint Ops</div>
            <div className="g-meta" style={{ fontSize: 11 }}>Operations</div>
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--steel)' }}><Icon name="logout" size={17} /></button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--carbon-border)', flexShrink: 0 }}>
          <div>
            <h1 className="g-h2" style={{ fontSize: 24 }}>{cur.title}</h1>
            <div className="g-meta" style={{ marginTop: 3 }}>{cur.sub}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--carbon-raise)', border: '1px solid var(--carbon-border)', borderRadius: 8, padding: '9px 13px', width: 220 }}>
            <Icon name="search" size={17} color="var(--steel)" />
            <input placeholder="Search…" style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--white)', fontSize: 13.5, width: '100%' }} />
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {!data ? (
            <div className="g-meta">Loading operations…</div>
          ) : (
            <>
              {nav === 'ops' && <Ops d={data} />}
              {nav === 'dispatch' && <Dispatch d={data} />}
              {nav === 'sites' && <Sites d={data} />}
              {nav === 'customers' && <Customers d={data} />}
              {nav === 'revenue' && <Revenue d={data} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
