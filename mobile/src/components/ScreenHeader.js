import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Illustration from './Illustration';
import { colors, radius, spacing, type } from '../theme/colors';

/**
 * Violet hero header used at the top of every main screen.
 * `children` render inside the header (e.g. a summary card).
 */
export default function ScreenHeader({ eyebrow, title, subtitle, children, center, compact, right, skyline = true }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + (compact ? spacing.lg : spacing.xl) },
        center && { alignItems: 'center' },
      ]}
    >
      {/* Cape Town skyline along the bottom of the header */}
      {skyline ? (
        <View pointerEvents="none" style={styles.skyline}>
          <Illustration name="skyline" width="100%" opacity={0.16} />
        </View>
      ) : null}

      {/* soft decorative circles */}
      <View pointerEvents="none" style={[styles.blob, styles.blobA]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobB]} />

      {right ? (
        // Title block with a button (e.g. notification bell) on the right
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
          </View>
          {right}
        </View>
      ) : (
        <>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {title ? <Text style={[styles.title, center && { textAlign: 'center' }]}>{title}</Text> : null}
        </>
      )}
      {subtitle ? <Text style={[styles.subtitle, center && { textAlign: 'center' }]}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + 4,
    borderBottomLeftRadius: radius.xl + 4,
    borderBottomRightRadius: radius.xl + 4,
    overflow: 'hidden',
  },
  skyline: { position: 'absolute', left: 0, right: 0, bottom: -2 },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: '#FFFFFF' },
  blobA: { width: 220, height: 220, top: -90, right: -70, opacity: 0.07 },
  blobB: { width: 140, height: 140, bottom: -70, left: -40, opacity: 0.05 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  eyebrow: { fontSize: 14, color: colors.textOnPrimaryMuted, fontWeight: '500' },
  title: { ...type.title, fontSize: 26, color: colors.textOnPrimary, marginTop: 2 },
  subtitle: { fontSize: 14, color: colors.textOnPrimaryMuted, marginTop: 6, lineHeight: 20 },
});
