import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import PrimaryButton from '../components/PrimaryButton';
import { SkeletonRow } from '../components/Skeleton';
import { friendlyError } from '../components/Toast';
import { categoryFor, SEVERITIES } from '../theme/categories';
import { colors, radius, riskColors, shadows, spacing, type } from '../theme/colors';
import { timeAgo } from '../utils/time';

const STATUS = {
  flagged: { label: 'Vehicle flagged', bg: colors.dangerLight, fg: colors.dangerDark, icon: 'flag' },
  under_review: { label: 'Under review', bg: colors.warningLight, fg: colors.warningDark, icon: 'time-outline' },
  clear: { label: 'Recorded', bg: colors.successLight, fg: colors.successDark, icon: 'checkmark-circle-outline' },
};

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/reports/mine');
      setReports(data);
      setError('');
    } catch (e) {
      setError(friendlyError(e));
      setReports(r => r || []);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <Screen
      tabbed={false}
      contentStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      {reports === null && [0, 1, 2, 3].map(i => <SkeletonRow key={i} />)}

      {error ? (
        <View style={styles.errorBox}>
          <Icon name="cloud-offline-outline" size={18} color={colors.dangerDark} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {reports && reports.length === 0 && !error && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Icon name="document-text-outline" size={32} color={colors.primary} /></View>
          <Text style={styles.emptyTitle}>No reports yet</Text>
          <Text style={styles.emptyText}>
            When you report an incident it will appear here, along with what happened to the vehicle.
          </Text>
          <PrimaryButton
            title="Report an incident"
            icon="create-outline"
            onPress={() => navigation.navigate('Main', { screen: 'Report' })}
            style={{ marginTop: spacing.xl, alignSelf: 'stretch' }}
          />
        </View>
      )}

      {reports && reports.length > 0 && (
        <Text style={styles.summary}>
          {reports.length} report{reports.length === 1 ? '' : 's'} · tap one for details
        </Text>
      )}

      {reports && reports.map(r => {
        const cat = categoryFor(r.category);
        const sev = SEVERITIES.find(s => s.value === Number(r.severity)) || SEVERITIES[0];
        const st = r.registration_number ? STATUS[r.flag_status] || STATUS.clear : STATUS.clear;
        const open = expanded === r.report_id;
        return (
          <Pressable
            key={r.report_id}
            onPress={() => setExpanded(open ? null : r.report_id)}
            style={({ pressed }) => [styles.card, shadows.sm, pressed && { opacity: 0.95 }]}
          >
            <View style={styles.cardTop}>
              <View style={[styles.catIcon, { backgroundColor: cat.tint }]}>
                <Icon name={cat.icon} size={20} color={cat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cat}>{r.category}</Text>
                <Text style={styles.meta}>{timeAgo(r.created_at)}</Text>
              </View>
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
            </View>

            <View style={styles.tags}>
              <View style={[styles.tag, { backgroundColor: riskColors[sev.risk].bg }]}>
                <Text style={[styles.tagText, { color: riskColors[sev.risk].text }]}>{sev.label}</Text>
              </View>
              {r.registration_number ? (
                <View style={styles.plateTag}><Text style={styles.plateText}>{r.registration_number}</Text></View>
              ) : null}
              <View style={[styles.tag, { backgroundColor: st.bg, flexDirection: 'row', alignItems: 'center' }]}>
                <Icon name={st.icon} size={12} color={st.fg} />
                <Text style={[styles.tagText, { color: st.fg, marginLeft: 4 }]}>{st.label}</Text>
              </View>
            </View>

            {open && (
              <View style={styles.details}>
                <Detail icon="location-outline" text={r.location || 'No location given'} />
                <Detail
                  icon="calendar-outline"
                  text={new Date(r.created_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
                />
                {r.description ? <Text style={styles.desc}>{r.description}</Text> : null}
              </View>
            )}
          </Pressable>
        );
      })}
    </Screen>
  );
}

function Detail({ icon, text }) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={15} color={colors.textMuted} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { ...type.caption, marginBottom: spacing.md, marginLeft: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  catIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  cat: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { ...type.caption, marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  tagText: { fontSize: 11, fontWeight: '700' },
  plateTag: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
    borderWidth: 1.5, borderColor: colors.text, backgroundColor: '#fff',
  },
  plateText: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.text },
  details: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { ...type.caption, fontSize: 13, color: colors.textSecondary, marginLeft: 6, flexShrink: 1 },
  desc: { ...type.body, fontSize: 14, marginTop: 4 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.dangerLight, marginBottom: spacing.md,
  },
  errorText: { flex: 1, marginLeft: spacing.sm, color: colors.dangerDark, fontSize: 13 },

  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { ...type.heading, marginTop: spacing.lg },
  emptyText: { ...type.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});