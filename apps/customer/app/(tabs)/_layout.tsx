import { useEffect, useState } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { Icon, IconName, color as C } from '@glint/mobile-ui';

/* Read the real viewport width straight from the DOM. react-native-web's
   useWindowDimensions returns a stale width in the static web export, which
   left the desktop sidebar from ever showing; window.innerWidth is accurate. */
function useViewportWidth() {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 0));
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setW(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'home', label: 'Home', icon: 'home' },
  { name: 'book', label: 'Book', icon: 'calendar' },
  { name: 'wallet', label: 'Wallet', icon: 'wallet' },
  { name: 'profile', label: 'Profile', icon: 'user' },
];

function bottomIcon(name: IconName) {
  return ({ focused }: { focused: boolean }) => (
    <Icon name={name} size={23} color={focused ? C.lemon : C.steel} stroke={focused ? 2.4 : 2} />
  );
}

/* Desktop / wide web: a persistent left sidebar we render and control ourselves.
   (react-navigation's tabBarPosition:'left' doesn't re-layout reliably in the
   static web export, so we own the chrome instead.) */
function Sidebar({ active }: { active: string }) {
  const router = useRouter();
  return (
    <View style={{ width: 240, backgroundColor: C.carbonMid, borderRightWidth: 1, borderRightColor: C.carbonBorder, paddingTop: 26, paddingHorizontal: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, marginBottom: 22 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.lemon }} />
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.5, color: C.white }}>Glint</Text>
      </View>
      <View style={{ gap: 4 }}>
        {TABS.map((t) => {
          const on = active === t.name;
          return (
            <Pressable
              key={t.name}
              onPress={() => router.replace(`/(tabs)/${t.name}` as never)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 46, borderRadius: 10, paddingHorizontal: 12, backgroundColor: on ? C.lemonDim : 'transparent' }}
            >
              <Icon name={t.icon} size={22} color={on ? C.lemon : C.steel} stroke={on ? 2.4 : 2} />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14.5, color: on ? C.lemon : C.mist }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const width = useViewportWidth();
  const wide = width > 760;
  const segments = useSegments() as string[];
  const active = segments[1] ?? 'home';

  return (
    <View style={{ flex: 1, flexDirection: wide ? 'row' : 'column', backgroundColor: C.carbon }}>
      {wide && <Sidebar active={active} />}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            // Keep the scene carbon so the area around the centered column isn't pale.
            sceneStyle: { backgroundColor: C.carbon },
            tabBarActiveTintColor: C.lemon,
            tabBarInactiveTintColor: C.steel,
            // On wide web the sidebar above is the nav; hide the bottom bar.
            tabBarStyle: wide
              ? { display: 'none' }
              : { backgroundColor: C.carbonMid, borderTopColor: C.carbonBorder, borderTopWidth: 1, height: 84, paddingTop: 8 },
            tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginTop: 2 },
          }}
        >
          <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: bottomIcon('home') }} />
          <Tabs.Screen name="book" options={{ title: 'Book', tabBarIcon: bottomIcon('calendar') }} />
          <Tabs.Screen name="wallet" options={{ title: 'Wallet', tabBarIcon: bottomIcon('wallet') }} />
          <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: bottomIcon('user') }} />
        </Tabs>
      </View>
    </View>
  );
}
