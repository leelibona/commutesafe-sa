import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('passenger');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return Alert.alert('Email and password required');
    setLoading(true);
    try {
      await register({ email, password, name, role });
      Alert.alert('Account created', 'You can now sign in');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Registration failed', e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="you@example.com" />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 6 characters" />

      <Text style={styles.label}>I am a</Text>
      <View style={styles.roleRow}>
        {['passenger', 'driver'].map(r => (
          <Text
            key={r}
            onPress={() => setRole(r)}
            style={[styles.roleChip, role === r && styles.roleChipActive, { flex: 1, textAlign: 'center' }]}
          >
            {r}
          </Text>
        ))}
      </View>

      <PrimaryButton title="Create Account" onPress={submit} loading={loading} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 40, backgroundColor: '#fff', minHeight: '100vh' },
  title: { fontSize: 26, fontWeight: '800', color: colors.primary, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14 },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleChip: {
    padding: 12, borderRadius: 10, borderWidth: 1,
    borderColor: colors.border, color: colors.primary, textTransform: 'capitalize',
  },
  roleChipActive: { backgroundColor: colors.primary, color: '#fff', borderColor: colors.primary },
});
