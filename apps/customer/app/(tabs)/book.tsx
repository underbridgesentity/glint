import { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { ServiceTier, Site, Car, Subscription } from '@glint/types';
import { fmtR } from '@glint/types';
import { supabase } from '../../lib/supabase';
import { fetchBookingCtx, fetchDayLoad, createBooking } from '../../lib/queries';
import { Card, Pill, Button, CarGlyph, C, text } from '../../components/ui';
import { Icon } from '../../components/Icon';

const PLAN_TIER: Record<string, string> = { premium: 'Full', basic: 'Express' };

function genSlots(day: Date, open: string, close: string, mins: number) {
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  const t = new Date(day); t.setHours(oh, om, 0, 0);
  const end = new Date(day); end.setHours(ch, cm, 0, 0);
  const out: Date[] = [];
  while (t < end) { out.push(new Date(t)); t.setMinutes(t.getMinutes() + mins); }
  return out;
}

export default function Book() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<Site | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [tiers, setTiers] = useState<ServiceTier[]>([]);

  const [mode, setMode] = useState<'once' | 'plan'>('once');
  const [tierId, setTierId] = useState('full');
  const [carId, setCarId] = useState<string | null>(null);
  const [keyMode, setKeyMode] = useState<'lockbox' | 'no_key'>('lockbox');
  const [dayIdx, setDayIdx] = useState(0);
  const [slotISO, setSlotISO] = useState<string | null>(null);
  const [load, setLoad] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      const [ctx, t] = await Promise.all([fetchBookingCtx(), supabase.from('service_tiers').select('*').order('sort')]);
      setSite(ctx.site); setCars(ctx.cars); setSub(ctx.subscription);
      setCarId(ctx.cars[0]?.id ?? null);
      setTiers((t.data ?? []) as ServiceTier[]);
      if (ctx.subscription) setMode('plan');
      setLoading(false);
    })();
  }, []);

  const days = useMemo(() => [0, 1, 2].map((d) => { const x = new Date(); x.setDate(x.getDate() + d); x.setHours(0, 0, 0, 0); return x; }), []);
  const day = days[dayIdx];

  useEffect(() => {
    if (!site) return;
    const start = new Date(day); const end = new Date(day); end.setDate(end.getDate() + 1);
    fetchDayLoad(site.id, start.toISOString(), end.toISOString()).then(setLoad);
    setSlotISO(null);
  }, [site, dayIdx]);

  const slots = useMemo(() => {
    if (!site) return [];
    const now = new Date();
    return genSlots(day, site.open_time, site.close_time, site.slot_minutes).map((s) => {
      const next = new Date(s.getTime() + site.slot_minutes * 60000);
      const taken = load.filter((iso) => { const t = new Date(iso); return t >= s && t < next; }).length;
      return { date: s, iso: s.toISOString(), full: taken >= site.capacity, past: s <= now };
    });
  }, [site, day, load]);

  if (loading) return <View style={{ flex: 1, backgroundColor: C.carbon, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.lemon} /></View>;

  const planTier = sub ? PLAN_TIER[sub.plan_id] ?? 'Full' : 'Full';
  const usingPlan = mode === 'plan' && !!sub;
  const tier = tiers.find((t) => t.id === tierId);
  const chosenTierName = usingPlan ? planTier : tier?.name ?? 'Full';
  const priceCents = usingPlan ? 0 : tier?.price_cents ?? 0;
  const canBook = !!carId && !!site && !!slotISO;

  const confirm = async () => {
    if (!canBook || !carId || !site || !slotISO) return;
    setBooking(true);
    const id = await createBooking({ carId, siteId: site.id, tier: chosenTierName, priceCents, keyMode, slotISO, isSubscription: usingPlan });
    setBooking(false);
    if (id) router.replace({ pathname: '/track', params: { id } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.carbon }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={text.label}>Book a wash</Text>
          <Text style={[text.h1, { fontSize: 30, marginTop: 8 }]}>When suits{'\n'}you?</Text>
          {site && <Text style={[text.meta, { marginTop: 8 }]}>At {site.name} · {site.area}</Text>}
        </View>

        {/* mode */}
        {sub && (
          <Seg style={{ marginHorizontal: 20, marginTop: 18 }}
            options={[{ v: 'plan', l: 'My plan' }, { v: 'once', l: 'One-off' }]}
            value={mode} onChange={(v) => setMode(v as 'once' | 'plan')} />
        )}

        {/* service */}
        <Section title="Service" />
        {usingPlan ? (
          <View style={{ paddingHorizontal: 20 }}>
            <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: C.lemonBorder }}>
              <View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: C.carbonRaise, alignItems: 'center', justifyContent: 'center' }}><Icon name="repeat" size={19} color={C.lemon} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: C.white }}>{planTier} wash · covered</Text>
                <Text style={text.meta}>Included in your {sub!.plan_id} plan</Text>
              </View>
              <Pill tone="lemon">R0</Pill>
            </Card>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {tiers.map((t) => {
              const on = tierId === t.id;
              return (
                <Pressable key={t.id} onPress={() => setTierId(t.id)}>
                  <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: on ? C.lemonBorder : C.carbonBorder, backgroundColor: on ? C.lemonDim : C.carbonMid }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: C.white }}>{t.name}</Text>
                      <Text numberOfLines={1} style={text.meta}>{t.description}</Text>
                    </View>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: on ? C.lemon : C.white }}>{fmtR(t.price_cents)}</Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* car */}
        {cars.length > 0 && (
          <>
            <Section title="Vehicle" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
              {cars.map((c) => {
                const on = carId === c.id;
                return (
                  <Pressable key={c.id} onPress={() => setCarId(c.id)}>
                    <Card style={{ width: 150, padding: 14, borderColor: on ? C.lemonBorder : C.carbonBorder, backgroundColor: on ? C.lemonDim : C.carbonMid }}>
                      <CarGlyph tone={c.tone} size={48} />
                      <Text numberOfLines={1} style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: C.white, marginTop: 10 }}>{c.make} {c.model}</Text>
                      <Text numberOfLines={1} style={text.meta}>{c.plate}</Text>
                    </Card>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* key */}
        <Section title="Key" />
        <Seg style={{ marginHorizontal: 20 }}
          options={[{ v: 'lockbox', l: 'Leave key (full)' }, { v: 'no_key', l: 'Keep key (exterior)' }]}
          value={keyMode} onChange={(v) => setKeyMode(v as 'lockbox' | 'no_key')} />
        <Text style={[text.meta, { paddingHorizontal: 20, marginTop: 8 }]}>
          {keyMode === 'lockbox' ? 'Hand your key at the bay - code-verified, returned only to you.' : 'Exterior only - keep your key, no handover.'}
        </Text>

        {/* when */}
        <Section title="Day" />
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20 }}>
          {days.map((d, i) => {
            const on = dayIdx === i;
            const label = i === 0 ? 'Today' : d.toLocaleDateString('en-ZA', { weekday: 'short' });
            return (
              <Pressable key={i} onPress={() => setDayIdx(i)} style={{ flex: 1 }}>
                <View style={{ paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: on ? C.lemon : C.carbonMid, borderWidth: 1, borderColor: on ? C.lemon : C.carbonBorder }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: on ? C.carbon : C.white }}>{label}</Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: on ? C.carbon : C.steel, marginTop: 2 }}>{d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Section title="Time" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 }}>
          {slots.map((s) => {
            const disabled = s.full || s.past;
            const on = slotISO === s.iso;
            return (
              <Pressable key={s.iso} disabled={disabled} onPress={() => setSlotISO(s.iso)}>
                <View style={{
                  paddingVertical: 10, paddingHorizontal: 14, borderRadius: 9, borderWidth: 1,
                  backgroundColor: on ? C.lemon : disabled ? 'transparent' : C.carbonMid,
                  borderColor: on ? C.lemon : C.carbonBorder, opacity: disabled ? 0.35 : 1,
                }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13.5, color: on ? C.carbon : C.white }}>
                    {s.date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          {slots.length === 0 && <Text style={[text.body, { fontSize: 14 }]}>No slots for this day.</Text>}
        </View>
      </ScrollView>

      {/* sticky confirm */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: insets.bottom + 16, backgroundColor: C.carbonMid, borderTopWidth: 1, borderTopColor: C.carbonBorder }}>
        <Button
          label={canBook ? `Confirm · ${chosenTierName}${priceCents ? ' · ' + fmtR(priceCents) : ' · R0'}` : 'Pick a time slot'}
          onPress={confirm} disabled={!canBook} loading={booking} block
          icon={canBook ? <Icon name="check" size={18} color={C.carbon} stroke={2.5} /> : undefined} />
      </View>
    </View>
  );
}

function Section({ title }: { title: string }) {
  return <Text style={[text.h3, { fontSize: 16, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 10 }]}>{title}</Text>;
}

function Seg({ options, value, onChange, style }: { options: { v: string; l: string }[]; value: string; onChange: (v: string) => void; style?: object }) {
  return (
    <View style={[{ flexDirection: 'row', gap: 3, padding: 3, backgroundColor: C.carbonRaise, borderRadius: 10, borderWidth: 1, borderColor: C.carbonBorder }, style]}>
      {options.map((o) => {
        const on = o.v === value;
        return (
          <Pressable key={o.v} onPress={() => onChange(o.v)} style={{ flex: 1 }}>
            <View style={{ paddingVertical: 9, borderRadius: 7, alignItems: 'center', backgroundColor: on ? C.white : 'transparent' }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: on ? C.carbon : C.mist }}>{o.l}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
