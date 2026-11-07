import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import api from '../api/client';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';

const CATEGORIES = ['Reckless driving', 'Overloading', 'Harassment', 'Crime', 'Other'];

export default function ReportScreen({ navigation }) {
  const [category, setCategory] = useState('Reckless driving');
  const [description, setDescription] = useState('');
  const [registration, setRegistration] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!category) return Alert.alert('Select a category');
    setLoading(true);
    try {
      const { data } = await api.post('/reports', {
        category, description, registration_number: registration || null, location,
      });
      if (data.flag) {
        Alert.alert(
          'Report submitted',
          `Vehicle ${registration} now has ${data.flag.report_count} report(s). Status: ${data.flag.status}.`
        );
      } else {
        Alert.alert('Report submitted', 'Thank you for keeping commuters safe.');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Failed', e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report an Incident</Text>
      <Text style={styles.subtitle}>Your report helps keep others safe</Text>

      <Text style={styles.label}>Category</Text>
      <View style={styles.chips}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Vehicle registration (optional)</Text>
      <TextInput
        style={styles.input}
        value={registration}
        onChangeText={setRegistration}
        placeholder="e.g. CA 847-211"
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. N2 near Woodstock"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="What happened?"
      />

      <PrimaryButton title="Submit Report" onPress={submit} loading={loading} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 32, backgroundColor: '#fff', minHeight: '100vh' },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary },
  subtitle: { color: colors.textMuted, marginTop: 4, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: '#E0D5F5' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.primary },
  chipTextActive: { color: '#fff' },
});
