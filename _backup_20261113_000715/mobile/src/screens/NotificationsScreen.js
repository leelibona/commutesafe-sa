import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { SkeletonRow } from '../components/Skeleton';
import { friendlyError } from '../components/Toast';
import { useNotifications } from '../context/NotificationsContext';
import { useT } from '../i18n/LanguageContext';
import { timeAgo } from '../utils/time';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

const STYLE_FOR_TYPE = {
  vehicle_flagged: { icon: 'flag', color: colors.danger, bg: colors.dangerLight },
  report_received: { icon: 'document-text', color: colors.primary, bg: colors.primaryLight },
};
const DEFAULT_STYLE = { icon: 'notifications', color: colors.primary, bg: colors.primaryLight };

export default function NotificationsScreen({ navigation }) {
  const t = useT();
  const { markAllRead } = useNotifications();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setItems(data.items);
      setError('');
      // Opening this screen counts as reading them
      if (data.unread > 0) markAllRead();
    } catch (e) {
      setItems(i => i || []);
      setError(friendlyError(e));
    }
  }, [markAllRead]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <Screen
      tabbed={false}
      contentStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      <Pressable onPress={() => navigation.navigate('NotificationSettings')} style={styles.settingsLink}>
        <Icon name="settings-outline" size={16} color={colors.primary} />
        <Text style={styles.settingsText}>{t('notif.settings')}</Text>
        <Icon name="chevron-forward" size={16} color={colors.primary} />
      </Pressable>

      {error ? (
        <View style={styles.errorBox}>
          <Icon name="cloud-offline-outline" size={18} color={colors.dangerDark} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {items === null && [0, 1, 2].map(i => <SkeletonRow key={i} />)}

      {items && items.length === 0 && !error && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Icon name="notifications-outline" size={32} color={colors.primary} /></View>
          <Text style={styles.emptyTitle}>{t('notif.empty')}</Text>
          <Text style={styles.emptyText}>{t('notif.emptySub')}</Text>
        </View>
      )}

      {items && items.map(n => {
        const s = STYLE_FOR_TYPE[n.type] || DEFAULT_STYLE;
        return (
          <View key={n.notification_id} style={[styles.item, shadows.sm, !n.is_read && styles.unread]}>
            <View style={[styles.icon, { backgroundColor: s.bg }]}>
              <Icon name={s.icon} size={18} color={s.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={2}>{n.title}</Text>
                {!n.is_read && <View style={styles.dot} />}
              </View>
              {n.body ? <Text style={styles.body}>{n.body}</Text> : null}
              <Text style={styles.time}>{timeAgo(n.created_at)}</Text>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  settingsLink: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end',
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill,
    backgroundColor: colors.primaryLight, marginBottom: spacing.lg,
  },
  settingsText: { marginHorizontal: 6, color: colors.primary, fontWeight: '600', fontSize: 13 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginBottom: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.dangerLight,
  },
  errorText: { flex: 1, marginLeft: spacing.sm, color: colors.dangerDark, fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { ...type.heading, marginTop: spacing.lg },
  emptyText: { ...type.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  item: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.sm + 2, borderWidth: 1, borderColor: 'transparent',
  },
  unread: { borderColor: colors.primarySoft, backgroundColor: colors.surfaceTint },
  icon: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 5, marginLeft: 6 },
  body: { fontSize: 13, color: colors.textSecondary, marginTop: 3, lineHeight: 18 },
  time: { ...type.caption, fontSize: 11, marginTop: 6 },
});
