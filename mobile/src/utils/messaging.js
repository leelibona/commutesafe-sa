import { Linking, Platform, Share } from 'react-native';

/** Google Maps link for a position (works on any phone or browser). */
export const mapsLink = (lat, lng) =>
  lat != null && lng != null ? `https://maps.google.com/?q=${lat},${lng}` : null;

/** 0821234567 / +27821234567 → 27821234567 (format WhatsApp needs) */
export const toInternational = (phone = '') => {
  const p = phone.replace(/[^\d+]/g, '');
  if (p.startsWith('+')) return p.slice(1);
  if (p.startsWith('0')) return `27${p.slice(1)}`;
  return p;
};

/** 0821234567 → 082 123 4567 */
export const formatPhone = (phone = '') => {
  const p = phone.replace(/\D/g, '');
  if (p.length === 10) return `${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6)}`;
  if (p.length === 11 && p.startsWith('27')) return `+27 ${p.slice(2, 4)} ${p.slice(4, 7)} ${p.slice(7)}`;
  return phone;
};

export function openSms(phone, body) {
  // iOS uses "&body=", Android uses "?body="
  const sep = Platform.OS === 'ios' ? '&' : '?';
  return Linking.openURL(`sms:${phone}${sep}body=${encodeURIComponent(body)}`).catch(() => {});
}

export function openWhatsApp(phone, body) {
  return Linking.openURL(`https://wa.me/${toInternational(phone)}?text=${encodeURIComponent(body)}`).catch(() => {});
}

export const callNumber = (number) =>
  Linking.openURL(`tel:${number.replace(/\s/g, '')}`).catch(() => {});

/**
 * Opens the phone's share sheet (WhatsApp, SMS, email…).
 * Returns false if sharing isn't available (some desktop browsers).
 */
export async function shareText(message) {
  try {
    await Share.share({ message });
    return true;
  } catch {
    return false;
  }
}

export const sosMessage = (name, lat, lng) => {
  const link = mapsLink(lat, lng);
  return `🆘 EMERGENCY${name ? ` from ${name}` : ''}: I need help.${link ? ` My location: ${link}` : ''} (sent with CommuteSafe SA)`;
};

export const tripMessage = (trip, name) => {
  const time = new Date(trip.started_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${name ? `${name} here. ` : ''}I'm taking a taxi from ${trip.origin} to ${trip.destination}` +
    `${trip.registration_number ? ` (registration ${trip.registration_number})` : ''}, leaving at ${time}. ` +
    "I'll let you know when I arrive. – CommuteSafe SA";
};

export const arrivedMessage = (trip) =>
  `I've arrived safely at ${trip.destination}. – CommuteSafe SA`;
