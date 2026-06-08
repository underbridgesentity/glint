import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { color as C } from './theme';

// Monochrome line icons, ported from the Glint design system (glint-icons).
export type IconName =
  | 'home' | 'calendar' | 'wallet' | 'user' | 'car' | 'bolt' | 'check' | 'checkCircle'
  | 'chevR' | 'chevL' | 'chevD' | 'plus' | 'bell' | 'pin' | 'clock' | 'leaf' | 'camera'
  | 'key' | 'lock' | 'shield' | 'repeat' | 'phone' | 'logout' | 'star' | 'list' | 'x'
  | 'eye' | 'chart' | 'droplet' | 'truck' | 'users' | 'building' | 'map' | 'search';

const ICONS: Record<IconName, (s: object) => JSX.Element> = {
  home: (p) => <><Path {...p} d="M3 10.5 12 3l9 7.5" /><Path {...p} d="M5 9.5V20h14V9.5" /></>,
  calendar: (p) => <><Rect {...p} x="3" y="4.5" width="18" height="16" rx="2" /><Path {...p} d="M3 9h18M8 2.5v4M16 2.5v4" /></>,
  wallet: (p) => <><Rect {...p} x="3" y="6" width="18" height="13" rx="2.5" /><Path {...p} d="M3 10h18M16.5 13.5h.01" /></>,
  user: (p) => <><Circle {...p} cx="12" cy="8" r="4" /><Path {...p} d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
  car: (p) => <><Path {...p} d="M3 13l1.6-4.5A2 2 0 0 1 6.5 7h11a2 2 0 0 1 1.9 1.5L21 13" /><Path {...p} d="M3 13h18v4.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V17H6.5v.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V13Z" /><Path {...p} d="M6.5 15.2h.01M17.5 15.2h.01" /></>,
  bolt: (p) => <Path {...p} d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  check: (p) => <Path {...p} d="M4 12.5l5 5L20 6.5" />,
  checkCircle: (p) => <><Circle {...p} cx="12" cy="12" r="9" /><Path {...p} d="M8 12.2l2.7 2.7L16 9.5" /></>,
  chevR: (p) => <Path {...p} d="M9 5l7 7-7 7" />,
  chevL: (p) => <Path {...p} d="M15 5l-7 7 7 7" />,
  chevD: (p) => <Path {...p} d="M5 9l7 7 7-7" />,
  plus: (p) => <Path {...p} d="M12 5v14M5 12h14" />,
  bell: (p) => <><Path {...p} d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6.5 1.5 6.5h-15S6 14 6 9Z" /><Path {...p} d="M10 19a2 2 0 0 0 4 0" /></>,
  pin: (p) => <><Path {...p} d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" /><Circle {...p} cx="12" cy="10" r="2.5" /></>,
  clock: (p) => <><Circle {...p} cx="12" cy="12" r="9" /><Path {...p} d="M12 7.5V12l3 2" /></>,
  leaf: (p) => <><Path {...p} d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14a6 6 0 0 1-1-1Z" /><Path {...p} d="M5 19c3-3 6-5 9-6" /></>,
  camera: (p) => <><Path {...p} d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" /><Circle {...p} cx="12" cy="12.5" r="3.5" /></>,
  key: (p) => <><Circle {...p} cx="8" cy="8" r="4.5" /><Path {...p} d="M11.5 11.5 20 20M17 17l2-2M14.5 14.5l2-2" /></>,
  lock: (p) => <><Rect {...p} x="5" y="10" width="14" height="10" rx="2" /><Path {...p} d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  shield: (p) => <><Path {...p} d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" /><Path {...p} d="M9 12l2 2 4-4" /></>,
  repeat: (p) => <Path {...p} d="M4 8h12l-2.5-2.5M20 16H8l2.5 2.5" />,
  phone: (p) => <Path {...p} d="M5 4h4l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  logout: (p) => <Path {...p} d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12h10M16 8l4 4-4 4" />,
  star: (p) => <Path {...p} d="M12 3l2.6 5.6L20 9.4l-4 4 1 6-5-2.8L7 19.4l1-6-4-4 5.4-.8L12 3Z" />,
  list: (p) => <Path {...p} d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  x: (p) => <Path {...p} d="M6 6l12 12M18 6 6 18" />,
  eye: (p) => <><Path {...p} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><Circle {...p} cx="12" cy="12" r="3" /></>,
  chart: (p) => <><Path {...p} d="M4 4v16h16" /><Path {...p} d="M8 14l3-4 3 2 4-6" /></>,
  droplet: (p) => <Path {...p} d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />,
  truck: (p) => <><Path {...p} d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" /><Circle {...p} cx="7" cy="18" r="1.8" /><Circle {...p} cx="17.5" cy="18" r="1.8" /></>,
  users: (p) => <><Circle {...p} cx="9" cy="8" r="3.2" /><Path {...p} d="M3.5 19a5.5 5.5 0 0 1 11 0" /><Path {...p} d="M16 5.2a3.2 3.2 0 0 1 0 6M17.5 19a5.5 5.5 0 0 0-2-4.3" /></>,
  building: (p) => <><Path {...p} d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" /><Path {...p} d="M15 21V9h3a2 2 0 0 1 2 2v10M3 21h18" /><Path {...p} d="M7.5 7h3M7.5 11h3M7.5 15h3" /></>,
  map: (p) => <><Path {...p} d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><Path {...p} d="M9 4v14M15 6v14" /></>,
  search: (p) => <><Circle {...p} cx="11" cy="11" r="7" /><Path {...p} d="M20 20l-3.5-3.5" /></>,
};

export function Icon({
  name, size = 22, color = C.mist, stroke = 2, fill = 'none',
}: { name: IconName; size?: number; color?: string; stroke?: number; fill?: string }) {
  const p = { fill, stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {ICONS[name](p)}
    </Svg>
  );
}
