import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { regionFor } from './mapUtils';
import { colors, radius } from '../theme/colors';

/**
 * Browser version: react-native-maps doesn't run on web, so we embed an
 * OpenStreetMap view of the same area. Pins are shown on the phone app.
 */
export default function MapPreview({ markers = [], route, height = 200, style }) {
  const r = regionFor([...(route || []), ...markers]);
  const bbox = [
    r.longitude - r.longitudeDelta / 2,
    r.latitude - r.latitudeDelta / 2,
    r.longitude + r.longitudeDelta / 2,
    r.latitude + r.latitudeDelta / 2,
  ].map(n => n.toFixed(4)).join('%2C');
  const single = markers.length === 1 ? `&marker=${markers[0].latitude}%2C${markers[0].longitude}` : '';
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${single}`;

  return (
    <View style={[styles.wrap, { height }, style]}>
      {React.createElement('iframe', {
        src,
        title: 'Map',
        loading: 'lazy',
        style: { border: 0, width: '100%', height: '100%' },
      })}
      <View style={styles.note} pointerEvents="none">
        <Text style={styles.noteText}>© OpenStreetMap · pins show in the phone app</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.placeholder },
  note: {
    position: 'absolute', left: 8, bottom: 8,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  noteText: { fontSize: 10, color: colors.textSecondary },
});
