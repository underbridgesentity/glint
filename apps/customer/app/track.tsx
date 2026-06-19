import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import type { Wash } from '@glint/types';
import { useWash } from '../lib/queries';
import { supabase } from '../lib/supabase';
import { Card, Pill, Dot, Button, Progress, C, text } from '../components/ui';
import { Icon } from '../components/Icon';

const STAGES = [
  { key: 'booked', label: 'Booked', sub: 'Slot reserved' },
  { key: 'checked_in', label: 'Checked in', sub: 'Car received at the bay' },
  { key: 'in_progress', label: 'Wash in progress', sub: 'On the floor' },
  { key: 'ready', label: 'Ready to collect', sub: 'Show your code' },
  { key: 'collected', label: 'Collected', sub: 'All done' },
];
const ORDER = ['booked', 'scheduled', 'checked_in', 'in_progress', 'ready', 'collected', 'done'];
const rank = (s: string) => Math.max(0, ORDER.indexOf(s === 'scheduled' ? 'booked' : s === 'done' ? 'collected' : s));

function fmtSlot(iso: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Big light card holding the QR - needs a light background to scan. */
function PassCode({ label, code, qrValue }: { label: string; code: string | null; qrValue: string }) {
  return (
    <Card style={{ padding: 22, alignItems: 'center', backgroundColor: C.lemonDim, borderColor: C.lemonBorder }}>
      <Text style={[text.label, { marginBottom: 16 }]}>{label}</Text>
      <View style={{ backgroundColor: C.white, padding: 14, borderRadius: 16 }}>
        <QRCode value={qrValue} size={172} color={C.carbon} backgroundColor={C.white} />
      </View>
      <Text style={[text.meta, { marginTop: 18 }]}>or give the code</Text>
      <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 40, letterSpacing: 8, color: C.lemon, marginTop: 2 }}>{code ?? '----'}</Text>
    </Card>
  );
}

export default function Track() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wash, reload } = useWash(id);

  if (!wash) {
    return <View style={{ flex: 1, backgroundColor: C.carbon, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.lemon} /></View>;
  }

  const status = wash.status;
  const isBooked = status === 'booked' || status === 'scheduled';
  const isActive = status === 'checked_in' || status === 'in_progress';
  const isReady = status === 'ready';
  const isDone = status === 'collected' || status === 'done';
  const cur = rank(status);

  const heading = isBooked ? 'Your drop-off pass'
    : isActive ? `${wash.tier} wash\nin progress.`
    : isReady ? 'Ready to collect.'
    : 'Collected. Spotless.';

  const rate = async (n: number) => { await supabase.from('washes').update({ rating: n }).eq('id', wash.id); reload(); };

  // Demo helpers to walk the lifecycle without the technician app.
  const advance = async (to: Wash['status'], extra: Record<string, unknown> = {}) => {
    await supabase.from('washes').update({ status: to, ...extra }).eq('id', wash.id); reload();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.carbon, width: '100%', maxWidth: 640, alignSelf: 'center' }} contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()} style={{ marginLeft: -4 }}><Icon name="chevL" size={24} color={C.white} /></Pressable>
        <Text style={[text.label, { color: C.steel }]}>Wash #{wash.id.slice(-4).toUpperCase()} · {wash.bay_label ?? 'Bay TBD'}</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 }}>
        <Pill tone="lemon"><><Dot /><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: C.lemon }}> {STAGES[Math.min(cur, 4)].label}</Text></></Pill>
        <Text style={[text.h1, { fontSize: 30, marginTop: 14 }]}>{heading}</Text>
      </View>

      {/* Drop-off pass */}
      {isBooked && (
        <View style={{ paddingHorizontal: 20, gap: 14, paddingTop: 8 }}>
          <Text style={[text.body, { fontSize: 14.5 }]}>Drive to the Glint bay and show this at check-in. {wash.key_mode === 'lockbox' ? 'Hand your key to the attendant.' : 'No key needed. Exterior only.'}</Text>
          <PassCode label="Drop-off code" code={wash.drop_off_code} qrValue={`glint://wash/${wash.id}?drop=${wash.drop_off_code}`} />
          <Card style={{ padding: 16, gap: 12 }}>
            <Row icon="calendar" label="Slot" value={fmtSlot(wash.scheduled_for)} />
            <Row icon={wash.key_mode === 'lockbox' ? 'key' : 'car'} label="Key" value={wash.key_mode === 'lockbox' ? 'Leaving key at the bay' : 'Keeping key (exterior)'} />
          </Card>
          <Button label="I've dropped off (demo)" variant="solid" onPress={() => advance('checked_in', { checked_in_at: new Date().toISOString() })} block />
        </View>
      )}

      {/* Live */}
      {isActive && (
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <Card style={{ padding: 18, marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <Text style={text.meta}>Progress</Text>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: C.lemon }}>{wash.pct}%</Text>
            </View>
            <Progress pct={wash.pct} />
          </Card>
          <Timeline cur={cur} />
          <Text style={[text.meta, { textAlign: 'center', marginTop: 18 }]}>We'll notify you the moment it's ready to collect.</Text>
          <Button label="Mark ready (demo)" variant="solid" onPress={() => advance('ready', { ready_at: new Date().toISOString(), pct: 100 })} block style={{ marginTop: 14 }} />
        </View>
      )}

      {/* Ready - collection pass */}
      {isReady && (
        <View style={{ paddingHorizontal: 20, gap: 14, paddingTop: 8 }}>
          <Text style={[text.body, { fontSize: 14.5 }]}>Your car is done. Show this code at the bay to collect. It's released only to you.</Text>
          <PassCode label="Collection code" code={wash.collection_code} qrValue={`glint://wash/${wash.id}?collect=${wash.collection_code}`} />
          <ProofGrid />
          <Button label="Collected (demo)" onPress={() => advance('collected', { collected_at: new Date().toISOString() })} block />
        </View>
      )}

      {/* Done */}
      {isDone && (
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <Text style={[text.label, { marginBottom: 12 }]}>Proof of finish</Text>
          <ProofGrid />
          <Card style={{ marginTop: 16, padding: 18, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: C.white, marginBottom: 12 }}>How was this wash?</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable key={i} onPress={() => rate(i)}>
                  <Icon name="star" size={32} color={i <= (wash.rating ?? 0) ? C.lemon : C.carbonBorder} fill={i <= (wash.rating ?? 0) ? C.lemon : 'none'} stroke={1.5} />
                </Pressable>
              ))}
            </View>
            <Text style={[text.meta, { marginTop: 10 }]}>{wash.rating ? `Thanks. Rated ${wash.rating}/5.` : 'Below 3 triggers a free re-wash.'}</Text>
          </Card>
          <Button label="Done" onPress={() => router.replace('/(tabs)/home')} block style={{ marginTop: 14 }} />
        </View>
      )}
    </ScrollView>
  );
}

function Row({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Icon name={icon} size={17} color={C.steel} />
      <Text style={[text.meta, { width: 44 }]}>{label}</Text>
      <Text numberOfLines={1} style={{ flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 14, color: C.white }}>{value}</Text>
    </View>
  );
}

function Timeline({ cur }: { cur: number }) {
  return (
    <View style={{ paddingLeft: 2 }}>
      {STAGES.map((s, i) => {
        const done = i < cur;
        const active = i === cur;
        const last = i === STAGES.length - 1;
        return (
          <View key={s.key} style={{ flexDirection: 'row', gap: 15 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
                backgroundColor: done ? C.lemon : active ? C.lemonDim : C.carbonRaise,
                borderWidth: 1, borderColor: done || active ? C.lemonBorder : C.carbonBorder }}>
                {done ? <Icon name="check" size={15} color={C.carbon} stroke={3} /> : <Dot c={active ? C.lemon : C.steel} />}
              </View>
              {!last && <View style={{ width: 2, flex: 1, minHeight: 22, backgroundColor: done ? C.lemonBorder : C.carbonBorder }} />}
            </View>
            <View style={{ paddingBottom: last ? 0 : 14, flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: done || active ? C.white : C.steel }}>{s.label}</Text>
              <Text style={[text.meta, { marginTop: 1 }]}>{s.sub}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ProofGrid() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {['Before', 'After', 'Interior', 'Wheels'].map((l) => (
        <View key={l} style={{ width: '48%', aspectRatio: 4 / 3, borderRadius: 8, backgroundColor: C.carbonMid, borderWidth: 1, borderColor: C.carbonBorder, justifyContent: 'flex-end', padding: 10 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: C.lemon }}>{l}</Text>
        </View>
      ))}
    </View>
  );
}
