import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme/colors';

export default function Card({ children, style, flat }) {
  return <View style={[styles.card, !flat && shadows.md, flat && styles.flat, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  flat: { borderWidth: 1, borderColor: colors.border },
});