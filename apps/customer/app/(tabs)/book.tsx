import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ServiceTier, Plan } from '@glint/types';
import { fmtR } from '@glint/types';
import { supabase } from '../../lib/supabase';
import { Card, Pill, Button, C, text } from '../../components/ui';
import { Icon } from '../../components/Icon';

// Glint business WhatsApp line — booking is WhatsApp-native (per product decision).
const WHATSAPP = 'https://wa.me/27820000000?text=' + encodeURIComponent("Hi Glint, I'd like to book a wash");

export default function Book() {
  const insets = useSafeAreaInsets();
  const [tiers, setTiers] = useState<ServiceTier[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tab, setTab] = useState<'once' | 'plan'>('once');

  useEffect(() => {
    supabase.from('service_tiers').select('*').order('sort').then((r) => setTiers((r.data ?? []) as ServiceTier[]));
    supabase.from('plans').select('*').order('sort').then((r) => setPlans((r.data ?? []) as Plan[]));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.carbon }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={text.label}>Book a wash</Text>
        <Text style={[text.h1, { fontSize: 30, marginTop: 8 }]}>Pick how you{'\n'}want to roll.</Text>
      </View>

      {/* segmented */}
      <View style={{ flexDirection: 'row', gap: 3, margin: 20, padding: 3, backgroundColor: C.carbonRaise, borderRadius: 10, borderWidth: 1, borderColor: C.carbonBorder }}>
        {(['once', 'plan'] as const).map((t) => (
          <Text key={t} onPress={() => setTab(t)} style={{
            flex: 1, textAlign: 'center', paddingVertical: 9, borderRadius: 7, overflow: 'hidden',
            fontFamily: 'Inter_600SemiBold', fontSize: 13.5,
            backgroundColor: tab === t ? C.white : 'transparent', color: tab === t ? C.carbon : C.mist,
          }}>{t === 'once' ? 'One-off' : 'Subscription'}</Text>
        ))}
      </View>

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {(tab === 'once' ? tiers : plans).map((item) => {
          const isPlan = 'period' in item;
          return (
            <Card key={item.id} style={{ padding: 18, borderColor: item.popular ? C.lemonBorder : C.carbonBorder }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={[text.h3, { fontSize: 19 }]}>{item.name}</Text>
                {item.popular && <Pill tone="lemon">Popular</Pill>}
              </View>
              <Text style={[text.body, { fontSize: 14 }]}>{item.description}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 28, color: C.white, letterSpacing: -1 }}>{fmtR(item.price_cents)}</Text>
                <Text style={text.meta}>{isPlan ? `/${(item as Plan).period}` : `· ${(item as ServiceTier).mins} min`}</Text>
              </View>
              <View style={{ marginTop: 14, gap: 7 }}>
                {item.includes.slice(0, 4).map((inc) => (
                  <View key={inc} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                    <Icon name="check" size={15} color={C.lemon} stroke={2.5} />
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13.5, color: C.mist }}>{inc}</Text>
                  </View>
                ))}
              </View>
            </Card>
          );
        })}
      </View>

      {/* WhatsApp-native booking */}
      <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
        <Button label="Book on WhatsApp" onPress={() => Linking.openURL(WHATSAPP)} block icon={<Icon name="phone" size={17} color={C.carbon} />} />
        <Text style={[text.meta, { textAlign: 'center', marginTop: 10 }]}>
          Booking is WhatsApp-native — confirm your slot, site, and key option in chat.
        </Text>
      </View>
    </ScrollView>
  );
}
