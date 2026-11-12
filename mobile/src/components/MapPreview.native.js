import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { regionFor } from './mapUtils';
import { colors, radius } from '../theme/colors';

/**
 * Interactive map for phones.
 * markers: [{ id, latitude, longitude, title, description, color }]
 * route:   optional [{ latitude, longitude }, ...] drawn as a line
 */
export default function MapPreview({ markers = [], route, height = 200, style, onMarkerPress }) {
  const region = regionFor([...(route || []), ...markers]);

  return (
    <View style={[styles.wrap, { height }, style]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {route && route.length > 1 && (
          <Polyline coordinates={route} strokeColor={colors.primary} strokeWidth={5} />
        )}
        {markers.map(m => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
            description={m.description}
            pinColor={m.color || colors.primary}
            onCalloutPress={onMarkerPress ? () => onMarkerPress(m) : undefined}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.placeholder },
});
