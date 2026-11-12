import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n/LanguageContext';
import Icon from './Icon';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

/** Asks "Sign out?" and logs out if the user confirms. Works on phones and web. */
export function confirmSignOut(logout, t) {
  const title = t('menu.signOutConfirm');
  const body = t('menu.signOutBody');
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${body}`)) logout();
    return;
  }
  Alert.alert(title, body, [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('menu.signOut'), style: 'destructive', onPress: logout },
  ]);
}

export const initialsOf = (name = '') =>
  (name || 'U').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();

/**
 * Slide-up account menu: who you're signed in as, shortcuts, and Sign out.
 * Props: visible, onClose, onNavigate(routeName, params)
 */
export default function AccountMenu({ visible, onClose, onNavigate }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const t = useT();

  const go = (route, params) => { onClose(); onNavigate(route, params); };

  const items = [
    { icon: 'person-outline', label: t('menu.profile'), onPress: () => go('Main', { screen: 'Profile' }) },
    { icon: 'document-text-outline', label: t('profile.myReports'), onPress: () => go('MyReports') },
    { icon: 'call-outline', label: t('profile.contacts'), onPress: () => go('Contacts') },
    { icon: 'globe-outline', label: t('profile.language'), onPress: () => go('Language') },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('common.close')} />
      <View style={[styles.sheet, shadows.lg, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.handle} />

        <View style={styles.who}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initialsOf(user?.name)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.role}>{user?.role || 'passenger'}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10} style={styles.close} accessibilityLabel={t('common.close')}>
            <Icon name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.list}>
          {items.map(it => (
            <Pressable
              key={it.label}
              onPress={it.onPress}
              style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.backgroundAlt }]}
            >
              <View style={styles.itemIcon}><Icon name={it.icon} size={18} color={colors.primary} /></View>
              <Text style={styles.itemText}>{it.label}</Text>
              <Icon name="chevron-forward" size={18} color={colors.borderStrong} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => { onClose(); confirmSignOut(logout, t); }}
          style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
        >
          <Icon name="log-out-outline" size={20} color={colors.dangerDark} />
          <Text style={styles.signOutText}>{t('menu.signOut')}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28, 10, 16, 0.45)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl, paddingTop: spacing.sm,
    maxWidth: 560, alignSelf: 'center', width: '100%',
  },
  handle: {
    alignSelf: 'center', width: 40, height: 5, borderRadius: 3,
    backgroundColor: colors.border, marginBottom: spacing.lg,
  },
  who: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  name: { ...type.heading },
  role: { ...type.caption, textTransform: 'capitalize', marginTop: 2 },
  close: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.backgroundAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  list: { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  item: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  itemIcon: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  itemText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  signOut: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.xl, paddingVertical: 14, borderRadius: radius.md,
    backgroundColor: colors.dangerLight, borderWidth: 1, borderColor: '#F8C4C4',
  },
  signOutText: { marginLeft: 8, fontSize: 16, fontWeight: '700', color: colors.dangerDark },
});
