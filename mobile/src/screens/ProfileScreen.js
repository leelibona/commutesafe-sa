import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Sign out?', 'You will need to log in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Guest User'}</Text>
        <Text style={styles.role}>{user?.role || 'passenger'} · Verified</Text>
      </View>

      <View style={styles.list}>
        <Row icon="📄" label="My reports" sub="6 submitted" />
        <Row icon="📞" label="Emergency contacts" sub="2 added" />
        <Row icon="🔔" label="Notification settings" sub="" />
        <Row icon="🌐" label="Language" sub="English" />
        <Row icon="ℹ️" label="About CommuteSafe SA" sub="v1.0" />
      </View>

      <PrimaryButton title="Sign Out" danger onPress={confirmLogout} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

function Row({ icon, label, sub }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.6}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40, backgroundColor: '#fff', minHeight: '100vh' },
  hero: { backgroundColor: colors.primary, padding: 24, paddingTop: 60, alignItems: 'center' },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryDark,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, color: '#fff', fontWeight: '800' },
  name: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 12 },
  role: { color: '#D9C9F5', fontSize: 13, marginTop: 4, textTransform: 'capitalize' },
  list: { padding: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: colors.backgroundAlt, borderRadius: 12, marginBottom: 10,
  },
  rowIcon: { fontSize: 20, marginRight: 12 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rowChevron: { fontSize: 20, color: colors.textMuted },
});
