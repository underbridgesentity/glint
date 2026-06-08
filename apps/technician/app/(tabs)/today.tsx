import { ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueue } from '../../lib/queries';
import { Card, Highlight, StatBlock, RatingDots, Icon, C, text } from '@glint/mobile-ui';

const SHIFT_TARGET = 12;

export default function Today() {
  const insets = useSafeAreaInsets();
  const { done } = useQueue();
  const litres = done.reduce((s, j) => s + (j.litres_saved ?? 0), 0);
  const remaining = Math.max(0, SHIFT_TARGET - done.length);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.carbon }} contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}><Text style={[text.h1, { fontSize: 28 }]}>Today</Text></View>

      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-around' }}>
          <StatBlock value={done.length} label="Washed" accent />
          <View style={{ width: 1, backgroundColor: C.carbonBorder }} />
          <StatBlock value={remaining} label="Remaining" />
          <View style={{ width: 1, backgroundColor: C.carbonBorder }} />
          <StatBlock value="4.9" label="Avg rating" />
        </Card>
      </View>

      <Text style={[text.label, { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }]}>Completed today</Text>
      <View style={{ paddingHorizontal: 20 }}>
        {done.map((d) => (
          <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.carbonBorder }}>
            <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: C.carbonRaise, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={18} color={C.lemon} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14.5, color: C.white }}>{d.car ? `${d.car.make} ${d.car.model}` : 'Vehicle'}</Text>
              <Text style={text.meta}>{d.customer?.first_name ?? 'Customer'} · {d.tier}</Text>
            </View>
            {d.rating ? <RatingDots value={d.rating} size={12} /> : null}
          </View>
        ))}
        {done.length === 0 && <Text style={[text.body, { fontSize: 14 }]}>No washes logged yet today.</Text>}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <Highlight style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><Icon name="leaf" size={16} color={C.lemon} /><Text style={text.label}>Water saved today</Text></View>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 30, color: C.lemon }}>{litres.toLocaleString()} L</Text>
          <Text style={[text.body, { fontSize: 13, marginTop: 6 }]}>Waterless on every wash. No runoff, no hose.</Text>
        </Highlight>
      </View>
    </ScrollView>
  );
}
