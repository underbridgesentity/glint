import { useState } from 'react';
import { View, Text, TextInput, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Button, C, text } from '../components/ui';

type Tab = 'in' | 'up';

export default function SignIn() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('in');
  const [email, setEmail] = useState('thabo.m@meridian.co.za');
  const [password, setPassword] = useState('glint1234');
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const switchTab = (t: Tab) => {
    setTab(t); setErr(null); setInfo(null);
    if (t === 'up') { setEmail(''); setPassword(''); }
    else { setEmail('thabo.m@meridian.co.za'); setPassword('glint1234'); }
  };

  const postAuth = async () => {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    const { data: p } = await supabase.from('profiles').select('full_name').eq('id', uid).single();
    if (p?.full_name) router.replace('/(tabs)/home');
    else router.replace('/onboarding');
  };

  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6;

  const submit = async () => {
    setBusy(true); setErr(null); setInfo(null);
    if (tab === 'in') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (error) setErr(error.message); else postAuth();
    } else {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      setBusy(false);
      if (error) { setErr(error.message); return; }
      if (data.session) postAuth();
      else setInfo('Account created. Check your email to confirm, then sign in.');
    }
  };

  const input = { backgroundColor: C.carbonRaise, color: C.white, borderWidth: 1, borderColor: C.carbonBorder, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontFamily: 'Inter_500Medium' as const };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.carbon }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 14, width: '100%', maxWidth: 440, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.lemon }} />
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -0.6, color: C.white }}>Glint</Text>
        </View>
        <Text style={[text.h1, { fontSize: 30 }]}>{tab === 'in' ? 'Clean car,\nzero effort.' : 'Create your\naccount.'}</Text>
        <Text style={[text.body, { marginBottom: 8 }]}>
          {tab === 'in' ? 'Sign in to book, track, and collect.' : 'Book, track, and collect your washes.'}
        </Text>

        {/* sign in / create account */}
        <View style={{ flexDirection: 'row', gap: 3, padding: 3, backgroundColor: C.carbonRaise, borderRadius: 10, borderWidth: 1, borderColor: C.carbonBorder }}>
          {([['in', 'Sign in'], ['up', 'Create account']] as [Tab, string][]).map(([t, l]) => {
            const on = tab === t;
            return (
              <Pressable key={t} onPress={() => switchTab(t)} style={{ flex: 1 }}>
                <View style={{ paddingVertical: 9, borderRadius: 7, alignItems: 'center', backgroundColor: on ? C.white : 'transparent' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13.5, color: on ? C.carbon : C.mist }}>{l}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <TextInput style={input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={C.steel} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
        <TextInput style={input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={C.steel} secureTextEntry />

        <Button label={tab === 'in' ? 'Sign in' : 'Create account'} onPress={submit} loading={busy} block disabled={!valid} />

        {tab === 'up' && !info && <Text style={[text.meta, { textAlign: 'center' }]}>At least 6 characters.</Text>}
        {tab === 'in' && !err && <Text style={[text.meta, { textAlign: 'center' }]}>Demo: thabo.m@meridian.co.za · glint1234</Text>}
        {info && <Text style={{ color: C.lemon, fontSize: 13, fontFamily: 'Inter_500Medium', textAlign: 'center' }}>{info}</Text>}
        {err && <Text style={{ color: C.alert, fontSize: 13, fontFamily: 'Inter_500Medium', textAlign: 'center' }}>{err}</Text>}
      </View>
    </SafeAreaView>
  );
}
