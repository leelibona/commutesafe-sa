import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image } from 'react-native';
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
import { pickPhoto } from '../utils/photo';
import { useT } from '../i18n/LanguageContext';
import { colors, radius, riskColors, spacing, type } from '../theme/colors';

const MAX_DESC = 500;

export default function ReportScreen({ navigation }) {
  const toast = useToast();
  const t = useT();
  const [photo, setPhoto] = useState(null);
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
    setRegistration(''); setLocation(''); setCoords(null); setErrors({}); setPhoto(null);
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

  const addPhoto = async (camera) => {
    try {
      const p = await pickPhoto({ camera });
      if (p) setPhoto(p);
    } catch (e) {
      toast.show('Photo unavailable', { type: 'warning', message: e.message });
    }
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
        photo_base64: photo?.base64 || null,
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
        title={t('report.title')}
        subtitle={t('report.subtitle')}
      />

      <View style={styles.body}>
        <Card>
          <Text style={styles.step}>{t('report.step1')}</Text>
          <View style={styles.chips}>
            {CATEGORIES.map(c => (
              <Chip
                key={c.key}
                label={t(`cat.${c.key}`)}
                icon={c.icon}
                selected={category === c.key}
                onPress={() => setCategory(c.key)}
              />
            ))}
          </View>

          <Text style={[styles.step, { marginTop: spacing.xl }]}>{t('report.step2')}</Text>
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
                  <Text style={[styles.severityText, active && { color: rc.text }]}>{t(`sev.${s.value}`)}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.cardGap}>
          <Text style={styles.step}>{t('report.step3')}</Text>
          <TextField
            label={t('report.registration')}
            hint={t('report.registrationHint')}
            error={errors.registration}
            icon="car-outline"
            value={registration}
            onChangeText={(v) => { setRegistration(v); if (errors.registration) setErrors(e => ({ ...e, registration: '' })); }}
            placeholder="e.g. CA 847-211"
            autoCapitalize="characters"
            style={{ marginTop: spacing.sm }}
          />
          <TextField
            label={t('report.location')}
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
            label={t('report.description')}
            value={description}
            error={errors.description}
            onChangeText={setDescription}
            multiline
            maxLength={MAX_DESC + 50}
            placeholder={t('report.describe')}
          />
          <Text style={[styles.counter, description.length > MAX_DESC && { color: colors.danger }]}>
            {description.length}/{MAX_DESC}
          </Text>
        </Card>

        <Card style={styles.cardGap}>
          <Text style={styles.step}>{t('report.step4')}</Text>
          {photo ? (
            <View>
              <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" />
              <Pressable onPress={() => setPhoto(null)} style={styles.removePhoto} accessibilityLabel="Remove photo">
                <Icon name="close" size={18} color="#fff" />
              </Pressable>
              <View style={styles.photoOk}>
                <Icon name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.photoOkText}>Photo attached</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.photoButtons}>
                <Pressable onPress={() => addPhoto(true)} style={styles.photoBtn}>
                  <Icon name="camera-outline" size={22} color={colors.primary} />
                  <Text style={styles.photoBtnText}>{t('report.takePhoto')}</Text>
                </Pressable>
                <Pressable onPress={() => addPhoto(false)} style={styles.photoBtn}>
                  <Icon name="images-outline" size={22} color={colors.primary} />
                  <Text style={styles.photoBtnText}>{t('report.choosePhoto')}</Text>
                </Pressable>
              </View>
              <Text style={styles.photoHint}>{t('report.photoHint')}</Text>
            </>
          )}
        </Card>

        <PrimaryButton
          title={t('report.submit')}
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
  photoButtons: { flexDirection: 'row', gap: spacing.sm },
  photoBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.lg,
    borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primarySoft,
    backgroundColor: colors.surfaceTint,
  },
  photoBtnText: { marginTop: 6, fontSize: 13, fontWeight: '600', color: colors.primary },
  photoHint: { ...type.caption, marginTop: spacing.sm },
  photo: { width: '100%', height: 200, borderRadius: radius.md, backgroundColor: colors.border },
  removePhoto: {
    position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center',
  },
  photoOk: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  photoOkText: { marginLeft: 6, fontSize: 13, color: colors.successDark, fontWeight: '600' },
  counter: { ...type.caption, fontSize: 11, textAlign: 'right', marginTop: 6 },
});
