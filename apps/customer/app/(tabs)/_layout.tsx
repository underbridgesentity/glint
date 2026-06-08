import { Tabs } from 'expo-router';
import { Icon, IconName } from '../../components/Icon';
import { color as C } from '../../lib/theme';

function tab(name: IconName) {
  return ({ focused }: { focused: boolean }) => (
    <Icon name={name} size={23} color={focused ? C.lemon : C.steel} stroke={focused ? 2.4 : 2} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: C.lemon,
        tabBarInactiveTintColor: C.steel,
        tabBarStyle: {
          backgroundColor: C.carbonMid,
          borderTopColor: C.carbonBorder,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginTop: 2 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tab('home') }} />
      <Tabs.Screen name="book" options={{ title: 'Book', tabBarIcon: tab('calendar') }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet', tabBarIcon: tab('wallet') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tab('user') }} />
    </Tabs>
  );
}
