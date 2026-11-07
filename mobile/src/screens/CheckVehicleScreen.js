import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../api/client';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';

export default function CheckVehicleScreen() {
  const [reg, setReg] = useState('CA 847-211');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!reg) return Alert.alert('Enter a registration number');
    setLoading(true);
    try {
      const { data } = await api.get(`/vehicles/${encodeURIComponent(reg)}`);
      setResult(data);
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  const flagged = result && result.flag_status === 'flagged';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Check a Vehicle</Text>
      <Text style={styles.subtitle}>Look up a registration before you board</Text>

      <TextInput
        style={styles.input}
        value={reg}
        onChangeText={setReg}
        autoCapitalize="characters"
        placeholder="CA 847-211"
      />

      <PrimaryButton title="Check" onPress={check} loading={loading} style={{ marginTop: 12 }} />

      {result && (
        <View style={[styles.resultCard, flagged ? styles.flagged : styles.clear]}>
          <Text style={styles.resultTitle}>
            {flagged ? '⚠️ FLAGGED VEHICLE' : '✓ CLEAR VEHICLE'}
          </Text>
          <Text style={styles.reg}>{result.registration_number || reg}</Text>
          {flagged && (
            <>
              <Text style={styles.detail}>Driver: {result.name || 'Unknown'}</Text>
              <Text style={styles.detail}>Reports: {result.report_count ?? 0}</Text>
              <Text style={styles.detail}>Latest: {result.latest_report || 'N/A'}</Text>
              <Text style={styles.warning}>Exercise caution before boarding.</Text>
            </>
          )}
          {!flagged && result.message && (
            <Text style={styles.detail}>{result.message}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 32, backgroundColor: '#fff', minHeight: '100vh' },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary },
  subtitle: { color: colors.textMuted, marginTop: 4, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, fontSize: 15 },
  resultCard: { padding: 20, borderRadius: 12, marginTop: 24, borderWidth: 1 },
  flagged: { backgroundColor: colors.dangerLight, borderColor: colors.danger },
  clear: { backgroundColor: colors.successLight, borderColor: colors.success },
  resultTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  reg: { fontSize: 22, fontWeight: '800', color: '#222' },
  detail: { fontSize: 14, color: '#444', marginTop: 6 },
  warning: { marginTop: 12, color: colors.danger, fontWeight: '700' },
});
