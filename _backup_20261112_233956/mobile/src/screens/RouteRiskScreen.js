import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../api/client';
import RiskBadge from '../components/RiskBadge';
import Card from '../components/Card';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { colors, radius, riskColors, spacing, type } from '../theme/colors';

const STOPS = [
  { name: 'Cape Town CBD', pos: '8%', risk: 'Low' },
  { name: 'Woodstock', pos: '36%', risk: 'Medium' },
  { name: 'Parow', pos: '64%', risk: 'Medium' },
  { name: 'Bellville', pos: '92%', risk: 'High' },
];

const TIMES = [
  { label: '06–08', risk: 'Low' },
  { label: '08–17', risk: 'Low' },
  { label: '17–19', risk: 'High' },
  { label: '19+', risk: 'Medium' },
];

export default function RouteRiskScreen() {
  const [risk, setRisk] = useState('Unknown');
  const [features, setFeatures] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRisk();
  }, []);

  const fetchRisk = async () => {
    setLoading(true);
    try {
      // Use current time to derive time window + day of week
      const now = new Date();
      const hour = now.getHours();
      const time_window = Math.floor(hour / 2) * 2;
      const dow = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0..Sun=6

      // Incident numbers now come from real reports on the server (last 7 days)
      const params = new URLSearchParams({
        time_window: String(time_window),
        dow: String(dow),
      });

      const { data } = await api.get(`/risk/route?${params.toString()}`);
      setRisk(data.risk || 'Unknown');
      setFeatures(data.features || null);
      setSource(data.source || null);
    } catch {
      setRisk('Unknown');
    } finally {
      setLoading(false);
    }
  };

  const c = riskColors[risk] || riskColors.Unknown;

  return (
    <Screen tabbed={false}>
      {/* Hero continues the violet header */}
      <View style={styles.hero}>
        <Text style={styles.heroOverline}>YOUR ROUTE</Text>
        <Text style={styles.heroTitle}>Cape Town CBD → Bellville</Text>
      </View>

      <View style={styles.body}>
        {/* Prediction */}
        <Card style={styles.predictCard}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Calculating risk…</Text>
            </View>
          ) : (
            <View style={styles.predictRow}>
              <View style={[styles.gauge, { borderColor: c.hex, backgroundColor: c.bg }]}>
                <Text style={[styles.gaugeText, { color: c.text }]}>{risk}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type.overline}>Current risk</Text>
                <Text style={styles.predictTitle}>{risk} risk right now</Text>
                <Text style={styles.predictSub}>
                  {features
                    ? `Based on ${features.incident_count} reported incident${features.incident_count === 1 ? '' : 's'} in the last 7 days (avg severity ${features.avg_severity})`
                    : 'Predictive risk estimate'}
                </Text>
                {source && (
                  <View style={styles.sourcePill}>
                    <Icon name={source === 'ml-service' ? 'sparkles' : 'options-outline'} size={12} color={colors.primary} />
                    <Text style={styles.sourceText}>
                      {source === 'ml-service' ? 'AI model' : 'Rule-based fallback'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </Card>

        {/* Route strip */}
        <Text style={styles.sectionTitle}>Along the route</Text>
        <Card>
          <View style={styles.track}>
            <View style={styles.trackLine} />
            {STOPS.map(s => (
              <View
                key={s.name}
                style={[styles.trackDot, { left: s.pos, backgroundColor: riskColors[s.risk].hex }]}
              />
            ))}
          </View>
          <View style={styles.stopRow}>
            {STOPS.map(s => (
              <View key={s.name} style={styles.stopLabel}>
                <Text style={styles.stopName} numberOfLines={2}>{s.name}</Text>
              </View>
            ))}
          </View>
          <View style={styles.peak}>
            <Icon name="time-outline" size={14} color={colors.dangerDark} />
            <Text style={styles.peakText}>Peak risk: 17:00 – 19:00</Text>
          </View>
        </Card>

        {/* Time of day */}
        <Text style={styles.sectionTitle}>Risk by time of day</Text>
        <View style={styles.timeRow}>
          {TIMES.map(t => {
            const tc = riskColors[t.risk];
            return (
              <View key={t.label} style={[styles.timeCol, { backgroundColor: colors.surface }]}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor: tc.hex,
                        height: t.risk === 'High' ? '100%' : t.risk === 'Medium' ? '62%' : '30%',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.timeLabel}>{t.label}</Text>
                <Text style={[styles.timeRisk, { color: tc.text }]}>{t.risk}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.legend}>
          {['Low', 'Medium', 'High'].map(r => <RiskBadge key={r} risk={r} />)}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: 56,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroOverline: { ...type.overline, color: colors.textOnPrimaryMuted },
  heroTitle: { ...type.title, color: '#fff', fontSize: 22, marginTop: 4 },

  body: { paddingHorizontal: spacing.lg, marginTop: -40 },
  predictCard: { padding: spacing.lg + 2 },
  predictRow: { flexDirection: 'row', alignItems: 'center' },
  gauge: {
    width: 84, height: 84, borderRadius: 42, borderWidth: 6,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg,
  },
  gaugeText: { fontSize: 15, fontWeight: '800' },
  predictTitle: { ...type.heading, marginTop: 2 },
  predictSub: { ...type.caption, marginTop: 4, lineHeight: 16 },
  sourcePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', marginTop: spacing.sm,
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: colors.primaryLight, borderRadius: radius.pill,
  },
  sourceText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  loadingBox: { paddingVertical: spacing.lg, alignItems: 'center' },
  loadingText: { ...type.caption, marginTop: spacing.sm },

  sectionTitle: { ...type.heading, marginTop: spacing.xl, marginBottom: spacing.md },

  track: { height: 24, justifyContent: 'center', marginHorizontal: 4 },
  trackLine: {
    position: 'absolute', left: '8%', right: '8%', height: 4,
    backgroundColor: colors.border, borderRadius: 2,
  },
  trackDot: {
    position: 'absolute', width: 18, height: 18, borderRadius: 9, marginLeft: -9,
    borderWidth: 3, borderColor: '#fff',
  },
  stopRow: { flexDirection: 'row', marginTop: spacing.sm },
  stopLabel: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  stopName: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  peak: {
    marginTop: spacing.lg, padding: spacing.sm + 2, borderRadius: radius.sm,
    backgroundColor: colors.dangerLight,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  peakText: { fontSize: 12, fontWeight: '700', color: colors.dangerDark, marginLeft: 6 },

  timeRow: { flexDirection: 'row', gap: spacing.sm },
  timeCol: { flex: 1, alignItems: 'center', padding: spacing.md, borderRadius: radius.md },
  barTrack: {
    width: 14, height: 64, borderRadius: 7, backgroundColor: colors.background,
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  bar: { width: '100%', borderRadius: 7 },
  timeLabel: { ...type.caption, fontSize: 11, marginTop: spacing.sm },
  timeRisk: { fontSize: 13, fontWeight: '800', marginTop: 1 },

  legend: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.xl },
});