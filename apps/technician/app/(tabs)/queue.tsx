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
  const { toCheckIn, working, toCollect, done, loading, reload } = useQueue();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => { setRefreshing(true); await reload(); setRefreshing(false); }, [reload]);

  if (loading) return <View style={{ flex: 1, backgroundColor: C.carbon, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.lemon} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.carbon }} contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 28 }} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.lemon} />}>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.lemon }} />
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: -0.6, color: C.white }}>Glint</Text>
        </View>
        <Pill tone="lemon"><><Dot /><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: C.lemon }}> On shift</Text></></Pill>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
        <Text style={text.meta}>Katherine &amp; West · drop-off bay</Text>
        <Text style={[text.h1, { fontSize: 28, marginTop: 6 }]}>Station board</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        <Card style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <Text style={text.meta}>Collected today</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', color: C.white }}><Text style={{ color: C.lemon, fontSize: 18 }}>{done.length}</Text> / {SHIFT_TARGET}</Text>
          </View>
          <Progress pct={(done.length / SHIFT_TARGET) * 100} />
        </Card>
      </View>

      <Group title="Ready for collection" count={toCollect.length} hot>
        {toCollect.map((j) => <JobCard key={j.id} job={j} action="Release" hot onPress={() => router.push(`/job/${j.id}`)} />)}
      </Group>
      <Group title="In progress" count={working.length}>
        {working.map((j) => <JobCard key={j.id} job={j} action="Continue" onPress={() => router.push(`/job/${j.id}`)} />)}
      </Group>
      <Group title="To check in" count={toCheckIn.length}>
        {toCheckIn.map((j) => <JobCard key={j.id} job={j} action="Check in" onPress={() => router.push(`/job/${j.id}`)} />)}
      </Group>

      {toCollect.length + working.length + toCheckIn.length === 0 && (
        <Text style={[text.body, { fontSize: 14, paddingHorizontal: 20, paddingTop: 8 }]}>Nothing in the queue. Enjoy the breather.</Text>
      )}
    </ScrollView>
  );
}

function Group({ title, count, hot, children }: { title: string; count: number; hot?: boolean; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <>
      <Text style={[text.label, { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, color: hot ? C.lemon : C.steel }]}>{title} · {count}</Text>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>{children}</View>
    </>
  );
}

function JobCard({ job, action, hot, onPress }: { job: Job; action: string; hot?: boolean; onPress: () => void }) {
  const time = job.scheduled_for ? new Date(job.scheduled_for).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : '—';
  const carName = job.car ? `${job.car.make} ${job.car.model}` : 'Vehicle';
  const cust = job.customer?.first_name || job.customer?.full_name || 'Customer';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{
      borderRadius: 12, padding: 16, gap: 14, backgroundColor: hot ? C.lemonDim : C.carbonMid,
      borderWidth: 1, borderColor: hot ? C.lemonBorder : C.carbonBorder,
    }, pressed && { opacity: 0.92 }]}>
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
          <Meta icon="pin" text={job.bay_label ?? 'Bay TBD'} />
          <Meta icon={job.key_mode === 'no_key' ? 'car' : 'key'} text={job.key_mode === 'no_key' ? 'No key' : 'Has key'} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: C.lemon }}>{action}</Text>
          <Icon name="chevR" size={16} color={C.lemon} />
        </View>
      </View>
    </Pressable>
  );
}

function Meta({ icon, text: t }: { icon: any; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={15} color={C.mist} /><Text style={{ fontSize: 12, color: C.mist, fontFamily: 'Inter_400Regular' }}>{t}</Text>
    </View>
  );
}
