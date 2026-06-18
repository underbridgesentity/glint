import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useJob } from '../../lib/queries';
import { Card, Button, Icon, C, text } from '@glint/mobile-ui';

const PRE_SHOTS = ['Front', 'Rear'];
const POST_SHOTS = ['Exterior', 'Interior', 'Wheels', 'Dash'];

export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { job, checklist, toggleItem, checkIn, addProof, markReady, release } = useJob(id);

  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [codeOk, setCodeOk] = useState(false);
  const [prePhotos, setPrePhotos] = useState<string[]>([]);
  const [postPhotos, setPostPhotos] = useState<string[]>([]);
  const [workStep, setWorkStep] = useState<'checklist' | 'photos'>('checklist');
  const [busy, setBusy] = useState(false);

  if (!job) return <View style={{ flex: 1, backgroundColor: C.carbon, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.lemon} /></View>;

  const carName = job.car ? `${job.car.make} ${job.car.model}` : 'Vehicle';
  const status = job.status;
  const isCheckIn = status === 'booked' || status === 'scheduled';
  const isWork = status === 'checked_in' || status === 'in_progress';
  const isCollect = status === 'ready';
  const isDone = status === 'collected' || status === 'done';

  const checklistComplete = checklist.length > 0 && checklist.every((c) => c.checked);
  const postComplete = postPhotos.length >= POST_SHOTS.length;

  const verifyDrop = () => {
    if (code.trim() === (job.drop_off_code ?? '')) { setCodeOk(true); setErr(null); }
    else setErr('Code doesn’t match. Ask the customer to re-check their pass.');
  };
  const snapPre = (s: string) => { if (!prePhotos.includes(s)) { setPrePhotos((p) => [...p, s]); addProof(s, 'pre'); } };
  const snapPost = (s: string) => { if (!postPhotos.includes(s)) { setPostPhotos((p) => [...p, s]); addProof(s, 'post'); } };
  const start = async () => { setBusy(true); await checkIn(code); setBusy(false); setCode(''); setCodeOk(false); };
  const finish = async () => { setBusy(true); await markReady(); setBusy(false); };
  const doRelease = async () => {
    setBusy(true);
    const ok = await release(code);
    setBusy(false);
    if (!ok) setErr('Collection code doesn’t match. Do not release the car.');
  };

  const input = { backgroundColor: C.carbonRaise, color: C.white, borderWidth: 1, borderColor: err ? C.alert : C.carbonBorder, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 16, fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: 8, textAlign: 'center' as const };

  return (
    <View style={{ flex: 1, backgroundColor: C.carbon }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} style={{ marginLeft: -4 }}><Icon name="chevL" size={24} color={C.white} /></Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: C.white }}>{carName}</Text>
          <Text numberOfLines={1} style={text.meta}>{job.customer?.first_name ?? 'Customer'} · {job.bay_label ?? 'Bay TBD'} · {job.tier}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* CHECK IN */}
        {isCheckIn && !codeOk && (
          <View>
            <Text style={text.label}>Step 1 · Verify drop-off</Text>
            <Text style={[text.h1, { fontSize: 26, marginTop: 12 }]}>Enter the customer’s drop-off code.</Text>
            <Text style={[text.body, { fontSize: 14.5, marginTop: 10, marginBottom: 20 }]}>Ask them to show their pass in the Glint app, or scan the QR.</Text>
            <TextInput style={input} value={code} onChangeText={(t) => { setCode(t); setErr(null); }} placeholder="0000" placeholderTextColor={C.steel} keyboardType="number-pad" maxLength={4} />
            {err && <Text style={{ color: C.alert, fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 10 }}>{err}</Text>}
          </View>
        )}
        {isCheckIn && codeOk && (
          <View>
            <Text style={text.label}>Step 2 · Before photos</Text>
            <Text style={[text.h1, { fontSize: 26, marginTop: 12 }]}>Log the car’s condition.</Text>
            <Text style={[text.body, { fontSize: 14.5, marginTop: 10, marginBottom: 18 }]}>Two quick shots before you start. Protects you and the customer.</Text>
            <PhotoGrid shots={PRE_SHOTS} taken={prePhotos} onSnap={snapPre} cols={2} />
          </View>
        )}

        {/* WORK */}
        {isWork && workStep === 'checklist' && (
          <View>
            <Text style={text.label}>15-point wash</Text>
            <Text style={[text.h1, { fontSize: 26, marginTop: 12, marginBottom: 18 }]}>Work the checklist.</Text>
            <View style={{ gap: 8 }}>
              {checklist.map((it) => (
                <Pressable key={it.id} onPress={() => toggleItem(it)} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 9,
                  backgroundColor: it.checked ? C.lemonDim : C.carbonMid, borderWidth: 1, borderColor: it.checked ? C.lemonBorder : C.carbonBorder }}>
                  <View style={{ width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: it.checked ? C.lemon : 'transparent', borderWidth: 2, borderColor: it.checked ? C.lemon : C.carbonBorder }}>
                    {it.checked && <Icon name="check" size={14} color={C.carbon} stroke={3} />}
                  </View>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: C.white, flex: 1 }}>{it.item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        {isWork && workStep === 'photos' && (
          <View>
            <Text style={text.label}>Proof</Text>
            <Text style={[text.h1, { fontSize: 26, marginTop: 12 }]}>Capture the finish.</Text>
            <Text style={[text.body, { fontSize: 14.5, marginTop: 10, marginBottom: 18 }]}>Four shots. The customer sees these the moment you mark it ready.</Text>
            <PhotoGrid shots={POST_SHOTS} taken={postPhotos} onSnap={snapPost} cols={2} />
          </View>
        )}

        {/* COLLECTION */}
        {isCollect && (
          <View>
            <Text style={text.label}>Release · verify collection</Text>
            <Text style={[text.h1, { fontSize: 26, marginTop: 12 }]}>Enter the customer’s collection code.</Text>
            <Text style={[text.body, { fontSize: 14.5, marginTop: 10, marginBottom: 20 }]}>No matching code, no release. The car goes only to whoever holds it.</Text>
            <TextInput style={input} value={code} onChangeText={(t) => { setCode(t); setErr(null); }} placeholder="0000" placeholderTextColor={C.steel} keyboardType="number-pad" maxLength={4} />
            {err && <Text style={{ color: C.alert, fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 10 }}>{err}</Text>}
            {job.key_mode === 'lockbox' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 16 }}><Icon name="key" size={16} color={C.lemon} /><Text style={{ color: C.mist, fontSize: 13, fontFamily: 'Inter_400Regular' }}>Return the customer’s key with the car.</Text></View>}
          </View>
        )}

        {/* DONE */}
        {isDone && (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <View style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: C.lemon, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={40} color={C.carbon} stroke={3} /></View>
            <Text style={[text.h1, { fontSize: 28, marginTop: 24 }]}>Released.</Text>
            <Text style={[text.body, { fontSize: 15, marginTop: 10, textAlign: 'center' }]}>{job.customer?.first_name ?? 'Customer'} has their car back. Logged and closed.</Text>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={{ padding: 20, paddingBottom: insets.bottom + 14, borderTopWidth: 1, borderTopColor: C.carbonBorder }}>
        {isCheckIn && !codeOk && <Button label="Verify code" block disabled={code.length < 4} onPress={verifyDrop} />}
        {isCheckIn && codeOk && <Button label={prePhotos.length >= PRE_SHOTS.length ? 'Check in · start wash' : `${prePhotos.length} / ${PRE_SHOTS.length} photos`} block disabled={prePhotos.length < PRE_SHOTS.length} loading={busy} onPress={start} />}
        {isWork && workStep === 'checklist' && <Button label={checklistComplete ? 'Checklist done · add proof' : `${checklist.filter((c) => c.checked).length} / ${checklist.length} checked`} block disabled={!checklistComplete} onPress={() => setWorkStep('photos')} />}
        {isWork && workStep === 'photos' && <Button label={postComplete ? 'Mark ready to collect' : `${postPhotos.length} / ${POST_SHOTS.length} photos`} block disabled={!postComplete} loading={busy} onPress={finish} />}
        {isCollect && <Button label="Verify & release car" block disabled={code.length < 4} loading={busy} onPress={doRelease} />}
        {isDone && <Button label="Back to board" block onPress={() => router.replace('/(tabs)/queue')} />}
      </View>
    </View>
  );
}

function PhotoGrid({ shots, taken, onSnap, cols }: { shots: string[]; taken: string[]; onSnap: (s: string) => void; cols: number }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {shots.map((s) => {
        const done = taken.includes(s);
        return (
          <Pressable key={s} onPress={() => onSnap(s)} style={{ width: cols === 2 ? '47.5%' : '100%', aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.carbonMid, borderWidth: 1, borderColor: done ? C.lemonBorder : C.carbonBorder }}>
            <Icon name={done ? 'checkCircle' : 'camera'} size={30} color={done ? C.lemon : C.steel} />
            <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase', color: done ? C.lemon : C.steel }}>{s}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
