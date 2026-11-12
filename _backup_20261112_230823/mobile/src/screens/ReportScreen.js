import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import api from '../api/client';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import Chip from '../components/Chip';
import Card from '../components/Card';
import ScreenHeader from '../components/ScreenHeader';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { useToast, friendlyError } from '../components/Toast';
import { CATEGORIES, SEVERITIES } from '../theme/categories';
import { normalisePlate, validatePlate } from '../utils/validation';
import { getCurrentPlace } from '../utils/location';
import { colors, radius, riskColors, spacing, type } from '../theme/colors';

const MAX_DESC = 500;

export default function ReportScreen({ navigation }) {
  const toast = useToast();
  const [category, setCategory] = useState('Reckless driving');
  const [severity, setSeverity] = useState(2);
  const [description, setDescription] = useState('');
  const [registration, setRegistration] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCategory('Reckless driving'); setSeverity(2); setDescription('');
    setRegistration(''); setLocation(''); setCoords(null); setErrors({});
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const place = await getCurrentPlace();
      setCoords({ latitude: place.latitude, longitude: place.longitude });
      setLocation(place.label);
      setErrors(e => ({ ...e, location: '' }));
    } catch (e) {
      toast.show('Location unavailable', { type: 'warning', message: e.message });
    } finally { setLocating(false); }
  };

  const submit = async () => {
    const next = {
      registration: validatePlate(registration),
      location: location.trim() ? '' : 'Tell us roughly where this happened',
      description: description.length > MAX_DESC ? `Keep it under ${MAX_DESC} characters` : '',
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      const plate = normalisePlate(registration);
      const { data } = await api.post('/reports', {
        category,
        severity,
        description: description.trim(),
        registration_number: plate || null,
        location: location.trim(),
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
      if (data.flag) {
        toast.show('Report submitted', {
          type: data.flag.status === 'flagged' ? 'warning' : 'success',
          message: `${plate} now has ${data.flag.report_count} report(s). Status: ${data.flag.status.replace('_', ' ')}.`,
          duration: 5000,
        });
      } else {
        toast.show('Report submitted', { type: 'success', message: 'Thank you for keeping commuters safe.' });
      }
      reset();
      navigation.navigate('Home');
    } catch (e) {
      toast.show('Could not submit report', { type: 'error', message: friendlyError(e) });
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <ScreenHeader
        compact
        title="Report an incident"
        subtitle="Your report helps keep other commuters safe. Other users never see your name."
      />

      <View style={styles.body}>
        <Card>
          <Text style={styles.step}>1 · WHAT HAPPENED?</Text>
          <View style={styles.chips}>
            {CATEGORIES.map(c => (
              <Chip
                key={c.key}
                label={c.key}
                icon={c.icon}
                selected={category === c.key}
                onPress={() => setCategory(c.key)}
              />
            ))}
          </View>

          <Text style={[styles.step, { marginTop: spacing.xl }]}>2 · HOW SERIOUS WAS IT?</Text>
          <View style={styles.severityRow}>
            {SEVERITIES.map(s => {
              const active = severity === s.value;
              const rc = riskColors[s.risk];
              return (
                <Pressable
                  key={s.value}
                  onPress={() => setSeverity(s.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.severity,
                    active && { backgroundColor: rc.bg, borderColor: rc.hex },
                  ]}
                >
                  <View style={styles.bars}>
                    {[1, 2, 3].map(b => (
                      <View
                        key={b}
                        style={[
                          styles.bar,
                          { height: 6 + b * 4 },
                          b <= s.value && { backgroundColor: active ? rc.hex : colors.borderStrong },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.severityText, active && { color: rc.text }]}>{s.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.cardGap}>
          <Text style={styles.step}>3 · DETAILS</Text>
          <TextField
            label="Vehicle registration"
            hint="Optional — helps flag repeat offenders"
            error={errors.registration}
            icon="car-outline"
            value={registration}
            onChangeText={(v) => { setRegistration(v); if (errors.registration) setErrors(e => ({ ...e, registration: '' })); }}
            placeholder="e.g. CA 847-211"
            autoCapitalize="characters"
            style={{ marginTop: spacing.sm }}
          />
          <TextField
            label="Location"
            icon="location-outline"
            error={errors.location}
            value={location}
            onChangeText={(v) => { setLocation(v); setCoords(null); if (errors.location) setErrors(e => ({ ...e, location: '' })); }}
            placeholder="e.g. N2 near Woodstock"
            right={
              <Pressable onPress={useMyLocation} disabled={locating} hitSlop={8} style={styles.gpsBtn}>
                {locating
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : <Icon name="locate" size={18} color={colors.primary} />}
              </Pressable>
            }
            hint={coords ? 'GPS location attached' : 'Tap the target icon to use your current location'}
          />
          <TextField
            label="Description"
            value={description}
            error={errors.description}
            onChangeText={setDescription}
            multiline
            maxLength={MAX_DESC + 50}
            placeholder="Describe what happened…"
          />
          <Text style={[styles.counter, description.length > MAX_DESC && { color: colors.danger }]}>
            {description.length}/{MAX_DESC}
          </Text>
        </Card>

        <PrimaryButton
          title="Submit report"
          icon="send"
          onPress={submit}
          loading={loading}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, paddingTop: spacing.xl },
  cardGap: { marginTop: spacing.lg },
  step: { ...type.overline, color: colors.primary, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  severityRow: { flexDirection: 'row', gap: spacing.sm },
  severity: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 18 },
  bar: { width: 6, borderRadius: 2, backgroundColor: colors.border },
  severityText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginTop: 6 },

  gpsBtn: {
    width: 34, height: 34, borderRadius: 10, marginLeft: 8,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  counter: { ...type.caption, fontSize: 11, textAlign: 'right', marginTop: 6 },
});