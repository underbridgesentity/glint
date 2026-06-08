import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Invoice, PaymentMethod } from '@glint/types';
import { fmtR } from '@glint/types';
import { supabase } from '../../lib/supabase';
import { Card, Pill, C, text } from '../../components/ui';
import { Icon } from '../../components/Icon';

export default function Wallet() {
  const insets = useSafeAreaInsets();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      const [inv, pm] = await Promise.all([
        supabase.from('invoices').select('*').eq('customer_id', uid).order('issued_on', { ascending: false }),
        supabase.from('payment_methods').select('*').eq('customer_id', uid).order('is_primary', { ascending: false }),
      ]);
      setInvoices((inv.data ?? []) as Invoice[]);
      setMethods((pm.data ?? []) as PaymentMethod[]);
    })();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.carbon }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={text.label}>Wallet</Text>
        <Text style={[text.h1, { fontSize: 30, marginTop: 8 }]}>Payments &amp;{'\n'}invoices.</Text>
      </View>

      {/* payment methods */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 10 }}>
        {methods.map((m) => (
          <Card key={m.id} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
            <View style={{ width: 38, height: 38, borderRadius: 9, backgroundColor: C.carbonRaise, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="wallet" size={19} color={C.lemon} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14.5, color: C.white }}>{m.brand} ·· {m.last4}</Text>
              <Text style={[text.meta, { marginTop: 1 }]}>Expires {m.exp}</Text>
            </View>
            {m.is_primary && <Pill tone="neutral">Primary</Pill>}
          </Card>
        ))}
      </View>

      {/* invoices */}
      <Text style={[text.h3, { fontSize: 17, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 }]}>Invoices</Text>
      <View style={{ paddingHorizontal: 20 }}>
        {invoices.map((inv) => (
          <View key={inv.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.carbonBorder }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14.5, color: C.white }}>{inv.label}</Text>
              <Text style={text.meta}>{inv.ref} · {new Date(inv.issued_on).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: C.white }}>{fmtR(inv.amount_cents)}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: C.lemon, textTransform: 'capitalize' }}>{inv.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
