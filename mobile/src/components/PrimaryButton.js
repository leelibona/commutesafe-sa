import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export default function PrimaryButton({ title, onPress, loading, danger, style }) {
  return (
    <TouchableOpacity
      style={[styles.btn, danger && styles.danger, style]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  danger: { backgroundColor: colors.danger },
  text: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
