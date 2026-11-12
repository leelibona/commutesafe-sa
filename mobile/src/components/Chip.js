import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, radius } from '../theme/colors';

export default function Chip({ label, icon, selected, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipActive,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {icon ? (
        <Icon name={icon} size={15} color={selected ? '#fff' : colors.textMuted} style={{ marginRight: 6 }} />
      ) : null}
      <Text style={[styles.text, selected && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  textActive: { color: '#fff' },
});