import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import Card from '../components/Card';
import ScreenHeader from '../components/ScreenHeader';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { useToast, friendlyError } from '../components/Toast';
import { normalisePlate, validatePlate } from '../utils/validation';
import { colors, radius, spacing, type } from '../theme/colors';
import { useT } from '../i18n/LanguageContext';

const HISTORY_KEY = 'recentVehicleChecks';

const STATES = {
  flagged: {
    bg: colors.dangerLight, border: '#F8C4C4', fg: colors.dangerDark, solid: colors.danger,
    icon: 'warning', label: 'Flagged vehicle',
    advice: 'This vehicle has multiple reports. Consider waiting for another taxi.',
  },
  under_review: {
    bg: colors.warningLight, border: '#FBE3B3', fg: colors.warningDark, solid: colors.warning,
    icon: 'time', label: 'Under review',
    advice: 'This vehicle has been reported before. Stay alert and share your trip with someone.',
  },
  clear: {
    bg: colors.successLight, border: '#BFE6CC', fg: colors.successDark, solid: colors.success,
    icon: 'checkmark', label: 'No flags found',
    advice: 'No reports on record. Always trust your instincts.',
  },
};

export default function CheckVehicleScreen() {
  const toast = useToast();
  const t = useT();
  const [reg, setReg] = useState('CA 847-211');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY)
      .then(v => v && setHistory(JSON.parse(v)))
      .catch(() => {});
  }, []);

  const remember = async (plate, status) => {
    const next = [{ plate, status }, ...history.filter(h => h.plate !== plate)].slice(0, 5);
    setHistory(next);
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => {});
  };

  const check = async (value = reg) => {
    const err = validatePlate(value, { required: true });
    setError(err);
    if (err) return;

    const plate = normalisePlate(value);
    setReg(plate);
    setLoading(true);
    try {
      const { data } = await api.get(`/vehicles/${encodeURIComponent(plate)}`);
      const status = data.flag_status || 'clear';
      setResult({ ...data, status });
      remember(plate, status);
    } catch (e) {
      toast.show('Check failed', { type: 'error', message: friendlyError(e) });
    } finally { setLoading(false); }
  };

  const s = result ? STATES[result.status] || STATES.clear : null;
  const hasRecord = result && result.status !== 'clear';

  return (
    <Screen>
      <ScreenHeader
        compact
        title={t('check.title')}
        subtitle={t('check.subtitle')}
      />

      <View style={styles.body}>
        <Card>
          <TextField
            label="Registration number"
            icon="car-outline"
            value={reg}
            error={error}
            onChangeText={(v) => { setReg(v); if (error) setError(''); }}
            autoCapitalize="characters"
            placeholder="CA 847-211"
            onSubmitEditing={() => check()}
            returnKeyType="search"
            style={{ marginTop: 0 }}
            inputStyle={styles.regInput}
          />
          <PrimaryButton title={t('check.button')} icon="search" onPress={() => check()} loading={loading} style={{ marginTop: spacing.lg }} />
        </Card>

        {result && s && (
          <View style={[styles.result, { backgroundColor: s.bg, borderColor: s.border }]}>
            <View style={styles.resultHead}>
              <View style={[styles.statusIcon, { backgroundColor: s.solid }]}>
                <Icon name={s.icon} size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultLabel, { color: s.fg }]}>{s.label.toUpperCase()}</Text>
                <View style={styles.plate}>
                  <Text style={styles.plateText}>{result.registration_number || reg}</Text>
                </View>
              </View>
            </View>

            {hasRecord && (
              <>
                <View style={styles.statsRow}>
                  <Stat label="Driver" value={result.name || 'Unknown'} />
                  <Stat label="Reports" value={String(result.report_count ?? 0)} />
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Latest report</Text>
                  <Text style={styles.detailValue}>{result.latest_report || 'N/A'}</Text>
                </View>
              </>
            )}

            <View style={[styles.advice, result.status === 'flagged' && { backgroundColor: colors.danger }]}>
              <Icon
                name={result.status === 'flagged' ? 'alert-circle' : 'information-circle-outline'}
                size={18}
                color={result.status === 'flagged' ? '#fff' : s.fg}
              />
              <Text style={[styles.adviceText, { color: result.status === 'flagged' ? '#fff' : s.fg }]}>
                {s.advice}
              </Text>
            </View>
          </View>
        )}

        {history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('check.recent')}</Text>
            <Card flat style={{ padding: 0, overflow: 'hidden' }}>
              {history.map((h, i) => {
                const hs = STATES[h.status] || STATES.clear;
                return (
                  <Pressable
                    key={h.plate}
                    onPress={() => check(h.plate)}
                    style={({ pressed }) => [
                      styles.historyRow,
                      i < history.length - 1 && styles.historyBorder,
                      pressed && { backgroundColor: colors.backgroundAlt },
                    ]}
                  >
                    <Icon name="time-outline" size={18} color={colors.textMuted} />
                    <Text style={styles.historyPlate}>{h.plate}</Text>
                    <View style={[styles.historyDot, { backgroundColor: hs.solid }]} />
                    <Text style={[styles.historyStatus, { color: hs.fg }]}>{hs.label}</Text>
                  </Pressable>
                );
              })}
            </Card>
          </>
        )}

        {!result && history.length === 0 && (
          <View style={styles.tipRow}>
            <Icon name="bulb-outline" size={16} color={colors.textMuted} />
            <Text style={styles.tip}>The registration is usually on the rear and side of the taxi.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, paddingTop: spacing.xl },
  regInput: { fontSize: 18, fontWeight: '700', letterSpacing: 1.5 },
  tipRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xl },
  tip: { ...type.caption, marginLeft: 6, flexShrink: 1 },

  result: { marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1.5 },
  resultHead: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  resultLabel: { ...type.overline },
  plate: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.text,
  },
  plateText: { fontSize: 18, fontWeight: '800', letterSpacing: 1.5, color: colors.text },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: radius.md, padding: spacing.md },
  statLabel: { ...type.caption },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 2 },
  detailRow: {
    marginTop: spacing.sm, backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: radius.md, padding: spacing.md,
  },
  detailLabel: { ...type.caption },
  detailValue: { fontSize: 14, color: colors.text, marginTop: 2 },
  advice: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  adviceText: { flex: 1, marginLeft: 8, fontWeight: '600', fontSize: 13, lineHeight: 18 },

  sectionTitle: { ...type.heading, marginTop: spacing.xl, marginBottom: spacing.md },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.lg },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  historyPlate: { flex: 1, marginLeft: spacing.md, fontSize: 15, fontWeight: '700', letterSpacing: 1, color: colors.text },
  historyDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  historyStatus: { fontSize: 12, fontWeight: '600' },
});
