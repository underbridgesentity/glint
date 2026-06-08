import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fmtR } from '@glint/types';
import { useLiveWash } from '../lib/queries';
import { supabase } from '../lib/supabase';
import { Card, Pill, Dot, Button, Progress, Avatar, C, text } from '../components/ui';
import { Icon } from '../components/Icon';

const STATUS_COPY: Record<string, string> = {
  scheduled: 'Scheduled', arrived: 'Team arrived', in_progress: 'In progress', done: 'Done',
};

export default function Track() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wash, steps, reload } = useLiveWash(id);

  if (!wash) {
    return <View style={{ flex: 1, backgroundColor: C.carbon, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.lemon} /></View>;
  }

  const done = wash.status === 'done';

  const rate = async (n: number) => {
    await supabase.from('washes').update({ rating: n }).eq('id', wash.id);
    reload();
  };

  // Demo helper: advance the wash to done so the proof state is visible end-to-end.
  const simulateFinish = async () => {
    await supabase.from('washes').update({ status: 'done', pct: 100 }).eq('id', wash.id);
    await supabase.from('wash_steps').update({ done: true, active: false }).eq('wash_id', wash.id);
    reload();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.carbon }} contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()} style={{ marginLeft: -4 }}><Icon name="chevL" size={24} color={C.white} /></Pressable>
        <Text style={[text.label, { color: C.steel }]}>Wash {wash.id.slice(0, 8)}</Text>
      </View>

      {/* status hero */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
        <Pill tone="lemon"><><Dot /><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: C.lemon }}> {STATUS_COPY[wash.status] ?? 'In progress'}</Text></></Pill>
        <Text style={[text.h1, { fontSize: 32, marginTop: 14 }]}>{done ? "Clean.\nYou weren't there." : `${wash.tier} wash\nin progress.`}</Text>
        <Text style={[text.body, { marginTop: 12 }]}>
          {done ? 'Finished. Proof below.' : 'We’ll let you know the moment it’s done.'}
        </Text>
      </View>

      {/* progress */}
      {!done && (
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <Card style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <Text style={text.meta}>Progress</Text>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: C.lemon }}>{wash.pct}%</Text>
            </View>
            <Progress pct={wash.pct} />
          </Card>
        </View>
      )}

      {/* timeline */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          const greenDone = done || s.done;
          const activeNow = !done && s.active;
          return (
            <View key={s.id} style={{ flexDirection: 'row', gap: 15 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: greenDone ? C.lemon : activeNow ? C.lemonDim : C.carbonRaise,
                  borderWidth: 1, borderColor: greenDone || activeNow ? C.lemonBorder : C.carbonBorder,
                }}>
                  {greenDone ? <Icon name="check" size={15} color={C.carbon} stroke={3} /> : <Dot c={activeNow ? C.lemon : C.steel} />}
                </View>
                {!last && <View style={{ width: 2, flex: 1, minHeight: 28, backgroundColor: greenDone ? C.lemonBorder : C.carbonBorder }} />}
              </View>
              <View style={{ paddingBottom: last ? 0 : 18, flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: greenDone || activeNow ? C.white : C.steel }}>{s.label}</Text>
                  <Text style={text.meta}>{s.at_label}</Text>
                </View>
                <Text style={[text.meta, { marginTop: 2 }]}>{s.sub}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* key mode */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name={wash.key_mode === 'no_key' ? 'car' : 'key'} size={16} color={C.steel} />
        <Text style={{ color: C.steel, fontSize: 13, fontFamily: 'Inter_400Regular' }}>
          {wash.key_mode === 'no_key' ? 'No-key wash · exterior, car stays locked' : 'Keys in Glint lockbox'}
        </Text>
      </View>

      {/* done: proof + rating */}
      {done ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Text style={[text.label, { marginBottom: 12 }]}>Proof of finish</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['Before', 'After', 'Interior', 'Wheels'].map((l) => (
              <View key={l} style={{ width: '48%', aspectRatio: 4 / 3, borderRadius: 8, backgroundColor: C.carbonMid, borderWidth: 1, borderColor: C.carbonBorder, justifyContent: 'flex-end', padding: 10 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: C.lemon }}>{l}</Text>
              </View>
            ))}
          </View>

          <Card style={{ marginTop: 16, padding: 18, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: C.white, marginBottom: 12 }}>How was this wash?</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable key={i} onPress={() => rate(i)}>
                  <Icon name="star" size={32} color={i <= (wash.rating ?? 0) ? C.lemon : C.carbonBorder} fill={i <= (wash.rating ?? 0) ? C.lemon : 'none'} stroke={1.5} />
                </Pressable>
              ))}
            </View>
            <Text style={[text.meta, { marginTop: 10 }]}>{wash.rating ? `Thanks. Rated ${wash.rating}/5.` : 'Rating below 3 triggers a free re-wash.'}</Text>
          </Card>

          <Button label="Done" onPress={() => router.replace('/(tabs)/home')} block style={{ marginTop: 14 }} />
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Button label="Simulate finish (demo)" variant="solid" icon={<Icon name="bolt" size={17} color={C.white} />} onPress={simulateFinish} block />
          <Text style={[text.meta, { textAlign: 'center', marginTop: 10 }]}>You'll get a notification the moment it's done.</Text>
        </View>
      )}
    </ScrollView>
  );
}
