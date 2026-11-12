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
import AccountMenu, { initialsOf } from '../components/AccountMenu';
import Illustration from '../components/Illustration';
import { tipOfTheDay } from '../theme/tips';
import { categoryFor } from '../theme/categories';
import { timeAgo } from '../utils/time';
import { useT } from '../i18n/LanguageContext';
import { useNotifications } from '../context/NotificationsContext';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'greeting.morning';
  if (h < 18) return 'greeting.afternoon';
  return 'greeting.evening';
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
  const t = useT();
  const { unread, refresh: refreshNotifications } = useNotifications();
  const [trip, setTrip] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const [reports, riskRes, tripRes] = await Promise.allSettled([
      api.get('/reports/recent/nearby'),
      api.get(`/risk/route?${riskParams()}`),
      api.get('/trips/active'),
    ]);
    setTrip(tripRes.status === 'fulfilled' ? tripRes.value.data : null);
    if (reports.status === 'fulfilled') { setRecent(reports.value.data); setFailed(false); }
    else setFailed(true);
    if (riskRes.status === 'fulfilled') setRisk(riskRes.value.data.risk);
    setLoading(false);
  }, []);

  // Loads on first open, and refreshes quietly whenever the user comes back to this tab
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    refreshNotifications();
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
      <ScreenHeader
        eyebrow={`${t(greetingKey())}${firstName ? `, ${firstName}` : ''}`}
        title="CommuteSafe SA"
        right={
          <View style={styles.headerButtons}>
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.8 }]}
            accessibilityLabel={t('menu.account')}
          >
            <Text style={styles.avatarText}>{initialsOf(user?.name)}</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            style={({ pressed }) => [styles.bell, pressed && { opacity: 0.8 }]}
            accessibilityLabel={`${t('notif.title')}${unread ? `, ${unread} unread` : ''}`}
          >
            <Icon name={unread ? 'notifications' : 'notifications-outline'} size={22} color="#fff" />
            {unread > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </Pressable>
          </View>
        }
      >
        <Pressable
          onPress={() => navigation.navigate('Risk')}
          style={({ pressed }) => [styles.routeCard, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.routeTop}>
            <Text style={styles.routeOverline}>{t('home.currentRoute')}</Text>
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
        {trip && (
          <Pressable onPress={() => navigation.navigate('Trip')} style={[styles.tripBanner, shadows.md]}>
            <View style={styles.liveDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tripTitle}>{t('home.tripActive')}</Text>
              <Text style={styles.tripSub} numberOfLines={1}>{trip.origin} → {trip.destination}</Text>
            </View>
            <View style={styles.tripBtn}>
              <Text style={styles.tripBtnText}>{t('home.arrived')}</Text>
            </View>
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.grid}>
          <ActionCard icon="create-outline" label={t('home.report')} sub={t('home.reportSub')} onPress={() => navigation.navigate('Report')} />
          <ActionCard icon="search-outline" label={t('home.check')} sub={t('home.checkSub')} onPress={() => navigation.navigate('Check')} />
          <ActionCard icon="share-social-outline" label={t('home.trip')} sub={t('home.tripSub')} onPress={() => navigation.navigate('Trip')} />
          <ActionCard icon="bus-outline" label={t('home.ranks')} sub={t('home.ranksSub')} onPress={() => navigation.navigate('Ranks')} />
          <ActionCard icon="map-outline" label={t('home.risk')} sub={t('home.riskSub')} onPress={() => navigation.navigate('Risk')} />
          <ActionCard icon="alert-circle-outline" label={t('home.sos')} sub={t('home.sosSub')} highlighted onPress={() => navigation.navigate('SOS')} />
        </View>

        <View style={[styles.tipCard, shadows.sm]}>
          <View style={styles.tipIcon}><Icon name="bulb" size={20} color={colors.warningDark} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipLabel}>{t('home.tip')}</Text>
            <Text style={styles.tipText}>{tipOfTheDay()}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{t('home.recent')}</Text>
          {recent.length > 0 && <Text style={styles.count}>{recent.length}</Text>}
        </View>

        {loading && [0, 1, 2].map(i => <SkeletonRow key={i} />)}

        {!loading && failed && (
          <Pressable style={styles.empty} onPress={onRefresh}>
            <Icon name="cloud-offline-outline" size={30} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('home.loadFailed')}</Text>
            <Text style={styles.emptyText}>{t('home.loadFailedSub')}</Text>
          </Pressable>
        )}

        {!loading && !failed && recent.length === 0 && (
          <View style={styles.empty}>
            <Illustration name="quiet" width={170} />
            <Text style={styles.emptyTitle}>{t('home.quiet')}</Text>
            <Text style={styles.emptyText}>{t('home.quietSub')}</Text>
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
                <Text style={styles.reportCategory}>{t(`cat.${r.category}`)}</Text>
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
          <Text style={styles.pullHint}>{t('home.pull')}</Text>
        )}
      </View>

      <AccountMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(route, params) => navigation.navigate(route, params)}
      />
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
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  tipCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm,
    borderLeftWidth: 4, borderLeftColor: colors.warning,
  },
  tipIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.warningLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  tipLabel: { ...type.overline, color: colors.warningDark, fontSize: 10 },
  tipText: { fontSize: 13, color: colors.text, marginTop: 3, lineHeight: 18 },
  bell: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute', top: 4, right: 3, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4, borderWidth: 2, borderColor: colors.primary,
  },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  tripBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.xl,
    borderLeftWidth: 4, borderLeftColor: colors.success,
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success, marginRight: spacing.md },
  tripTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  tripSub: { ...type.caption, marginTop: 2 },
  tripBtn: { backgroundColor: colors.successLight, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  tripBtnText: { color: colors.successDark, fontWeight: '700', fontSize: 12 },
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
    backgroundColor: colors.surface,
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
