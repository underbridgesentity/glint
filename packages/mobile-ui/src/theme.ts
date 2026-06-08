import { TextStyle } from 'react-native';
import { color, radius } from '@glint/design-tokens';

export { color, radius };
/** Alias used throughout the apps for brevity. */
export const C = color;

/**
 * Brand-bible type scale as React Native text styles. Weight = hierarchy.
 * Font family names are loaded per-app via @expo-google-fonts/inter.
 */
export const text = {
  label: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, color: color.lemon, textTransform: 'uppercase' } as TextStyle,
  display: { fontFamily: 'Inter_800ExtraBold', letterSpacing: -2, color: color.white } as TextStyle,
  h1: { fontFamily: 'Inter_700Bold', letterSpacing: -0.9, color: color.white } as TextStyle,
  h2: { fontFamily: 'Inter_600SemiBold', letterSpacing: -0.7, color: color.white } as TextStyle,
  h3: { fontFamily: 'Inter_600SemiBold', letterSpacing: -0.4, color: color.white } as TextStyle,
  body: { fontFamily: 'Inter_300Light', fontSize: 15, lineHeight: 25, color: color.mist } as TextStyle,
  meta: { fontFamily: 'Inter_400Regular', fontSize: 13, color: color.steel } as TextStyle,
  strong: { fontFamily: 'Inter_600SemiBold', color: color.white } as TextStyle,
} as const;
