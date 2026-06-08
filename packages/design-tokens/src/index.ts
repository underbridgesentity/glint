/**
 * Glint — Design Tokens
 * Extracted verbatim from the Glint Brand Bible v1.0.
 * Carbon Black foundation · Crisp White content · Electric Lemon signal
 * Inter only · Dark mode always · 8px cards / 100px pills
 *
 * Consumed by both the Expo (React Native) apps and the Next.js web apps,
 * so the brand is defined exactly once.
 */

export const color = {
  // Carbon scale
  carbon: '#0C0C0C',
  carbonMid: '#141414',
  carbonRaise: '#1C1C1C',
  carbonHi: '#232323',
  carbonBorder: '#2A2A2A',

  // Neutrals
  steel: '#5A5A5A',
  mist: '#8C8C8C',
  white: '#F8F8F8',

  // Signal — use sparingly
  lemon: '#CDFF00',
  lemonHover: '#D9FF33',
  lemonDim: 'rgba(205, 255, 0, 0.12)',
  lemonBorder: 'rgba(205, 255, 0, 0.30)',
  lemonGlow: 'rgba(205, 255, 0, 0.20)',

  // Functional (kept inside the family)
  ok: '#CDFF00',
  warn: '#F2C94C', // admin data-viz only
  alert: '#E8675A', // re-wash / escalation only
} as const;

export const radius = {
  card: 8,
  lg: 14,
  pill: 100,
} as const;

export const font = {
  family: 'Inter',
  // Weight = hierarchy (per the bible).
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

/** Type scale — letterSpacing in em (web) / multiply by fontSize for RN. */
export const type = {
  label: { size: 11, weight: '700', spacing: 0.14, upper: true },
  display: { weight: '800', spacing: -0.04, line: 1.0 },
  h1: { weight: '700', spacing: -0.03, line: 1.08 },
  h2: { weight: '600', spacing: -0.025, line: 1.15 },
  h3: { weight: '600', spacing: -0.02, line: 1.25 },
  body: { weight: '300', line: 1.7 },
  meta: { size: 13, weight: '400', spacing: 0.01 },
} as const;

export const ease = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

export const space = (n: number) => n * 4;

export type Color = keyof typeof color;
