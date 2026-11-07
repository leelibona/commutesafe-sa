import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('test1@test.com');
  const [password, setPassword] = useState('pass123');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return Alert.alert('Enter email and password');
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      Alert.alert('Login failed', e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>CommuteSafe SA</Text>
        <Text style={styles.subtitle}>Travel. Report. Stay safe.</Text>
      </View>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      <PrimaryButton title="Sign In" onPress={submit} loading={loading} style={{ marginTop: 20 }} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
        <Text style={styles.linkText}>New here? <Text style={styles.linkBold}>Create an account</Text></Text>
      </TouchableOpacity>

      <Text style={styles.demoHint}>
        Demo credentials are pre-filled. Use test1@test.com / pass123.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, backgroundColor: '#fff', minHeight: '100vh' },
  hero: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, fontSize: 15 },
  linkRow: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 14, color: colors.textMuted },
  linkBold: { color: colors.primary, fontWeight: '600' },
  demoHint: { marginTop: 32, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});
