import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, useWindowDimensions } from 'react-native';
import {
  useFonts,
  Inter_300Light, Inter_400Regular, Inter_500Medium,
  Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '../lib/auth';
import { color as C } from '../lib/theme';

function Gate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const seg0 = segments[0] as string | undefined;
    const protectedRoute = seg0 === '(tabs)' || seg0 === 'track' || seg0 === 'onboarding';
    // sign-in handles its own post-auth routing (→ onboarding for new users, → home otherwise).
    if (!session && protectedRoute) router.replace('/sign-in');
  }, [session, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.carbon }, animation: 'fade' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="track" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_300Light, Inter_400Regular, Inter_500Medium,
    Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });

  const { width } = useWindowDimensions();
  const wide = width > 520; // desktop / wide web: center the app in a phone-width column
  const APP_WIDTH = 460;

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: C.carbon }} />;

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: C.carbon, alignItems: 'center' }}>
        <View style={{
          flex: 1, width: '100%', maxWidth: wide ? APP_WIDTH : undefined,
          borderLeftWidth: wide ? 1 : 0, borderRightWidth: wide ? 1 : 0, borderColor: C.carbonBorder,
        }}>
          <Gate />
        </View>
      </View>
    </AuthProvider>
  );
}
