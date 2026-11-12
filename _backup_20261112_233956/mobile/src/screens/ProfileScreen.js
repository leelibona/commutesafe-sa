import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { SkeletonBlock } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [me, setMe] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [s, m] = await Promise.allSettled([api.get('/reports/stats/mine'), api.get('/auth/me')]);
    if (s.status === 'fulfilled') setStats(s.value.data);
    else setStats({ reports: '–', sos_alerts: '–', vehicles_flagged: '–' });
    if (m.status === 'fulfilled') setMe(m.value.data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const confirmLogout = () => {
    // Alert buttons don't render on web, so fall back to window.confirm there.
    if (Platform.OS === 'web') {
      if (window.confirm('Sign out? You will need to log in again.')) logout();
      return;
    }
    Alert.alert('Sign out?', 'You will need to log in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const comingSoon = (what) => toast.show(`${what} coming soon`, { type: 'info', message: "We're still building this feature." });

  const name = me?.name || user?.name || 'Guest User';
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const memberSince = me?.created_at
    ? new Date(me.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
    : null;
  const reportCount = stats?.reports;

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={[colors.primary]} />}
    >
      <ScreenHeader center>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.rolePill}>
          <Icon name="checkmark-circle" size={14} color="#fff" />
          <Text style={styles.roleText}>{me?.role || user?.role || 'passenger'} · Verified</Text>
        </View>
        {memberSince ? <Text style={styles.since}>Member since {memberSince}</Text> : null}
        <View style={{ height: spacing.xl }} />
      </ScreenHeader>

      <View style={styles.body}>
        <View style={[styles.statsCard, shadows.md]}>
          <Stat value={stats?.reports} label="Reports" />
          <View style={styles.divider} />
          <Stat value={stats?.vehicles_flagged} label="Vehicles flagged" />
          <View style={styles.divider} />
          <Stat value={stats?.sos_alerts} label="SOS alerts" />
        </View>

        {typeof reportCount === 'number' && reportCount > 0 && (
          <View style={styles.impact}>
            <Icon name="ribbon-outline" size={20} color={colors.primary} />
            <Text style={styles.impactText}>
              Thanks for helping keep Cape Town commuters safe with {reportCount} report{reportCount === 1 ? '' : 's'}.
            </Text>
          </View>
        )}

        <Text style={styles.groupTitle}>Account</Text>
        <View style={[styles.group, shadows.sm]}>
          <Row
            icon="document-text-outline"
            label="My reports"
            sub={typeof reportCount === 'number' ? `${reportCount} submitted` : 'Loading…'}
            onPress={() => navigation.navigate('MyReports')}
          />
          <Row icon="mail-outline" label="Email" sub={me?.email || '—'} />
          <Row icon="call-outline" label="Emergency contacts" sub="Add people to notify in an emergency" onPress={() => comingSoon('Emergency contacts')} />
          <Row icon="notifications-outline" label="Notification settings" onPress={() => comingSoon('Notifications')} last />
        </View>

        <Text style={styles.groupTitle}>App</Text>
        <View style={[styles.group, shadows.sm]}>
          <Row icon="globe-outline" label="Language" sub="English" onPress={() => comingSoon('Afrikaans and isiXhosa')} />
          <Row icon="information-circle-outline" label="About CommuteSafe SA" sub="Version 1.0" last />
        </View>

        <PrimaryButton title="Sign out" icon="log-out-outline" variant="dangerSoft" onPress={confirmLogout} style={styles.signOut} />
      </View>
    </Screen>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      {value === undefined
        ? <SkeletonBlock width={28} height={22} />
        : <Text style={styles.statValue}>{value}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ icon, label, sub, last, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { backgroundColor: colors.backgroundAlt }]}
    >
      <View style={styles.rowIcon}><Icon name={icon} size={18} color={colors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub} numberOfLines={1}>{sub}</Text> : null}
      </View>
      {onPress ? <Icon name="chevron-forward" size={18} color={colors.borderStrong} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarRing: { padding: 4, borderRadius: 52, backgroundColor: 'rgba(255,255,255,0.18)' },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 30, color: colors.primary, fontWeight: '800' },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: spacing.md },
  rolePill: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.sm, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.15)',
  },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize', marginLeft: 5 },
  since: { color: colors.textOnPrimaryMuted, fontSize: 12, marginTop: 6 },

  body: { paddingHorizontal: spacing.lg, marginTop: -spacing.xl },
  statsCard: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: radius.lg, paddingVertical: spacing.lg,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { ...type.caption, marginTop: 4, textAlign: 'center' },
  divider: { width: 1, backgroundColor: colors.border },

  impact: {
    flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg,
    padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primaryLight,
  },
  impactText: { flex: 1, marginLeft: spacing.sm, fontSize: 13, color: colors.primaryDark, lineHeight: 18 },

  groupTitle: { ...type.overline, marginTop: spacing.xl, marginBottom: spacing.sm, marginLeft: 4 },
  group: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowSub: { ...type.caption, marginTop: 1 },

  signOut: { marginTop: spacing.xl },
});