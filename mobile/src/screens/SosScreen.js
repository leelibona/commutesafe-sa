import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../api/client';
import { colors } from '../theme/colors';

export default function SosScreen() {
  const [loading, setLoading] = useState(false);

  const sendSOS = async () => {
    setLoading(true);
    try {
      let coords = { latitude: null, longitude: null };
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        coords = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
            () => resolve({ latitude: null, longitude: null }),
            { timeout: 4000 }
          );
        });
      }
      const { data } = await api.post('/sos', coords);
      Alert.alert('SOS sent', `Notified: ${data.notified.join(', ')}`);
    } catch (e) {
      Alert.alert('SOS failed', e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Alert</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          For genuine emergencies only. False alerts may delay responses to others.
        </Text>
      </View>

      <TouchableOpacity style={styles.sosBtn} onPress={sendSOS} disabled={loading} activeOpacity={0.7}>
        <Text style={styles.sosIcon}>⚠️</Text>
        <Text style={styles.sosText}>{loading ? '...' : 'SOS'}</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Press to send an alert with your live location</Text>

      <Text style={styles.notifyLabel}>Alert will notify</Text>
      <View style={styles.services}>
        {['SAPS 10111', 'Netcare 911', 'ER24'].map(s => (
          <View key={s} style={styles.service}><Text>{s}</Text></View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 48, backgroundColor: '#fff', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary },
  banner: { backgroundColor: colors.warningLight, padding: 12, borderRadius: 10, marginTop: 20, width: '100%' },
  bannerText: { fontSize: 12, color: '#856404', textAlign: 'center' },
  sosBtn: {
    width: 220, height: 220, borderRadius: 110, backgroundColor: colors.danger,
    alignItems: 'center', justifyContent: 'center', marginTop: 32,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  sosIcon: { fontSize: 60 },
  sosText: { fontSize: 40, fontWeight: '900', color: '#fff' },
  hint: { marginTop: 20, color: colors.textMuted },
  notifyLabel: { marginTop: 32, color: colors.textMuted },
  services: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' },
  service: { backgroundColor: '#F5F5F5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
});
