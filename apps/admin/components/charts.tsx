// Palette-safe charts ported from the Glint design system.

export function Bars({ data, max, h = 130, accentLast = true }: { data: { label: string; v: number }[]; max?: number; h?: number; accentLast?: boolean }) {
  const m = max || Math.max(...data.map((d) => d.v), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: h }}>
      {data.map((d, i) => {
        const last = i === data.length - 1;
        return (
          <div key={d.label + i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: 46, height: (d.v / m) * (h - 28), borderRadius: 5, background: accentLast && last ? 'var(--lemon)' : 'var(--carbon-hi)', transition: 'height 0.5s var(--ease)' }} />
            <span className="g-meta" style={{ fontSize: 11 }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Spark({ data, w = 120, h = 38 }: { data: number[]; w?: number; h?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / (max - min || 1)) * (h - 6) - 3]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke="var(--lemon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill="var(--lemon)" />
    </svg>
  );
}

export function Donut({ data, size = 130 }: { data: { label: string; v: number; c: string }[]; size?: number }) {
  const total = data.reduce((a, b) => a + b.v, 0) || 1;
  const r = size / 2 - 11, cx = size / 2, cy = size / 2, CIRC = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {data.map((d, i) => {
        const frac = d.v / total;
        const seg = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.c} strokeWidth="14" strokeDasharray={`${(frac * CIRC).toFixed(1)} ${CIRC.toFixed(1)}`} strokeDashoffset={-off * CIRC} />;
        off += frac;
        return seg;
      })}
    </svg>
  );
}

export function Kpi({ label, value, sub, accent, spark, delta }: { label: string; value: string | number; sub?: string; accent?: boolean; spark?: number[]; delta?: number }) {
  return (
    <div className="g-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="g-label muted" style={{ color: 'var(--steel)' }}>{label}</span>
        {delta != null && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--lemon)' }}>▲ {delta}%</span>}
      </div>
      <div className="tnum" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 12, color: accent ? 'var(--lemon)' : 'var(--white)' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 6 }}>
        <span className="g-meta">{sub}</span>
        {spark && <Spark data={spark} />}
      </div>
    </div>
  );
}
