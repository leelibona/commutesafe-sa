import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import PrimaryButton from '../components/PrimaryButton';
import { useToast } from '../components/Toast';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../utils/settings';
import { setupNotifications, showLocalNotification } from '../utils/notify';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

const OPTIONS = [
  {
    key: 'popups', icon: 'phone-portrait-outline',
    label: 'Pop-up notifications',
    sub: 'Show alerts on this phone while CommuteSafe is open',
  },
  {
    key: 'vehicleFlagged', icon: 'flag-outline',
    label: 'Vehicle flagged',
    sub: 'When a vehicle you reported gets flagged',
  },
  {
    key: 'reportUpdates', icon: 'document-text-outline',
    label: 'Report updates',
    sub: 'Confirmation and progress on your reports',
  },
];

export default function NotificationSettingsScreen() {
  const toast = useToast();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => { getSettings().then(setSettings); }, []);

  const toggle = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await saveSettings(next);
    if (key === 'popups' && value) {
      const ok = await setupNotifications();
      if (!ok) {
        toast.show('Notifications are blocked', {
          type: 'warning',
          message: 'Allow notifications for CommuteSafe in your phone or browser settings.',
        });
      }
    }
  };

  const test = async () => {
    await showLocalNotification('CommuteSafe SA', 'Notifications are working.');
    toast.show('Test sent', { type: 'info', message: "If nothing appeared, check your phone's notification settings." });
  };

  return (
    <Screen tabbed={false} contentStyle={{ padding: spacing.lg }}>
      <View style={[styles.group, shadows.sm]}>
        {OPTIONS.map((o, i) => {
          const disabled = o.key !== 'popups' && !settings.popups;
          return (
            <View key={o.key} style={[styles.row, i < OPTIONS.length - 1 && styles.border, disabled && { opacity: 0.45 }]}>
              <View style={styles.icon}><Icon name={o.icon} size={18} color={colors.primary} /></View>
              <View style={{ flex: 1, marginRight: spacing.md }}>
                <Text style={styles.label}>{o.label}</Text>
                <Text style={styles.sub}>{o.sub}</Text>
              </View>
              <Switch
                value={!!settings[o.key]}
                disabled={disabled}
                onValueChange={(v) => toggle(o.key, v)}
                trackColor={{ false: colors.borderStrong, true: colors.primary }}
                thumbColor="#fff"
                accessibilityLabel={o.label}
              />
            </View>
          );
        })}
      </View>

      <Text style={styles.note}>
        You'll always see every notification in the bell on the Home screen, even with pop-ups turned off.
      </Text>

      <PrimaryButton title="Send a test notification" icon="notifications-outline" variant="secondary" onPress={test} style={{ marginTop: spacing.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
  sub: { ...type.caption, marginTop: 2 },
  note: { ...type.caption, marginTop: spacing.lg, paddingHorizontal: 4, lineHeight: 17 },
});
