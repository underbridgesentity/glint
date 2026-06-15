import { useRouter } from 'expo-router';
import { ScrollView, View, Text, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useQueue, Job } from '../../lib/queries';
import { Card, Pill, Dot, Progress, CarGlyph, Icon, C, text } from '@glint/mobile-ui';

const SHIFT_TARGET = 12;

export default function Queue() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobs, done, loading, reload } = useQueue();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => { setRefreshing(true); await reload(); setRefreshing(false); }, [reload]);

  if (loading) return <View style={{ flex: 1, backgroundColor: C.carbon, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.lemon} /></View>;

  const active = jobs.find((j) => j.status === 'in_progress');
  const upNext = jobs.filter((j) => j.status !== 'in_progress');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.carbon }} contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 28 }} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.lemon} />}>
      {/* header */}
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.lemon }} />
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: -0.6, color: C.white }}>Glint</Text>
        </View>
        <Pill tone="lemon"><><Dot /><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: C.lemon }}> On shift</Text></></Pill>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
        <Text style={text.meta}>Katherine &amp; West · 06:30–16:30</Text>
        <Text style={[text.h1, { fontSize: 28, marginTop: 6 }]}>Today's queue</Text>
      </View>

      {/* shift progress */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        <Card style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <Text style={text.meta}>Washes complete</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', color: C.white }}><Text style={{ color: C.lemon, fontSize: 18 }}>{done.length}</Text> / {SHIFT_TARGET}</Text>
          </View>
          <Progress pct={(done.length / SHIFT_TARGET) * 100} />
        </Card>
      </View>

      {active && (
        <>
          <Text style={[text.label, { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10 }]}>In progress</Text>
          <View style={{ paddingHorizontal: 20 }}><JobCard job={active} active onPress={() => router.push(`/job/${active.id}`)} /></View>
        </>
      )}

      <Text style={[text.label, { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }]}>Up next · {upNext.length}</Text>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {upNext.map((j) => <JobCard key={j.id} job={j} onPress={() => router.push(`/job/${j.id}`)} />)}
        {upNext.length === 0 && !active && <Text style={[text.body, { fontSize: 14 }]}>Nothing queued. Enjoy the breather.</Text>}
      </View>
    </ScrollView>
  );
}

function JobCard({ job, active, onPress }: { job: Job; active?: boolean; onPress: () => void }) {
  const time = job.scheduled_for ? new Date(job.scheduled_for).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : '—';
  const carName = job.car ? `${job.car.make} ${job.car.model}` : 'Vehicle';
  const cust = job.customer?.first_name || job.customer?.full_name || 'Customer';
  return (
    <Pressable onPress={onPress} style={{
      borderRadius: 12, padding: 16, gap: 14,
      backgroundColor: active ? C.lemonDim : C.carbonMid,
      borderWidth: 1, borderColor: active ? C.lemonBorder : C.carbonBorder,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <View style={{ width: 56, height: 38, backgroundColor: C.carbon, borderRadius: 7, alignItems: 'center', justifyContent: 'center' }}><CarGlyph tone={job.car?.tone} size={46} /></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15.5, color: C.white }}>{carName}</Text>
          <Text numberOfLines={1} style={text.meta}>{job.car?.color} · {cust}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: C.white }}>{time}</Text>
          <Text style={text.meta}>{job.tier}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: C.carbonBorder }}>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Icon name="pin" size={15} color={C.mist} /><Text style={{ fontSize: 12, color: C.mist, fontFamily: 'Inter_400Regular' }}>{job.site?.bays}</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Icon name={job.key_mode === 'no_key' ? 'car' : 'key'} size={15} color={C.mist} /><Text style={{ fontSize: 12, color: C.mist, fontFamily: 'Inter_400Regular' }}>{job.key_mode === 'no_key' ? 'No key' : 'Lockbox'}</Text></View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: C.lemon }}>{active ? 'Continue' : 'Start'}</Text>
          <Icon name="chevR" size={16} color={C.lemon} />
        </View>
      </View>
    </Pressable>
  );
}
