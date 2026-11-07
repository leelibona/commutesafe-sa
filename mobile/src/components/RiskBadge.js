import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { riskColors } from '../theme/colors';

export default function RiskBadge({ risk = 'Unknown' }) {
  const c = riskColors[risk] || riskColors.Unknown;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{risk} risk</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  text: { fontSize: 12, fontWeight: '700' },
});
