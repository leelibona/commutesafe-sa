import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ActionCard from '../components/ActionCard';
import RiskBadge from '../components/RiskBadge';
import ScreenHeader from '../components/ScreenHeader';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { SkeletonRow } from '../components/Skeleton';
import { categoryFor } from '../theme/categories';
import { timeAgo } from '../utils/time';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function riskParams() {
  const now = new Date();
  return new URLSearchParams({
    time_window: String(Math.floor(now.getHours() / 2) * 2),
    dow: String(now.getDay() === 0 ? 6 : now.getDay() - 1),
  }).toString();
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const [reports, riskRes] = await Promise.allSettled([
      api.get('/reports/recent/nearby'),
      api.get(`/risk/route?${riskParams()}`),
    ]);
    if (reports.status === 'fulfilled') { setRecent(reports.value.data); setFailed(false); }
    else setFailed(true);
    if (riskRes.status === 'fulfilled') setRisk(riskRes.value.data.risk);
    setLoading(false);
  }, []);

  // Loads on first open, and refreshes quietly whenever the user comes back to this tab
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
      }
    >
      <ScreenHeader eyebrow={`${greeting()}${firstName ? `, ${firstName}` : ''}`} title="CommuteSafe SA">
        <Pressable
          onPress={() => navigation.navigate('Risk')}
          style={({ pressed }) => [styles.routeCard, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.routeTop}>
            <Text style={styles.routeOverline}>CURRENT ROUTE</Text>
            {risk ? <RiskBadge risk={risk} /> : <View style={styles.badgePlaceholder} />}
          </View>
          <View style={styles.routeLine}>
            <View style={styles.stopCol}>
              <View style={[styles.stopDot, { backgroundColor: '#fff' }]} />
              <View style={styles.stopBar} />
              <View style={[styles.stopDot, styles.stopDotEnd]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stopText}>Cape Town CBD</Text>
              <Text style={[styles.stopText, { marginTop: 14 }]}>Bellville</Text>
            </View>
            <Icon name="chevron-forward" size={22} color="rgba(255,255,255,0.75)" />
          </View>
        </Pressable>
      </ScreenHeader>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.grid}>
          <ActionCard icon="create-outline" label="Report incident" sub="Share what you saw" onPress={() => navigation.navigate('Report')} />
          <ActionCard icon="search-outline" label="Check vehicle" sub="Before you board" onPress={() => navigation.navigate('Check')} />
          <ActionCard icon="map-outline" label="Route risk" sub="AI risk forecast" onPress={() => navigation.navigate('Risk')} />
          <ActionCard icon="alert-circle-outline" label="Emergency SOS" sub="Alert responders" highlighted onPress={() => navigation.navigate('SOS')} />
        </View>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Recent reports near you</Text>
          {recent.length > 0 && <Text style={styles.count}>{recent.length}</Text>}
        </View>

        {loading && [0, 1, 2].map(i => <SkeletonRow key={i} />)}

        {!loading && failed && (
          <Pressable style={styles.empty} onPress={onRefresh}>
            <Icon name="cloud-offline-outline" size={30} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Couldn't load reports</Text>
            <Text style={styles.emptyText}>Tap to try again, or pull down to refresh.</Text>
          </Pressable>
        )}

        {!loading && !failed && recent.length === 0 && (
          <View style={styles.empty}>
            <Icon name="sunny-outline" size={30} color={colors.warning} />
            <Text style={styles.emptyTitle}>All quiet nearby</Text>
            <Text style={styles.emptyText}>No reports yet. You'll be the first to know.</Text>
          </View>
        )}

        {!loading && recent.map(r => {
          const cat = categoryFor(r.category);
          return (
            <View key={r.report_id} style={[styles.reportItem, shadows.sm]}>
              <View style={[styles.reportIcon, { backgroundColor: cat.tint }]}>
                <Icon name={cat.icon} size={20} color={cat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reportCategory}>{r.category}</Text>
                <View style={styles.metaRow}>
                  <Icon name="location-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.reportMeta} numberOfLines={1}>{r.location || 'Location unknown'}</Text>
                </View>
              </View>
              <Text style={styles.reportTime}>{timeAgo(r.created_at)}</Text>
            </View>
          );
        })}

        {!loading && recent.length > 0 && (
          <Text style={styles.pullHint}>Pull down to refresh</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  routeCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
  },
  routeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeOverline: { ...type.overline, color: colors.textOnPrimaryMuted },
  badgePlaceholder: { width: 96, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  routeLine: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  stopCol: { alignItems: 'center', marginRight: spacing.md },
  stopDot: { width: 10, height: 10, borderRadius: 5 },
  stopDotEnd: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#fff' },
  stopBar: { width: 2, height: 22, backgroundColor: 'rgba(255,255,255,0.4)', marginVertical: 2 },
  stopText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { ...type.heading, marginBottom: spacing.md },
  count: {
    marginLeft: 8,
    backgroundColor: colors.primaryLight, color: colors.primary,
    fontSize: 12, fontWeight: '700',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, overflow: 'hidden',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  empty: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  emptyTitle: { ...type.heading, fontSize: 15, marginTop: spacing.sm },
  emptyText: { ...type.caption, marginTop: 4, textAlign: 'center' },

  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  reportIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  reportCategory: { fontWeight: '700', fontSize: 14, color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  reportMeta: { ...type.caption, marginLeft: 3, flexShrink: 1 },
  reportTime: { ...type.caption, fontSize: 11, marginLeft: spacing.sm },
  pullHint: { ...type.caption, textAlign: 'center', marginTop: spacing.sm, fontSize: 11 },
});