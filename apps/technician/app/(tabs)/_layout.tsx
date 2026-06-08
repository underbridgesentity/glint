import { Tabs } from 'expo-router';
import { Icon, IconName, color as C } from '@glint/mobile-ui';

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
        tabBarActiveTintColor: C.lemon,
        tabBarInactiveTintColor: C.steel,
        tabBarStyle: { backgroundColor: C.carbonMid, borderTopColor: C.carbonBorder, borderTopWidth: 1, height: 84, paddingTop: 8 },
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginTop: 2 },
      }}
    >
      <Tabs.Screen name="queue" options={{ title: 'Queue', tabBarIcon: tab('list') }} />
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: tab('chart') }} />
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarIcon: tab('user') }} />
    </Tabs>
  );
}
