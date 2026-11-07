import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ActionCard from '../components/ActionCard';
import { colors } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/reports/recent/nearby')
      .then(r => setRecent(r.data))
      .catch(() => {});
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good day{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Text>
        <Text style={styles.title}>CommuteSafe SA</Text>
        <View style={styles.routeCard}>
          <Text style={styles.routeText}>Cape Town CBD → Bellville</Text>
          <Text style={styles.routeSub}>Current route · Moderate risk</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <ActionCard icon="⚠️" label="Report Incident" onPress={() => navigation.navigate('Report')} />
        <ActionCard icon="🔍" label="Check Vehicle" onPress={() => navigation.navigate('Check')} />
        <ActionCard icon="🗺️" label="Route Risk Map" onPress={() => navigation.navigate('Risk')} />
        <ActionCard icon="🆘" label="Emergency SOS" highlighted onPress={() => navigation.navigate('SOS')} />
      </View>

      <Text style={styles.sectionTitle}>Recent reports near you</Text>
      {recent.length === 0 && (
        <Text style={styles.empty}>No reports yet. You'll be the first to know.</Text>
      )}
      {recent.map(r => (
        <View key={r.report_id} style={styles.reportItem}>
          <Text style={styles.reportCategory}>{r.category}</Text>
          <Text style={styles.reportMeta}>{r.location || 'Location unknown'} · {new Date(r.created_at).toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: 20, paddingTop: 60, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  greeting: { color: '#D9C9F5', fontSize: 14 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 2 },
  routeCard: { backgroundColor: colors.primaryDark, padding: 14, borderRadius: 12, marginTop: 14 },
  routeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  routeSub: { color: '#C9B5F0', fontSize: 12, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  empty: { paddingHorizontal: 16, color: colors.textMuted, fontSize: 13 },
  reportItem: { marginHorizontal: 16, marginBottom: 8, padding: 12, backgroundColor: colors.backgroundAlt, borderRadius: 10 },
  reportCategory: { fontWeight: '600', fontSize: 14 },
  reportMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
