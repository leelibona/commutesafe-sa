import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Icon from '../components/Icon';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { SkeletonRow } from '../components/Skeleton';
import { useToast, friendlyError } from '../components/Toast';
import { useT } from '../i18n/LanguageContext';
import { normalisePlate, validatePlate } from '../utils/validation';
import { timeAgo } from '../utils/time';
import {
  arrivedMessage, openSms, openWhatsApp, shareText, tripMessage,
} from '../utils/messaging';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

function elapsed(start) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(start).getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

export default function TripScreen({ navigation }) {
  const t = useT();
  const toast = useToast();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0];

  const [trip, setTrip] = useState(undefined); // undefined = loading, null = none
  const [history, setHistory] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [origin, setOrigin] = useState('Cape Town CBD');
  const [destination, setDestination] = useState('');
  const [registration, setRegistration] = useState('');
  const [selected, setSelected] = useState([]);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    const [a, h, c] = await Promise.allSettled([
      api.get('/trips/active'), api.get('/trips'), api.get('/contacts'),
    ]);
    setTrip(a.status === 'fulfilled' ? a.value.data : null);
    if (h.status === 'fulfilled') setHistory(h.value.data.filter(x => x.status !== 'active').slice(0, 5));
    if (c.status === 'fulfilled') {
      setContacts(c.value.data);
      setSelected(sel => (sel.length ? sel : c.value.data.slice(0, 1).map(x => x.contact_id)));
    }
    if (a.status === 'rejected') {
      toast.show('Could not load trips', { type: 'error', message: friendlyError(a.reason) });
    }
  }, [toast]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Update the "x min" timer once a minute
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const chosen = contacts.filter(c => selected.includes(c.contact_id));
  const toggle = (id) => setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));

  // Send the message to chosen contacts (WhatsApp for the first, or the share sheet if none)
  const sendTo = async (message) => {
    if (chosen.length === 1) return openWhatsApp(chosen[0].phone, message);
    const shared = await shareText(message);
    if (!shared && chosen[0]) openSms(chosen[0].phone, message);
    return null;
  };

  const start = async () => {
    const next = {
      origin: origin.trim() ? '' : 'Where are you starting from?',
      destination: destination.trim() ? '' : 'Where are you going?',
      registration: validatePlate(registration),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setBusy(true);
    try {
      const { data } = await api.post('/trips', {
        origin: origin.trim(),
        destination: destination.trim(),
        registration_number: normalisePlate(registration) || null,
        shared_with: chosen.map(c => c.name),
      });
      setTrip(data);
      toast.show('Trip started', { type: 'success', message: 'Now send the details to your contact.' });
      await sendTo(tripMessage(data, firstName));
    } catch (e) {
      toast.show('Could not start trip', { type: 'error', message: friendlyError(e) });
    } finally { setBusy(false); }
  };

  const arrive = async () => {
    setBusy(true);
    try {
      await api.patch(`/trips/${trip.trip_id}/arrive`);
      const done = trip;
      setTrip(null);
      setDestination(''); setRegistration('');
      toast.show('Glad you made it!', { type: 'success', message: 'Let your contacts know you arrived.' });
      await sendTo(arrivedMessage(done));
      load();
    } catch (e) {
      toast.show('Could not update trip', { type: 'error', message: friendlyError(e) });
    } finally { setBusy(false); }
  };

  const cancelTrip = async () => {
    setBusy(true);
    try {
      await api.patch(`/trips/${trip.trip_id}/cancel`);
      setTrip(null);
      toast.show('Trip cancelled', { type: 'info' });
      load();
    } catch (e) {
      toast.show('Could not cancel trip', { type: 'error', message: friendlyError(e) });
    } finally { setBusy(false); }
  };

  if (trip === undefined) {
    return (
      <Screen tabbed={false} contentStyle={{ padding: spacing.lg }}>
        {[0, 1, 2].map(i => <SkeletonRow key={i} />)}
      </Screen>
    );
  }

  // ── Active trip ────────────────────────────────────────────────
  if (trip) {
    return (
      <Screen tabbed={false} contentStyle={{ padding: spacing.lg }}>
        <View style={[styles.activeCard, shadows.lg]}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{t('trip.active')}</Text>
            <Text style={styles.elapsed}>{elapsed(trip.started_at)}</Text>
          </View>
          <View style={styles.legs}>
            <View style={styles.legCol}>
              <View style={[styles.legDot, { backgroundColor: '#fff' }]} />
              <View style={styles.legBar} />
              <View style={[styles.legDot, styles.legDotEnd]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.legText}>{trip.origin}</Text>
              <Text style={[styles.legText, { marginTop: 18 }]}>{trip.destination}</Text>
            </View>
          </View>
          {trip.registration_number ? (
            <View style={styles.plate}><Text style={styles.plateText}>{trip.registration_number}</Text></View>
          ) : null}
          {trip.shared_with?.length ? (
            <Text style={styles.sharedWith}>
              Shared with {trip.shared_with.join(', ')}
            </Text>
          ) : null}
        </View>

        <PrimaryButton title={t('trip.arrived')} icon="checkmark-circle" onPress={arrive} loading={busy} style={{ marginTop: spacing.xl, backgroundColor: colors.success }} />
        <PrimaryButton title={t('trip.shareAgain')} icon="share-social-outline" variant="secondary" onPress={() => sendTo(tripMessage(trip, firstName))} style={{ marginTop: spacing.md }} />
        <PrimaryButton title={t('trip.cancel')} variant="ghost" onPress={cancelTrip} style={{ marginTop: spacing.sm }} />

        <View style={styles.tip}>
          <Icon name="alert-circle-outline" size={18} color={colors.danger} />
          <Text style={styles.tipText}>Feel unsafe? Use the SOS tab to alert emergency services immediately.</Text>
        </View>
      </Screen>
    );
  }

  // ── New trip form ──────────────────────────────────────────────
  return (
    <Screen tabbed={false} contentStyle={{ padding: spacing.lg }}>
      <Text style={styles.subtitle}>{t('trip.subtitle')}</Text>

      <Card>
        <TextField
          label={t('trip.from')} icon="radio-button-on-outline" value={origin} error={errors.origin}
          onChangeText={(v) => { setOrigin(v); setErrors(e => ({ ...e, origin: '' })); }}
          placeholder="e.g. Cape Town CBD" style={{ marginTop: 0 }}
        />
        <TextField
          label={t('trip.to')} icon="flag-outline" value={destination} error={errors.destination}
          onChangeText={(v) => { setDestination(v); setErrors(e => ({ ...e, destination: '' })); }}
          placeholder="e.g. Bellville"
        />
        <TextField
          label={t('report.registration')} hint={t('common.optional')} icon="car-outline"
          value={registration} error={errors.registration} autoCapitalize="characters"
          onChangeText={(v) => { setRegistration(v); setErrors(e => ({ ...e, registration: '' })); }}
          placeholder="e.g. CA 847-211"
        />

        <Text style={styles.label}>{t('trip.shareWith')}</Text>
        {contacts.length ? (
          <View style={styles.chips}>
            {contacts.map(c => (
              <Chip
                key={c.contact_id}
                label={c.name}
                icon={selected.includes(c.contact_id) ? 'checkmark' : 'person-outline'}
                selected={selected.includes(c.contact_id)}
                onPress={() => toggle(c.contact_id)}
              />
            ))}
          </View>
        ) : (
          <Pressable onPress={() => navigation.navigate('Contacts')} style={styles.addContacts}>
            <Icon name="person-add-outline" size={18} color={colors.primary} />
            <Text style={styles.addContactsText}>Add emergency contacts first, or share with anyone using the share sheet.</Text>
          </Pressable>
        )}
      </Card>

      <PrimaryButton title={t('trip.start')} icon="navigate" onPress={start} loading={busy} style={{ marginTop: spacing.xl }} />

      {history.length > 0 && (
        <>
          <Text style={styles.section}>{t('trip.history')}</Text>
          {history.map(h => (
            <View key={h.trip_id} style={[styles.historyRow, shadows.sm]}>
              <Icon
                name={h.status === 'arrived' ? 'checkmark-circle' : 'close-circle-outline'}
                size={20}
                color={h.status === 'arrived' ? colors.success : colors.textMuted}
              />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.historyText} numberOfLines={1}>{h.origin} → {h.destination}</Text>
                <Text style={type.caption}>{timeAgo(h.started_at)} · {h.status === 'arrived' ? 'Arrived' : 'Cancelled'}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...type.body, color: colors.textMuted, marginBottom: spacing.lg },
  label: { ...type.label, marginTop: spacing.lg, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  addContacts: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.primaryLight,
  },
  addContactsText: { flex: 1, marginLeft: spacing.sm, fontSize: 13, color: colors.primaryDark },
  section: { ...type.heading, marginTop: spacing.xl, marginBottom: spacing.md },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  historyText: { fontSize: 14, fontWeight: '600', color: colors.text },

  activeCard: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl },
  liveRow: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4ADE80', marginRight: 8 },
  liveText: { ...type.overline, color: '#fff', flex: 1 },
  elapsed: { color: colors.textOnPrimaryMuted, fontWeight: '700' },
  legs: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl },
  legCol: { alignItems: 'center', marginRight: spacing.md },
  legDot: { width: 12, height: 12, borderRadius: 6 },
  legDotEnd: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#fff' },
  legBar: { width: 2, height: 28, backgroundColor: 'rgba(255,255,255,0.4)', marginVertical: 3 },
  legText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  plate: {
    alignSelf: 'flex-start', marginTop: spacing.xl, backgroundColor: '#fff',
    borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 2, borderColor: colors.text,
  },
  plateText: { fontWeight: '800', letterSpacing: 1.5, color: colors.text },
  sharedWith: { color: colors.textOnPrimaryMuted, marginTop: spacing.md, fontSize: 13 },
  tip: {
    flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, padding: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.dangerLight,
  },
  tipText: { flex: 1, marginLeft: spacing.sm, fontSize: 13, color: colors.dangerDark },
});
