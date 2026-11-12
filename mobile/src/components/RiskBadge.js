import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { riskColors, radius } from '../theme/colors';

export default function RiskBadge({ risk = 'Unknown', style }) {
  const c = riskColors[risk] || riskColors.Unknown;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: c.hex }]} />
      <Text style={[styles.text, { color: c.text }]}>{risk} risk</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  text: { fontSize: 12, fontWeight: '700' },
});