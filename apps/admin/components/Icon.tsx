// Web (SVG) icon set - same paths as the Glint design system.
import { CSSProperties } from 'react';

const PATHS: Record<string, JSX.Element> = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  truck: <><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17.5" cy="18" r="1.8" /></>,
  building: <><path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" /><path d="M15 21V9h3a2 2 0 0 1 2 2v10M3 21h18" /><path d="M7.5 7h3M7.5 11h3M7.5 15h3" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6M17.5 19a5.5 5.5 0 0 0-2-4.3" /></>,
  chart: <><path d="M4 4v16h16" /><path d="M8 14l3-4 3 2 4-6" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
  repeat: <><path d="M4 8h12l-2.5-2.5M20 16H8l2.5 2.5" /></>,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M16.5 13.5h.01" /></>,
  shield: <><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="M8 12.2l2.7 2.7L16 9.5" /></>,
  slash: <><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6 18.4 18.4" /></>,
  pin: <><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  bolt: <><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  droplet: <><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /></>,
  logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12h10M16 8l4 4-4 4" /></>,
};

export function Icon({ name, size = 22, stroke = 2, color = 'currentColor', style }: { name: string; size?: number; stroke?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0, ...style }}>
      {PATHS[name] ?? null}
    </svg>
  );
}

export function GlintMark({ size = 19 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <span style={{ width: size * 0.5, height: size * 0.5, borderRadius: '50%', background: 'var(--lemon)' }} />
      <span style={{ fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--white)', fontSize: size }}>Glint</span>
    </span>
  );
}

export function Avatar({ name = '', size = 34 }: { name?: string; size?: number }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--carbon-hi)', color: 'var(--white)', border: '1px solid var(--carbon-border)', fontSize: size * 0.38, fontWeight: 700 }}>{initials}</span>
  );
}
