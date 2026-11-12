// Web version: uses the browser's notification API when allowed.

export async function setupNotifications() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

export async function showLocalNotification(title, body) {
  if (await setupNotifications()) {
    try { new Notification(title, { body }); } catch { /* ignore */ }
  }
}
