import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import MapPreview from '../components/MapPreview';
import RiskBadge from '../components/RiskBadge';
import TextField from '../components/TextField';
import { SkeletonRow } from '../components/Skeleton';
import { friendlyError } from '../components/Toast';
import { useT } from '../i18n/LanguageContext';
import { categoryFor } from '../theme/categories';
import { timeAgo } from '../utils/time';
import { colors, radius, riskColors, shadows, spacing, type } from '../theme/colors';

// Simple rule: how busy a rank has been with incidents in the last 30 days
const riskFor = (n) => (n >= 5 ? 'High' : n >= 2 ? 'Medium' : 'Low');

export default function RanksScreen() {
  const t = useT();
  const [ranks, setRanks] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const [details, setDetails] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/ranks');
      setRanks(data);
      setError('');
    } catch (e) {
      setRanks(r => r || []);
      setError(friendlyError(e));
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); setDetails({}); await load(); setRefreshing(false); };

  const toggle = async (rank) => {
    const next = open === rank.rank_id ? null : rank.rank_id;
    setOpen(next);
    if (next && !details[rank.rank_id]) {
      try {
        const { data } = await api.get(`/ranks/${rank.rank_id}/reports`);
        setDetails(d => ({ ...d, [rank.rank_id]: data }));
      } catch {
        setDetails(d => ({ ...d, [rank.rank_id]: [] }));
      }
    }
  };

  const directions = (r) =>
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`).catch(() => {});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!ranks) return null;
    if (!q) return ranks;
    return ranks.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.area || '').toLowerCase().includes(q) ||
      r.routes.some(x => x.toLowerCase().includes(q)));
  }, [ranks, query]);

  const markers = (filtered || [])
    .filter(r => r.latitude != null)
    .map(r => ({
      id: String(r.rank_id),
      latitude: r.latitude,
      longitude: r.longitude,
      title: r.name,
      description: t('ranks.incidents', { count: r.incidents_30d }),
      color: riskColors[riskFor(r.incidents_30d)].hex,
    }));

  return (
    <Screen
      tabbed={false}
      contentStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      <Text style={styles.subtitle}>{t('ranks.subtitle')}</Text>

      <MapPreview markers={markers} height={210} />

      <TextField
        icon="search-outline"
        value={query}
        onChangeText={setQuery}
        placeholder="Search by rank, area or destination"
        style={{ marginTop: spacing.lg }}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Icon name="cloud-offline-outline" size={18} color={colors.dangerDark} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: spacing.lg }}>
        {filtered === null && [0, 1, 2].map(i => <SkeletonRow key={i} />)}
        {filtered && filtered.length === 0 && !error && (
          <Text style={styles.none}>No ranks match "{query}".</Text>
        )}

        {filtered && filtered.map(r => {
          const risk = riskFor(r.incidents_30d);
          const isOpen = open === r.rank_id;
          const reports = details[r.rank_id];
          return (
            <Pressable
              key={r.rank_id}
              onPress={() => toggle(r)}
              style={({ pressed }) => [styles.card, shadows.sm, pressed && { opacity: 0.95 }]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.pin, { backgroundColor: riskColors[risk].bg }]}>
                  <Icon name="location" size={20} color={riskColors[risk].hex} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{r.name}</Text>
                  <Text style={type.caption}>{r.area}</Text>
                </View>
                <RiskBadge risk={risk} />
              </View>

              <View style={styles.routes}>
                {r.routes.map(x => (
                  <View key={x} style={styles.route}>
                    <Icon name="arrow-forward" size={11} color={colors.primary} />
                    <Text style={styles.routeText}>{x}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.footer}>
                <Text style={styles.incidents}>
                  {t('ranks.incidents', { count: r.incidents_30d })}
                  {r.last_incident ? ` · last ${timeAgo(r.last_incident)}` : ''}
                </Text>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
              </View>

              {isOpen && (
                <View style={styles.details}>
                  {reports === undefined && <ActivityIndicator color={colors.primary} />}
                  {reports && reports.length === 0 && (
                    <Text style={type.caption}>No reports mention this rank yet.</Text>
                  )}
                  {reports && reports.map(rep => {
                    const cat = categoryFor(rep.category);
                    return (
                      <View key={rep.report_id} style={styles.reportRow}>
                        <Icon name={cat.icon} size={16} color={cat.color} />
                        <Text style={styles.reportText} numberOfLines={1}>{t(`cat.${rep.category}`)}</Text>
                        <Text style={type.caption}>{timeAgo(rep.created_at)}</Text>
                      </View>
                    );
                  })}
                  {r.latitude != null && (
                    <Pressable onPress={() => directions(r)} style={styles.dirBtn}>
                      <Icon name="navigate-outline" size={16} color={colors.primary} />
                      <Text style={styles.dirText}>{t('ranks.directions')}</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.disclaimer}>
        Rank locations are approximate. Incident counts come from CommuteSafe reports that mention the area.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...type.body, color: colors.textMuted, marginBottom: spacing.lg },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginTop: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.dangerLight,
  },
  errorText: { flex: 1, marginLeft: spacing.sm, color: colors.dangerDark, fontSize: 13 },
  none: { ...type.caption, textAlign: 'center', paddingVertical: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  pin: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  routes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  route: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.primaryLight,
  },
  routeText: { fontSize: 11, fontWeight: '600', color: colors.primaryDark },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  incidents: { ...type.caption, flex: 1 },
  details: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  reportRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  reportText: { flex: 1, marginLeft: spacing.sm, fontSize: 13, color: colors.text },
  dirBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
    paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.primaryLight,
  },
  dirText: { marginLeft: 6, color: colors.primary, fontWeight: '700' },
  disclaimer: { ...type.caption, fontSize: 11, textAlign: 'center', marginTop: spacing.md },
});
