import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'notificationSettings';

export const DEFAULT_SETTINGS = {
  popups: true,          // show phone notifications for new alerts
  vehicleFlagged: true,  // a vehicle you reported got flagged
  reportUpdates: true,   // your report was received / progress updates
};

export async function getSettings() {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return { ...DEFAULT_SETTINGS, ...(v ? JSON.parse(v) : {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
}

// Which setting controls each notification type from the server
export const SETTING_FOR_TYPE = {
  vehicle_flagged: 'vehicleFlagged',
  report_received: 'reportUpdates',
};
