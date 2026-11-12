import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Show notifications even while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let ready = null;

/** Asks for permission once and sets up the Android channel. */
export function setupNotifications() {
  if (ready) return ready;
  ready = (async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'CommuteSafe alerts',
          importance: Notifications.AndroidImportance.HIGH,
          lightColor: '#7B1E3A',
        });
      }
      const current = await Notifications.getPermissionsAsync();
      if (current.granted) return true;
      const asked = await Notifications.requestPermissionsAsync();
      return asked.granted;
    } catch {
      return false;
    }
  })();
  return ready;
}

/** Shows a notification on the phone right away. */
export async function showLocalNotification(title, body) {
  const ok = await setupNotifications();
  if (!ok) return;
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  } catch { /* ignore */ }
}
