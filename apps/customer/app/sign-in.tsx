import { useState } from 'react';
import { View, Text, TextInput, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, C } from '../components/ui';
import { text } from '../lib/theme';

export default function SignIn() {
  const [email, setEmail] = useState('thabo.m@meridian.co.za');
  const [password, setPassword] = useState('glint1234');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    setBusy(false);
  };

  const input = {
    backgroundColor: C.carbonRaise, color: C.white, borderWidth: 1, borderColor: C.carbonBorder,
    borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: 'Inter_400Regular',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.carbon }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.lemon }} />
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -0.6, color: C.white }}>Glint</Text>
        </View>
        <Text style={[text.h1, { fontSize: 30 }]}>Welcome back.</Text>
        <Text style={[text.body, { marginBottom: 8 }]}>Sign in to track your wash and manage your plan.</Text>

        <TextInput style={input} value={email} onChangeText={setEmail} placeholder="Email"
          placeholderTextColor={C.steel} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={input} value={password} onChangeText={setPassword} placeholder="Password"
          placeholderTextColor={C.steel} secureTextEntry />

        {err && <Text style={{ color: C.alert, fontSize: 13, fontFamily: 'Inter_500Medium' }}>{err}</Text>}

        <Button label="Sign in" onPress={submit} loading={busy} block style={{ marginTop: 8 }} />
        <Text style={[text.meta, { textAlign: 'center', marginTop: 4 }]}>Demo: thabo.m@meridian.co.za · glint1234</Text>
      </View>
    </SafeAreaView>
  );
}
