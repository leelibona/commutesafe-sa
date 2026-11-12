import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, radius, shadows, spacing } from '../theme/colors';

export default function ActionCard({ icon, label, sub, onPress, highlighted }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        shadows.md,
        highlighted && styles.highlighted,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconTile, highlighted && styles.iconTileDanger]}>
        <Icon name={icon} size={24} color={highlighted ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.label, highlighted && { color: colors.dangerDark }]}>{label}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  highlighted: { backgroundColor: '#FFF7F7', borderColor: '#FBD5D5' },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileDanger: { backgroundColor: colors.dangerLight },
  label: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});