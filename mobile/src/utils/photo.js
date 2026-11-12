import * as ImagePicker from 'expo-image-picker';

/**
 * Lets the user take or choose a photo.
 * Returns { uri, base64 } ready to preview and upload, or null if cancelled.
 * Throws an Error with a friendly message if permission is denied.
 */
export async function pickPhoto({ camera = false } = {}) {
  const perm = camera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error(camera
      ? 'Camera permission was denied. You can allow it in your phone settings.'
      : 'Photo library permission was denied. You can allow it in your phone settings.');
  }

  const options = {
    mediaTypes: ['images'],
    quality: 0.5, // keeps uploads small (usually under 1 MB)
    base64: true,
    allowsEditing: true,
    exif: false,
  };
  const result = camera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const mime = asset.mimeType || 'image/jpeg';
  let base64 = asset.base64 ? `data:${mime};base64,${asset.base64}` : null;
  // On web the picker returns a data: URI instead of base64
  if (!base64 && asset.uri?.startsWith('data:')) base64 = asset.uri;
  if (!base64) throw new Error('Could not read that photo. Please try another one.');

  return { uri: asset.uri, base64 };
}