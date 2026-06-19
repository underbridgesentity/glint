import { useState } from 'react';
import { View, Text, TextInput, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Button, C, text } from '../components/ui';

type Mode = 'phone' | 'email';

export default function SignIn() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('phone');
  const [phone, setPhone] = useState('+27 ');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('thabo.m@meridian.co.za');
  const [password, setPassword] = useState('glint1234');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Normalise any SA input to E.164: strip spaces, country code, and the
  // leading 0, then re-prefix +27.  "+27 060 349 8403" / "060 349 8403" → "+27603498403"
  const localDigits = phone.replace(/\D/g, '').replace(/^27/, '').replace(/^0+/, '');
  const e164 = '+27' + localDigits;
  const phoneValid = localDigits.length === 9;

  const postAuth = async () => {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    const { data: p } = await supabase.from('profiles').select('full_name').eq('id', uid).single();
    if (p?.full_name) router.replace('/(tabs)/home');
    else router.replace('/onboarding');
  };

  const sendCode = async () => {
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setBusy(false);
    if (error) {
      // SMS isn't wired up yet on the backend — point people at email meanwhile.
      const provider = /provider|not enabled|unsupported/i.test(error.message);
      setErr(provider ? 'SMS sign-in is not available yet. Use Email to continue.' : error.message);
    } else setOtpSent(true);
  };
  const verify = async () => {
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.verifyOtp({ phone: e164, token: otp.trim(), type: 'sms' });
    setBusy(false);
    if (error) setErr(error.message);
    else postAuth();
  };
  const emailSignIn = async () => {
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr(error.message);
    else postAuth();
  };

  const input = { backgroundColor: C.carbonRaise, color: C.white, borderWidth: 1, borderColor: C.carbonBorder, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontFamily: 'Inter_500Medium' as const };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.carbon }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.lemon }} />
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -0.6, color: C.white }}>Glint</Text>
        </View>
        <Text style={[text.h1, { fontSize: 30 }]}>Clean car,{'\n'}zero effort.</Text>
        <Text style={[text.body, { marginBottom: 8 }]}>Sign in to book, track, and collect.</Text>

        {/* method toggle */}
        <View style={{ flexDirection: 'row', gap: 3, padding: 3, backgroundColor: C.carbonRaise, borderRadius: 10, borderWidth: 1, borderColor: C.carbonBorder }}>
          {(['phone', 'email'] as Mode[]).map((m) => {
            const on = mode === m;
            return (
              <Pressable key={m} onPress={() => { setMode(m); setErr(null); setOtpSent(false); }} style={{ flex: 1 }}>
                <View style={{ paddingVertical: 9, borderRadius: 7, alignItems: 'center', backgroundColor: on ? C.white : 'transparent' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13.5, color: on ? C.carbon : C.mist }}>{m === 'phone' ? 'Phone' : 'Email'}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {mode === 'phone' && !otpSent && (
          <>
            <TextInput style={input} value={phone} onChangeText={setPhone} placeholder="+27 82 123 4567" placeholderTextColor={C.steel} keyboardType="phone-pad" />
            <Button label="Send code" onPress={sendCode} loading={busy} block disabled={!phoneValid} />
            <Text style={[text.meta, { textAlign: 'center' }]}>We'll text you a one-time code.</Text>
          </>
        )}
        {mode === 'phone' && otpSent && (
          <>
            <Text style={[text.meta, { marginTop: -4 }]}>Code sent to {e164}</Text>
            <TextInput style={[input, { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: 8, textAlign: 'center' }]} value={otp} onChangeText={setOtp} placeholder="000000" placeholderTextColor={C.steel} keyboardType="number-pad" maxLength={6} />
            <Button label="Verify & continue" onPress={verify} loading={busy} block disabled={otp.length < 6} />
            <Pressable onPress={() => setOtpSent(false)}><Text style={[text.meta, { textAlign: 'center' }]}>Change number</Text></Pressable>
          </>
        )}
        {mode === 'email' && (
          <>
            <TextInput style={input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={C.steel} autoCapitalize="none" keyboardType="email-address" />
            <TextInput style={input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={C.steel} secureTextEntry />
            <Button label="Sign in" onPress={emailSignIn} loading={busy} block />
            <Text style={[text.meta, { textAlign: 'center' }]}>Demo: thabo.m@meridian.co.za · glint1234</Text>
          </>
        )}

        {err && <Text style={{ color: C.alert, fontSize: 13, fontFamily: 'Inter_500Medium', textAlign: 'center' }}>{err}</Text>}
      </View>
    </SafeAreaView>
  );
}
