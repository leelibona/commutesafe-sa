import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, Easing, Platform, ActivityIndicator, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../api/client';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import PrimaryButton from '../components/PrimaryButton';
import { useToast, friendlyError } from '../components/Toast';
import { getCurrentPlace } from '../utils/location';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

const SERVICES = [
  { name: 'SAPS', number: '10111', icon: 'shield-outline' },
  { name: 'Netcare 911', number: '082 911', icon: 'medkit-outline' },
  { name: 'ER24', number: '084 124', icon: 'pulse-outline' },
];

const BTN = 200;
const COUNTDOWN = 3;

function PulseRing({ delay, color = colors.danger }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [v, delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        { backgroundColor: color },
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }],
        },
      ]}
    />
  );
}

const call = (number) => Linking.openURL(`tel:${number.replace(/\s/g, '')}`).catch(() => {});

export default function SosScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  // idle → counting → sending → sent
  const [phase, setPhase] = useState('idle');
  const [count, setCount] = useState(COUNTDOWN);
  const [sent, setSent] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const startCountdown = () => {
    setPhase('counting');
    setCount(COUNTDOWN);
    let n = COUNTDOWN;
    timer.current = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(timer.current);
        sendSOS();
      } else {
        setCount(n);
      }
    }, 1000);
  };

  const cancel = () => {
    clearInterval(timer.current);
    setPhase('idle');
    toast.show('SOS cancelled', { type: 'info', message: 'No alert was sent.' });
  };

  const sendSOS = async () => {
    setPhase('sending');
    let coords = { latitude: null, longitude: null };
    let label = null;
    try {
      const place = await getCurrentPlace();
      coords = { latitude: place.latitude, longitude: place.longitude };
      label = place.label;
    } catch {
      // Still send the alert without a location rather than failing
    }
    try {
      const { data } = await api.post('/sos', coords);
      setSent({ notified: data.notified || [], at: new Date(), label });
      setPhase('sent');
    } catch (e) {
      setPhase('idle');
      toast.show('SOS failed', { type: 'error', message: `${friendlyError(e)} Call 10111 directly.`, duration: 6000 });
    }
  };

  const counting = phase === 'counting';
  const sending = phase === 'sending';

  if (phase === 'sent' && sent) {
    return (
      <Screen background="#F4FBF6" contentStyle={{ paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.xl }}>
        <View style={styles.sentIcon}><Icon name="checkmark" size={48} color="#fff" /></View>
        <Text style={[styles.title, { marginTop: spacing.lg }]}>Alert sent</Text>
        <Text style={styles.subtitle}>
          Sent at {sent.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {sent.label ? ` from ${sent.label}` : ' (location unavailable)'}.
          Stay where it's safe and keep your phone on.
        </Text>

        <View style={[styles.sentCard, shadows.sm]}>
          <Text style={styles.notifyLabelLeft}>NOTIFIED</Text>
          {sent.notified.map(n => (
            <View key={n} style={styles.notifiedRow}>
              <Icon name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.notifiedText}>{n}</Text>
            </View>
          ))}
        </View>

        <PrimaryButton title="Call SAPS 10111" icon="call" danger onPress={() => call('10111')} style={{ marginTop: spacing.xl }} />
        <PrimaryButton title="I'm safe now" variant="secondary" onPress={() => { setPhase('idle'); setSent(null); }} style={{ marginTop: spacing.md }} />
      </Screen>
    );
  }

  return (
    <Screen background="#FFF8F8" contentStyle={{ paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.xl }}>
      <Text style={styles.overline}>EMERGENCY</Text>
      <Text style={styles.title}>{counting ? 'Sending alert…' : 'Need help now?'}</Text>
      <Text style={styles.subtitle}>
        {counting
          ? 'Tap Cancel if you pressed this by mistake.'
          : 'Press the button to share your live location with emergency responders.'}
      </Text>

      <View style={styles.btnArea}>
        {phase === 'idle' && <PulseRing delay={0} />}
        {phase === 'idle' && <PulseRing delay={1200} />}
        <Pressable
          onPress={phase === 'idle' ? startCountdown : undefined}
          disabled={phase !== 'idle'}
          accessibilityRole="button"
          accessibilityLabel="Send SOS alert"
          style={({ pressed }) => [styles.sosOuter, shadows.lg, pressed && { transform: [{ scale: 0.96 }] }]}
        >
          <View style={styles.sosInner}>
            {sending ? (
              <>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.sosSending}>Sending…</Text>
              </>
            ) : counting ? (
              <>
                <Text style={styles.countText}>{count}</Text>
                <Text style={styles.sosHint}>Sending in {count}s</Text>
              </>
            ) : (
              <>
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.sosHint}>Tap to alert</Text>
              </>
            )}
          </View>
        </Pressable>
      </View>

      {counting ? (
        <PrimaryButton title="Cancel" icon="close" variant="secondary" onPress={cancel} />
      ) : (
        <View style={styles.banner}>
          <Icon name="warning-outline" size={18} color={colors.warningDark} />
          <Text style={styles.bannerText}>
            For genuine emergencies only. False alerts may delay responses to others.
          </Text>
        </View>
      )}

      <Text style={styles.notifyLabel}>This alert will notify · tap to call</Text>
      <View style={styles.services}>
        {SERVICES.map(s => (
          <Pressable
            key={s.name}
            onPress={() => call(s.number)}
            style={({ pressed }) => [styles.service, shadows.sm, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.serviceIcon}><Icon name={s.icon} size={20} color={colors.danger} /></View>
            <Text style={styles.serviceName} numberOfLines={1}>{s.name}</Text>
            <Text style={styles.serviceNumber}>{s.number}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  overline: { ...type.overline, color: colors.danger, textAlign: 'center' },
  title: { ...type.title, fontSize: 28, textAlign: 'center', marginTop: 4 },
  subtitle: { ...type.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.lg },

  btnArea: { height: BTN * 1.6, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: BTN, height: BTN, borderRadius: BTN / 2 },
  sosOuter: { width: BTN, height: BTN, borderRadius: BTN / 2, backgroundColor: '#FCA5A5', padding: 10 },
  sosInner: {
    flex: 1, borderRadius: BTN / 2,
    backgroundColor: colors.danger,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)',
  },
  sosText: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  countText: { fontSize: 64, fontWeight: '900', color: '#fff' },
  sosHint: { fontSize: 13, color: '#FEE2E2', marginTop: 2, fontWeight: '600' },
  sosSending: { color: '#fff', marginTop: 8, fontWeight: '700' },

  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderWidth: 1, borderColor: '#FBE3B3',
    padding: spacing.md, borderRadius: radius.md,
  },
  bannerText: { flex: 1, fontSize: 12, color: colors.warningDark, lineHeight: 17, marginLeft: spacing.sm },

  notifyLabel: { ...type.overline, textAlign: 'center', marginTop: spacing.xl, marginBottom: spacing.md },
  services: { flexDirection: 'row', gap: spacing.sm },
  service: {
    flex: 1, alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md, paddingHorizontal: 4, borderRadius: radius.md,
  },
  serviceIcon: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.dangerLight,
    alignItems: 'center', justifyContent: 'center',
  },
  serviceName: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 6 },
  serviceNumber: { ...type.caption, fontSize: 11 },

  sentIcon: {
    alignSelf: 'center', width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.xl,
  },
  sentCard: { marginTop: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  notifyLabelLeft: { ...type.overline, marginBottom: spacing.sm },
  notifiedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  notifiedText: { marginLeft: spacing.sm, fontSize: 15, fontWeight: '600', color: colors.text },
});