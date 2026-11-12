import { Platform } from 'react-native';
import * as Location from 'expo-location';

/**
 * Gets the phone's GPS position (asks permission the first time).
 * Returns { latitude, longitude, label } or throws an Error with a friendly message.
 * `label` is a readable street/suburb on phones; on web it falls back to coordinates.
 */
export async function getCurrentPlace({ withAddress = true } = {}) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission was denied. You can allow it in your phone settings.');
  }

  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude, longitude } = pos.coords;
  let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

  // Address lookup only works on Android/iOS
  if (withAddress && Platform.OS !== 'web') {
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
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