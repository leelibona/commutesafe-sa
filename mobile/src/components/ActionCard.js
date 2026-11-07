import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function ActionCard({ icon, label, onPress, highlighted }) {
  return (
    <TouchableOpacity
      style={[styles.card, highlighted && styles.highlighted]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: colors.primaryLight,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  highlighted: { backgroundColor: colors.dangerLight },
  icon: { fontSize: 32 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 8,
    textAlign: 'center',
  },
});
