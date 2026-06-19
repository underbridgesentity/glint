import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { Icon, IconName, color as C } from '@glint/mobile-ui';

function tab(name: IconName) {
  return ({ focused }: { focused: boolean }) => (
    <Icon name={name} size={23} color={focused ? C.lemon : C.steel} stroke={focused ? 2.4 : 2} />
  );
}

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const wide = width > 760; // desktop / wide web → left sidebar instead of a bottom bar

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: C.lemon,
        tabBarInactiveTintColor: C.steel,
        tabBarPosition: wide ? 'left' : 'bottom',
        tabBarLabelPosition: wide ? 'beside-icon' : 'below-icon',
        tabBarStyle: wide
          ? { backgroundColor: C.carbonMid, borderRightColor: C.carbonBorder, borderRightWidth: 1, width: 236, paddingTop: 28, paddingHorizontal: 14 }
          : { backgroundColor: C.carbonMid, borderTopColor: C.carbonBorder, borderTopWidth: 1, height: 84, paddingTop: 8 },
        tabBarItemStyle: wide
          ? { height: 48, borderRadius: 10, justifyContent: 'flex-start', paddingLeft: 12, marginBottom: 4 }
          : undefined,
        tabBarLabelStyle: wide
          ? { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginLeft: 10 }
          : { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginTop: 2 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tab('home') }} />
      <Tabs.Screen name="book" options={{ title: 'Book', tabBarIcon: tab('calendar') }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet', tabBarIcon: tab('wallet') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tab('user') }} />
    </Tabs>
  );
}
