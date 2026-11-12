import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Icon from './Icon';
import { colors, radius, shadows } from '../theme/colors';

/**
 * variant: 'primary' | 'danger' | 'secondary' | 'dangerSoft' | 'ghost'
 * (the old `danger` boolean prop still works)
 * icon: Ionicons name, e.g. "search"
 */
export default function PrimaryButton({
  title, onPress, loading, disabled, danger, variant, icon, style,
}) {
  const v = variant || (danger ? 'danger' : 'primary');
  const isDisabled = disabled || loading;
  const filled = v === 'primary' || v === 'danger';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.btn,
        styles[v],
        filled && shadows.md,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={filled ? '#fff' : colors.primary} />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <Icon
              name={icon}
              size={18}
              color={filled ? '#fff' : v === 'dangerSoft' ? colors.dangerDark : colors.primary}
              style={styles.icon}
            />
          ) : null}
          <Text
            style={[
              styles.text,
              !filled && styles.textAlt,
              v === 'ghost' && styles.textGhost,
              v === 'dangerSoft' && styles.textDanger,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  secondary: { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primarySoft },
  ghost: { backgroundColor: 'transparent' },
  dangerSoft: { backgroundColor: colors.dangerLight, borderWidth: 1, borderColor: '#F8C4C4' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.55 },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 8 },
  text: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 },
  textAlt: { color: colors.primary },
  textGhost: { color: colors.textSecondary },
  textDanger: { color: colors.dangerDark },
});