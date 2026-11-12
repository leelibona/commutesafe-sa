import { Platform } from 'react-native';
import * as Location from 'expo-location';

/**
 * Gets the phone's GPS position (asks permission the first time).
 * Returns { latitude, longitude, label } or throws an Error with a friendly message.
 * `label` is a readable street/suburb on phones; on web it falls back to coordinates.
 */
// Rejects if a step takes too long (e.g. weak GPS signal indoors)
export function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

export async function getCurrentPlace({ withAddress = true, timeoutMs = 10000 } = {}) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission was denied. You can allow it in your phone settings.');
  }

  let pos;
  try {
    pos = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      timeoutMs,
      'Could not get a GPS fix. Try again outside or type the location instead.'
    );
  } catch (e) {
    // Fall back to the last known position if we have one
    const last = await Location.getLastKnownPositionAsync().catch(() => null);
    if (!last) throw e;
    pos = last;
  }
  const { latitude, longitude } = pos.coords;
  let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

  // Address lookup only works on Android/iOS
  if (withAddress && Platform.OS !== 'web') {
    try {
      const [place] = await withTimeout(
        Location.reverseGeocodeAsync({ latitude, longitude }), 5000, 'Address lookup timed out'
      );
      if (place) {
        const parts = [place.street || place.name, place.district || place.subregion, place.city]
          .filter(Boolean);
        if (parts.length) label = [...new Set(parts)].join(', ');
      }
    } catch {
      // keep the coordinate label
    }
  }

  return { latitude, longitude, label };
}
