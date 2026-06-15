import { ScrollView, View, Text, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fmtR } from '@glint/types';
import { useHome } from '../../lib/queries';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Card, Pill, Button, Avatar, CarGlyph, C, text } from '../../components/ui';
import { Icon } from '../../components/Icon';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { data } = useHome();
  const { signOut } = useAuth();

  const deleteAccount = () => {
    const run = async () => { await supabase.rpc('delete_my_account'); await signOut(); };
    // Alert is a no-op on web preview; confirm there via window.confirm.
    if (typeof window !== 'undefined' && (window as any).confirm) {
      if ((window as any).confirm('Delete your account? This permanently removes your profile, vehicles, and history.')) run();
      return;
    }
    Alert.alert('Delete account', 'This permanently removes your profile, vehicles, and history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.carbon }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      {/* identity */}
      <View style={{ paddingHorizontal: 20, alignItems: 'center', gap: 12, paddingTop: 8 }}>
        <Avatar name={data?.profile?.full_name ?? ''} size={72} />
        <View style={{ alignItems: 'center' }}>
          <Text style={[text.h2, { fontSize: 22 }]}>{data?.profile?.full_name ?? '—'}</Text>
          <Text style={[text.meta, { marginTop: 2 }]}>{data?.profile?.phone} · {data?.profile?.member_since ? `Member since ${new Date(data.profile.member_since).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}` : ''}</Text>
        </View>
      </View>

      {/* subscription */}
      {data?.subscription && (
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Text style={[text.label, { marginBottom: 10 }]}>Your plan</Text>
          <Card style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[text.h3, { fontSize: 19, textTransform: 'capitalize' }]}>{data.subscription.plan_id} plan</Text>
              <Pill tone="lemon">Active</Pill>
            </View>
            <Text style={[text.meta, { marginTop: 6 }]}>{data.subscription.days.join(' & ')} · {fmtR(data.subscription.price_cents)}/mo</Text>
            <Text style={[text.meta, { marginTop: 2 }]}>Next billing {data.subscription.next_billing} · {data.subscription.billing_card}</Text>
          </Card>
        </View>
      )}

      {/* cars */}
      <Text style={[text.h3, { fontSize: 17, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 10 }]}>Your cars</Text>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {data?.cars.map((c) => (
          <Card key={c.id} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <CarGlyph tone={c.tone} size={54} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: C.white }}>{c.make} {c.model} {c.trim}</Text>
              <Text numberOfLines={1} style={[text.meta, { marginTop: 2 }]}>{c.color} · {c.plate}</Text>
            </View>
            {c.is_primary && <Pill tone="neutral">Primary</Pill>}
          </Card>
        ))}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <Button label="Sign out" variant="ghost" onPress={signOut} block icon={<Icon name="x" size={17} color={C.white} />} />
        <Pressable onPress={deleteAccount} style={{ alignSelf: 'center', paddingVertical: 16 }}>
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: C.alert }}>Delete account</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
