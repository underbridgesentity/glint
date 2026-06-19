import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Site } from '@glint/types';
import { supabase } from '../lib/supabase';
import { Card, Button, CarGlyph, C, text } from '../components/ui';

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [siteId, setSiteId] = useState<string | null>(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from('sites').select('*').eq('status', 'live').order('name').then((r) => {
      setSites((r.data ?? []) as Site[]);
      setLoading(false);
    });
  }, []);

  const canFinish = name.trim().length > 1 && !!siteId && make.trim() && model.trim();

  const finish = async () => {
    if (!canFinish) return;
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) { setBusy(false); return; }
    const first = name.trim().split(' ')[0];
    await supabase.from('profiles').update({ full_name: name.trim(), first_name: first, site_id: siteId }).eq('id', uid);
    await supabase.from('cars').insert({ owner_id: uid, make: make.trim(), model: model.trim(), plate: plate.trim() || null, is_primary: true });
    setBusy(false);
    router.replace('/(tabs)/home');
  };

  const input = { backgroundColor: C.carbonRaise, color: C.white, borderWidth: 1, borderColor: C.carbonBorder, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontFamily: 'Inter_500Medium' as const };

  if (loading) return <View style={{ flex: 1, backgroundColor: C.carbon, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.lemon} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: C.carbon, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 120, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={text.label}>Welcome to Glint</Text>
        <Text style={[text.h1, { fontSize: 30, marginTop: 8 }]}>Let's set you up.</Text>

        <Field label="Your name" />
        <TextInput style={input} value={name} onChangeText={setName} placeholder="Thabo Mokoena" placeholderTextColor={C.steel} />

        <Field label="Your building" />
        <Text style={[text.meta, { marginTop: -6, marginBottom: 10 }]}>Where's the Glint bay you'll use?</Text>
        <View style={{ gap: 8 }}>
          {sites.map((s) => {
            const on = siteId === s.id;
            return (
              <Pressable key={s.id} onPress={() => setSiteId(s.id)}>
                <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: on ? C.lemonBorder : C.carbonBorder, backgroundColor: on ? C.lemonDim : C.carbonMid }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: C.white }}>{s.name}</Text>
                    <Text numberOfLines={1} style={[text.meta, { textTransform: 'capitalize' }]}>{s.type.replace('_', ' ')} · {s.area}</Text>
                  </View>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? C.lemon : C.carbonBorder, backgroundColor: on ? C.lemon : 'transparent' }} />
                </Card>
              </Pressable>
            );
          })}
        </View>

        <Field label="Your car" />
        <Card style={{ padding: 16, gap: 10 }}>
          <CarGlyph tone="#c5c8cd" size={44} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput style={[input, { flex: 1 }]} value={make} onChangeText={setMake} placeholder="Make (BMW)" placeholderTextColor={C.steel} />
            <TextInput style={[input, { flex: 1 }]} value={model} onChangeText={setModel} placeholder="Model (3 Series)" placeholderTextColor={C.steel} />
          </View>
          <TextInput style={input} value={plate} onChangeText={setPlate} placeholder="Plate (CA 123-456)" placeholderTextColor={C.steel} autoCapitalize="characters" />
        </Card>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: insets.bottom + 16, backgroundColor: C.carbonMid, borderTopWidth: 1, borderTopColor: C.carbonBorder }}>
        <Button label={canFinish ? 'Finish setup' : 'Fill in your details'} onPress={finish} loading={busy} disabled={!canFinish} block />
      </View>
    </View>
  );
}

function Field({ label }: { label: string }) {
  return <Text style={[text.h3, { fontSize: 16, paddingTop: 24, paddingBottom: 10 }]}>{label}</Text>;
}
