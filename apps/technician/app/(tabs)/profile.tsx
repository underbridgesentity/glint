import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Profile as P } from '@glint/types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { Card, StatBlock, Avatar, Icon, IconName, C, text } from '@glint/mobile-ui';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [me, setMe] = useState<P | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (uid) supabase.from('profiles').select('*').eq('id', uid).single().then((r) => setMe(r.data as P));
    });
  }, []);

  const rows: [IconName, string, string | null, boolean][] = [
    ['clock', 'Shift hours', '06:30 – 16:30', false],
    ['pin', 'Site', 'Katherine & West · Sandton', false],
    ['shield', 'Certifications', 'Glint Academy · 15-point', false],
    ['logout', 'End shift', null, true],
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.carbon }} contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 }}>
        <Avatar name={me?.full_name ?? ''} size={62} lemon />
        <View>
          <Text style={[text.h3, { fontSize: 20 }]}>{me?.full_name ?? '—'}</Text>
          <Text style={text.meta}>Washer · GT-114</Text>
          <Text style={text.meta}>Katherine &amp; West</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Card style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-around' }}>
          <StatBlock value="★ 4.9" label="Rating" accent />
          <View style={{ width: 1, backgroundColor: C.carbonBorder }} />
          <StatBlock value="312" label="Washes" />
          <View style={{ width: 1, backgroundColor: C.carbonBorder }} />
          <StatBlock value="Cert." label="Academy" />
        </Card>
      </View>

      <Text style={[text.label, { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }]}>Shift</Text>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {rows.map(([ic, title, sub, danger]) => (
          <Pressable key={title} onPress={danger ? signOut : undefined}>
            <Card style={{ padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
              <View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: C.carbonRaise, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ic} size={18} color={danger ? C.alert : C.mist} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14.5, color: danger ? C.alert : C.white }}>{title}</Text>
                {sub && <Text style={text.meta}>{sub}</Text>}
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
