import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

/** Grey shimmering block shown while data is loading. */
export function SkeletonBlock({ width = '100%', height = 14, style, rounded = 6 }) {
  const v = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const native = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: native }),
        Animated.timing(v, { toValue: 0.5, duration: 700, useNativeDriver: native }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <Animated.View
      style={[{ width, height, borderRadius: rounded, backgroundColor: colors.placeholder, opacity: v }, style]}
    />
  );
}

/** Placeholder that looks like a list row (icon + two lines). */
export function SkeletonRow() {
  return (
    <View style={styles.row}>
      <SkeletonBlock width={40} height={40} rounded={12} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <SkeletonBlock width="55%" height={13} />
        <SkeletonBlock width="80%" height={11} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
});
