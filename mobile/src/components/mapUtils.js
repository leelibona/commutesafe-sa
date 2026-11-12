// Shared helpers for MapPreview (phone and web versions)

/** Works out a map area that fits all the points, with some padding. */
export function regionFor(points, minDelta = 0.02) {
  const valid = points.filter(p => p && p.latitude != null && p.longitude != null);
  if (!valid.length) {
    // Default: Cape Town
    return { latitude: -33.93, longitude: 18.52, latitudeDelta: 0.25, longitudeDelta: 0.25 };
  }
  const lats = valid.map(p => p.latitude);
  const lngs = valid.map(p => p.longitude);
  const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, minDelta),
    longitudeDelta: Math.max((maxLng - minLng) * 1.5, minDelta),
  };
}
