import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import api from '../api/client';
import { colors, riskColors } from '../theme/colors';

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

      // Features derived from historical data for this route (approx)
      const params = new URLSearchParams({
        incident_count: 3,
        avg_severity: 2.0,
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Route risk</Text>
      <Text style={styles.subtitle}>Cape Town CBD → Bellville</Text>

      <View style={[styles.map, { borderColor: c.hex }]}>
        <View style={styles.mapLine} />
        <View style={[styles.dot, { left: '10%', backgroundColor: colors.success }]} />
        <View style={[styles.dot, { left: '45%', backgroundColor: colors.warning }]} />
        <View style={[styles.dot, { left: '80%', backgroundColor: colors.danger }]} />
        <Text style={styles.peak}>Peak time: 17:00–19:00</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Loading prediction…</Text>
        </View>
      ) : (
        <View style={[styles.summary, { backgroundColor: c.bg }]}>
          <Text style={[styles.summaryTitle, { color: c.text }]}>
            Current route — {risk} risk
          </Text>
          <Text style={styles.summarySub}>
            {features
              ? `Based on ${features.incident_count} incidents in the last 7 days`
              : 'Predictive risk estimate'}
          </Text>
          {source && (
            <Text style={styles.source}>
              Prediction source: {source === 'ml-service' ? 'AI model' : 'rule-based fallback'}
            </Text>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>RISK BY TIME OF DAY</Text>
      <View style={styles.timeRow}>
        {[
          { label: '06:00–08:00', risk: 'Low' },
          { label: '08:00–17:00', risk: 'Low' },
          { label: '17:00–19:00', risk: 'High' },
          { label: '19:00+', risk: 'Medium' },
        ].map(t => (
          <View
            key={t.label}
            style={[styles.timeChip, { backgroundColor: riskColors[t.risk].bg }]}
          >
            <Text style={styles.timeLabel}>{t.label}</Text>
            <Text style={[styles.timeRisk, { color: riskColors[t.risk].text }]}>
              {t.risk}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 32, backgroundColor: '#fff', minHeight: '100vh' },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary },
  subtitle: { color: colors.textMuted, marginTop: 4, marginBottom: 20 },
  map: {
    height: 180,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 20,
    justifyContent: 'center',
  },
  mapLine: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    right: '10%',
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
  },
  dot: { position: 'absolute', top: '42%', width: 16, height: 16, borderRadius: 8 },
  peak: { position: 'absolute', top: 12, right: 12, fontSize: 12, color: colors.textMuted },
  loadingBox: { padding: 20, alignItems: 'center' },
  loadingText: { marginTop: 8, color: colors.textMuted, fontSize: 13 },
  summary: { padding: 16, borderRadius: 12, marginBottom: 20 },
  summaryTitle: { fontWeight: '800', fontSize: 15 },
  summarySub: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  source: { fontSize: 11, color: colors.textMuted, marginTop: 6, fontStyle: 'italic' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 8,
  },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { flex: 1, minWidth: 100, padding: 10, borderRadius: 10, alignItems: 'center' },
  timeLabel: { fontSize: 11, color: colors.textMuted },
  timeRisk: { fontSize: 13, fontWeight: '800', marginTop: 2 },
});