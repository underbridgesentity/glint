import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import {
  useFonts, Inter_300Light, Inter_400Regular, Inter_500Medium,
  Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '../lib/auth';
import { color as C } from '@glint/mobile-ui';

function Gate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const seg0 = segments[0] as string | undefined;
    const inApp = seg0 === '(tabs)' || seg0 === 'job';
    if (!session && inApp) router.replace('/sign-in');
    else if (session && seg0 === 'sign-in') router.replace('/(tabs)/queue');
  }, [session, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.carbon }, animation: 'fade' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: C.carbon }} />;
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Gate />
    </AuthProvider>
  );
}
