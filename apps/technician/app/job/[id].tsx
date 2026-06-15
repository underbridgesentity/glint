import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useJob } from '../../lib/queries';
import { Card, Button, Icon, C, text } from '@glint/mobile-ui';

const PHOTO_SLOTS = ['Before', 'After', 'Interior', 'Wheels'];

type Stage = 'key_out' | 'checklist' | 'photos' | 'done';

export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { job, checklist, toggleItem, setStatus, addProof } = useJob(id);
  const [stage, setStage] = useState<Stage | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  // First render: decide the entry stage and mark the wash in progress.
  useEffect(() => {
    if (!job || stage) return;
    setStage(job.key_mode === 'lockbox' ? 'key_out' : 'checklist');
    if (job.status !== 'in_progress' && job.status !== 'done') setStatus('in_progress', Math.max(job.pct, 10));
  }, [job, stage]);

  if (!job || !stage) return <View style={{ flex: 1, backgroundColor: C.carbon, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.lemon} /></View>;

  const carName = job.car ? `${job.car.make} ${job.car.model}` : 'Vehicle';
  const checklistComplete = checklist.length > 0 && checklist.every((c) => c.checked);
  const photosComplete = photos.length >= PHOTO_SLOTS.length;
  const stepNum = job.key_mode === 'lockbox' ? { checklist: '2', photos: '3' } : { checklist: '1', photos: '2' };

  const snap = (s: string) => { if (!photos.includes(s)) { setPhotos((p) => [...p, s]); addProof(s); } };

  const complete = async () => {
    await setStatus('done', 100);
    setStage('done');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.carbon }}>
      {/* header */}
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} style={{ marginLeft: -4 }}><Icon name="chevL" size={24} color={C.white} /></Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: C.white }}>{carName}</Text>
          <Text numberOfLines={1} style={text.meta}>{job.customer?.first_name ?? 'Customer'} · Bay {job.site?.bays} · {job.tier}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {stage === 'key_out' && (
          <View>
            <Text style={text.label}>Step 1 · Key check-out</Text>
            <Text style={[text.h1, { fontSize: 26, marginTop: 12 }]}>Collect the key.</Text>
            <Text style={[text.body, { fontSize: 14.5, marginTop: 10, marginBottom: 22 }]}>Retrieve from the lockbox and confirm the tag. Logged digitally — no personal info on the tag.</Text>
            <Card style={{ padding: 22, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: C.carbonRaise, alignItems: 'center', justifyContent: 'center' }}><Icon name="key" size={26} color={C.lemon} /></View>
              <View style={{ flex: 1 }}>
                <Text style={text.meta}>Lockbox</Text>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: C.white, letterSpacing: 1 }}>{job.site?.bays}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Icon name="eye" size={15} color={C.mist} /><Text style={{ fontSize: 12, color: C.mist, fontFamily: 'Inter_400Regular' }}>CCTV</Text></View>
            </Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 16 }}>
              <Icon name="shield" size={16} color={C.lemon} /><Text style={{ color: C.steel, fontSize: 13, fontFamily: 'Inter_400Regular' }}>Insurance covers all key-related incidents.</Text>
            </View>
          </View>
        )}

        {stage === 'checklist' && (
          <View>
            <Text style={text.label}>Step {stepNum.checklist} · 15-point wash</Text>
            <Text style={[text.h1, { fontSize: 26, marginTop: 12, marginBottom: 18 }]}>Work the checklist.</Text>
            <View style={{ gap: 8 }}>
              {checklist.map((it) => (
                <Pressable key={it.id} onPress={() => toggleItem(it)} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 9,
                  backgroundColor: it.checked ? C.lemonDim : C.carbonMid,
                  borderWidth: 1, borderColor: it.checked ? C.lemonBorder : C.carbonBorder,
                }}>
                  <View style={{ width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: it.checked ? C.lemon : 'transparent', borderWidth: 2, borderColor: it.checked ? C.lemon : C.carbonBorder }}>
                    {it.checked && <Icon name="check" size={14} color={C.carbon} stroke={3} />}
                  </View>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: C.white, flex: 1 }}>{it.item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {stage === 'photos' && (
          <View>
            <Text style={text.label}>Step {stepNum.photos} · Proof</Text>
            <Text style={[text.h1, { fontSize: 26, marginTop: 12 }]}>Capture proof.</Text>
            <Text style={[text.body, { fontSize: 14.5, marginTop: 10, marginBottom: 20 }]}>Four shots. The customer sees these the moment you finish.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {PHOTO_SLOTS.map((s) => {
                const taken = photos.includes(s);
                return (
                  <Pressable key={s} onPress={() => snap(s)} style={{
                    width: '47.5%', aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 10,
                    backgroundColor: taken ? C.carbonMid : C.carbonMid, borderWidth: 1, borderColor: taken ? C.lemonBorder : C.carbonBorder,
                  }}>
                    <Icon name={taken ? 'checkCircle' : 'camera'} size={30} color={taken ? C.lemon : C.steel} />
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase', color: taken ? C.lemon : C.steel }}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {stage === 'done' && (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <View style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: C.lemon, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={40} color={C.carbon} stroke={3} /></View>
            <Text style={[text.h1, { fontSize: 28, marginTop: 24 }]}>Wash logged.</Text>
            <Text style={[text.body, { fontSize: 15, marginTop: 10, textAlign: 'center' }]}>{job.customer?.first_name ?? 'Customer'} notified. {job.key_mode === 'lockbox' ? 'Return the key to the lockbox.' : 'Car stays locked.'} Proof sent.</Text>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={{ padding: 20, paddingBottom: insets.bottom + 14, borderTopWidth: 1, borderTopColor: C.carbonBorder }}>
        {stage === 'key_out' && <Button label="Key collected · Start wash" block onPress={() => setStage('checklist')} />}
        {stage === 'checklist' && <Button label={checklistComplete ? 'Checklist done · Add proof' : `${checklist.filter((c) => c.checked).length} / ${checklist.length} checked`} block disabled={!checklistComplete} onPress={() => setStage('photos')} />}
        {stage === 'photos' && <Button label={photosComplete ? 'Complete wash' : `${photos.length} / 4 photos`} block disabled={!photosComplete} onPress={complete} />}
        {stage === 'done' && <Button label="Next job" block onPress={() => router.replace('/(tabs)/queue')} />}
      </View>
    </View>
  );
}
