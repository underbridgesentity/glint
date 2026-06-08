import { ReactNode } from 'react';
import { View, Text, Pressable, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { color as C, radius, text } from './theme';

/* ── Card / surfaces ─────────────────────────────────────────── */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: C.carbonMid, borderWidth: 1, borderColor: C.carbonBorder, borderRadius: radius.card }, style]}>
      {children}
    </View>
  );
}

export function Highlight({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: C.lemonDim, borderWidth: 1, borderColor: C.lemonBorder, borderRadius: radius.lg }, style]}>
      {children}
    </View>
  );
}

/* ── Pills ───────────────────────────────────────────────────── */
export function Pill({ children, tone = 'lemon' }: { children: ReactNode; tone?: 'lemon' | 'neutral' | 'alert' }) {
  const map = {
    lemon: { bg: C.lemonDim, bd: C.lemonBorder, fg: C.lemon },
    neutral: { bg: 'rgba(140,140,140,0.12)', bd: C.carbonBorder, fg: C.mist },
    alert: { bg: 'rgba(232,103,90,0.12)', bd: 'rgba(232,103,90,0.3)', fg: C.alert },
  }[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
      backgroundColor: map.bg, borderWidth: 1, borderColor: map.bd, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 5 }}>
      {typeof children === 'string'
        ? <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: map.fg }}>{children}</Text>
        : children}
    </View>
  );
}

export function Dot({ c = C.lemon }: { pulse?: boolean; c?: string }) {
  return <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c }} />;
}

/* ── Button ──────────────────────────────────────────────────── */
type BtnVariant = 'lemon' | 'ghost' | 'solid';
export function Button({
  label, onPress, variant = 'lemon', block = false, small = false, icon, loading = false, disabled = false, style,
}: {
  label: string; onPress?: () => void; variant?: BtnVariant; block?: boolean;
  small?: boolean; icon?: ReactNode; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const v = {
    lemon: { bg: C.lemon, fg: C.carbon, bd: 'transparent' },
    ghost: { bg: 'transparent', fg: C.white, bd: C.carbonBorder },
    solid: { bg: C.carbonRaise, fg: C.white, bd: C.carbonBorder },
  }[variant];
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          backgroundColor: v.bg, borderColor: v.bd, borderWidth: 1, borderRadius: radius.card,
          paddingVertical: small ? 9 : 15, paddingHorizontal: small ? 14 : 22,
          width: block ? '100%' : undefined, opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed && !disabled ? 0.985 : 1 }] },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : icon}
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: small ? 13 : 15, letterSpacing: -0.2, color: v.fg }}>{label}</Text>
    </Pressable>
  );
}

/* ── Progress bar ────────────────────────────────────────────── */
export function Progress({ pct }: { pct: number }) {
  return (
    <View style={{ height: 3, backgroundColor: C.carbonBorder, borderRadius: 2, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: C.lemon, borderRadius: 2 }} />
    </View>
  );
}

/* ── Stat block ──────────────────────────────────────────────── */
export function StatBlock({ value, label, accent = false }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <View>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 26, letterSpacing: -0.8, color: accent ? C.lemon : C.white, fontVariant: ['tabular-nums'] }}>{value}</Text>
      <Text style={[text.meta, { marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

/* ── Rating dots (stars) ─────────────────────────────────────── */
export function RatingDots({ value = 5, size = 13 }: { value?: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= value ? C.lemon : 'none'} stroke={i <= value ? C.lemon : C.carbonBorder} strokeWidth={2} strokeLinejoin="round">
          <Path d="M12 3l2.6 5.6L20 9.4l-4 4 1 6-5-2.8L7 19.4l1-6-4-4 5.4-.8L12 3Z" />
        </Svg>
      ))}
    </View>
  );
}

/* ── Avatar (initials) ───────────────────────────────────────── */
export function Avatar({ name = '', size = 38, lemon = false }: { name?: string; size?: number; lemon?: boolean }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: lemon ? C.lemon : C.carbonHi,
      borderWidth: lemon ? 0 : 1, borderColor: C.carbonBorder, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: size * 0.38, color: lemon ? C.carbon : C.white }}>{initials}</Text>
    </View>
  );
}

/* ── Car glyph (vehicle thumbnail placeholder) ───────────────── */
export function CarGlyph({ tone = '#c5c8cd', size = 44 }: { tone?: string; size?: number }) {
  return (
    <Svg width={size} height={size * 0.62} viewBox="0 0 100 62">
      <Path d="M6 44c-2 0-3-1.4-3-3.4 0-4.2 2.5-7.3 6.6-8.4l9-2.6 9.4-9c3-2.8 6.8-4.3 11-4.3h17c5.5 0 10.7 2.4 14.2 6.6l5.4 6.4 11.2 2.4c4.2.9 6.6 3.6 6.6 7.8 0 2.7-1.4 4.5-4.4 4.5H6Z" fill={tone} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
      <Path d="M33 19.5c-2.8.3-5.2 1.4-7.2 3.3l-6.3 6c-.7.7-.2 1.7.8 1.7H38c.8 0 1.4-.6 1.4-1.4V21c0-.9-.8-1.6-1.7-1.5l-4.7.0Z" fill="rgba(255,255,255,0.18)" />
      <Path d="M43 19.4h7.5c3.8 0 7.4 1.6 9.9 4.5l4.3 5c.6.7.1 1.6-.8 1.6H44.4c-.8 0-1.4-.6-1.4-1.4V20.8c0-.8.6-1.4 1.4-1.4Z" fill="rgba(255,255,255,0.18)" />
      <Circle cx="28" cy="44" r="9" fill="#0C0C0C" stroke={tone} strokeWidth="2.5" />
      <Circle cx="74" cy="44" r="9" fill="#0C0C0C" stroke={tone} strokeWidth="2.5" />
      <Circle cx="28" cy="44" r="3" fill={tone} />
      <Circle cx="74" cy="44" r="3" fill={tone} />
    </Svg>
  );
}
