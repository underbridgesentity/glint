import { useRouter } from 'expo-router';
import { ScrollView, View, Text, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import type { Wash } from '@glint/types';
import { fmtR } from '@glint/types';
import { useHome } from '../../lib/queries';
import { Card, Pill, Dot, Button, Progress, StatBlock, Avatar, CarGlyph, C, text } from '../../components/ui';
import { Icon } from '../../components/Icon';

const STATUS_COPY: Record<string, { tag: string; line: string }> = {
  booked: { tag: 'Booked', line: 'Drop off at your slot.' },
  scheduled: { tag: 'Booked', line: 'Drop off at your slot.' },
  checked_in: { tag: 'Checked in', line: 'Wash starting.' },
  in_progress: { tag: 'In progress', line: 'Wash in progress.' },
  ready: { tag: 'Ready', line: 'Ready to collect.' },
  collected: { tag: 'Collected', line: 'Collected. See you next time.' },
  done: { tag: 'Done', line: 'Clean. Proof attached.' },
};

function fmtSlot(iso: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-ZA', { weekday: 'short' });
  return `${day} · ${d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, reload } = useHome();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  if (loading || !data) {
    return <View style={{ flex: 1, backgroundColor: C.carbon, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.lemon} /></View>;
  }

  const { profile, cars, subscription, liveWash, recent, eco } = data;
  const first = profile?.first_name || 'there';
  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.carbon, width: '100%', maxWidth: 640, alignSelf: 'center' }}
      contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.lemon} />}
    >
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.lemon }} />
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 19, letterSpacing: -0.6, color: C.white }}>Glint</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable onPress={() => router.push('/(tabs)/wallet')}><Icon name="bell" size={22} /></Pressable>
          <Avatar name={profile?.full_name ?? ''} size={34} />
        </View>
      </View>

      {/* Greeting */}
      <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18 }}>
        <Text style={text.meta}>{today} · Katherine &amp; West</Text>
        <Text style={[text.h1, { fontSize: 30, marginTop: 6 }]}>Good morning,{'\n'}{first}.</Text>
      </View>

      {/* Live wash hero */}
      {liveWash && <LiveHero wash={liveWash} carTone={cars.find((c) => c.id === liveWash.car_id)?.tone} carName={carName(cars, liveWash)} onPress={() => router.push({ pathname: '/track', params: { id: liveWash.id } })} />}

      {/* Quick actions */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 14 }}>
        <View style={{ flex: 1 }}><Button label="Book a wash" icon={<Icon name="plus" size={18} color={C.carbon} stroke={2.5} />} onPress={() => router.push('/(tabs)/book')} block /></View>
        <View style={{ flex: 1 }}><Button label="My plan" variant="solid" icon={<Icon name="repeat" size={18} color={C.white} />} onPress={() => router.push('/(tabs)/profile')} block /></View>
      </View>

      {/* Subscription strip */}
      {subscription && (
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Pressable onPress={() => router.push('/(tabs)/profile')}>
            <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
              <View style={{ width: 38, height: 38, borderRadius: 9, backgroundColor: C.carbonRaise, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="repeat" size={20} color={C.lemon} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14.5, color: C.white }}>{cap(subscription.plan_id)} plan · {subscription.days.join(' & ')}</Text>
                <Text style={[text.meta, { marginTop: 1 }]}>Next wash Friday · {fmtR(subscription.price_cents)}/mo</Text>
              </View>
              <Icon name="chevR" size={18} color={C.steel} />
            </Card>
          </Pressable>
        </View>
      )}

      {/* Your cars */}
      <SectionHead title="Your cars" action="Manage" onAction={() => router.push('/(tabs)/profile')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}>
        {cars.map((c) => (
          <Card key={c.id} style={{ width: 184, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <CarGlyph tone={c.tone} size={58} />
              {c.is_primary && <Pill tone="neutral">Primary</Pill>}
            </View>
            <Text numberOfLines={1} style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: C.white, marginTop: 12 }}>{c.make} {c.model}</Text>
            <Text numberOfLines={1} style={[text.meta, { marginTop: 2 }]}>{c.color} · {c.plate}</Text>
          </Card>
        ))}
      </ScrollView>

      {/* Eco impact */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Card style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Icon name="leaf" size={16} color={C.lemon} />
            <Text style={text.label}>Responsible by default</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <StatBlock value={eco.washes} label="Washes" accent />
            <StatBlock value="0" label="Runoff" />
            <StatBlock value="100%" label="Biodegradable" />
          </View>
          <Text style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.carbonBorder, fontFamily: 'Inter_300Light', fontSize: 13, color: C.mist, lineHeight: 21 }}>
            <Text style={text.strong}>Controlled water</Text>, captured so nothing reaches the storm drains. Low-impact products, every wash.
          </Text>
        </Card>
      </View>

      {/* Recent */}
      <SectionHead title="Recent" action="See all" onAction={() => router.push('/(tabs)/wallet')} />
      <View style={{ paddingHorizontal: 20 }}>
        {recent.filter((w) => w.status === 'done').slice(0, 3).map((a) => <ActivityRow key={a.id} a={a} cars={cars} />)}
      </View>
    </ScrollView>
  );
}

function LiveHero({ wash, carTone, carName, onPress }: { wash: Wash; carTone?: string; carName: string; onPress: () => void }) {
  const sc = STATUS_COPY[wash.status] ?? STATUS_COPY.in_progress;
  const isDone = wash.status === 'done' || wash.status === 'collected';
  const isReady = wash.status === 'ready';
  const isActive = wash.status === 'in_progress' || wash.status === 'checked_in';
  const isBooked = wash.status === 'booked' || wash.status === 'scheduled';
  const hot = isReady; // collection moment gets the lemon treatment
  const rightLabel = isDone ? 'View proof' : isReady ? 'Show code' : isBooked ? 'Show pass' : 'Track live';
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Pressable onPress={onPress} style={({ pressed }) => [{
        backgroundColor: hot || isDone ? C.lemonDim : C.carbonMid, borderWidth: 1,
        borderColor: hot || isDone ? C.lemonBorder : C.carbonBorder, borderRadius: 16, padding: 20,
      }, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Pill tone="lemon"><><Dot /><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: C.lemon }}> {sc.tag}</Text></></Pill>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: C.steel, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>{rightLabel}</Text>
            <Icon name="chevR" size={15} color={C.steel} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 64, height: 44, backgroundColor: C.carbon, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            <CarGlyph tone={carTone} size={50} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[text.h3, { fontSize: 21 }]}>{sc.line}</Text>
            <Text style={[text.meta, { marginTop: 4 }]}>{carName} · {wash.tier} wash</Text>
          </View>
        </View>

        {isActive && (
          <View style={{ marginTop: 18 }}>
            <Progress pct={wash.pct} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={text.meta}>Started {fmtTime(wash.started_at)}</Text>
              <Text style={text.meta}>Done ~{fmtTime(wash.eta_done)}</Text>
            </View>
          </View>
        )}
        {isBooked && (
          <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.carbonBorder, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={text.meta}>Drop-off · {fmtSlot(wash.scheduled_for)}</Text>
            <Text style={[text.meta, { color: C.mist }]}>Code <Text style={{ color: C.white, fontFamily: 'Inter_700Bold' }}>{wash.drop_off_code}</Text></Text>
          </View>
        )}
        {isReady && (
          <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.lemonBorder }}>
            <Text style={text.meta}>Show this code to collect</Text>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 34, letterSpacing: 6, color: C.lemon, marginTop: 2 }}>{wash.collection_code}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }}>
      <Text style={[text.h3, { fontSize: 17 }]}>{title}</Text>
      {action && <Text onPress={onAction} style={{ color: C.lemon, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>{action}</Text>}
    </View>
  );
}

function ActivityRow({ a, cars }: { a: Wash; cars: { id: string; make: string; model: string }[] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.carbonBorder }}>
      <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: C.carbonRaise, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={18} color={C.mist} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14.5, color: C.white }}>{a.tier} wash · {carName(cars, a)}</Text>
        <Text style={text.meta}>{fmtDate(a.scheduled_for)}{a.rating ? ` · ${'★'.repeat(a.rating)}` : ''}</Text>
      </View>
      <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: a.is_subscription ? C.steel : C.white }}>
        {a.is_subscription ? 'Plan' : fmtR(a.price_cents)}
      </Text>
    </View>
  );
}

/* helpers */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function carName(cars: { id: string; make: string; model: string }[], w: Wash) {
  const c = cars.find((x) => x.id === w.car_id);
  return c ? `${c.make} ${c.model}` : 'Your car';
}
function fmtTime(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}
