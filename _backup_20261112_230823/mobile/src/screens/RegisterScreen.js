import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { useToast, friendlyError } from '../components/Toast';
import { validateEmail, validateName, validatePassword } from '../utils/validation';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

const ROLES = [
  { key: 'passenger', icon: 'walk-outline', label: 'Passenger', sub: 'I ride taxis & buses' },
  { key: 'driver', icon: 'bus-outline', label: 'Driver', sub: 'I operate a vehicle' },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('passenger');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const clear = (field) => errors[field] && setErrors(e => ({ ...e, [field]: '' }));

  const submit = async () => {
    const next = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      await register({ email: email.trim().toLowerCase(), password, name: name.trim(), role });
      toast.show('Account created', { type: 'success', message: 'You can now sign in.' });
      navigation.goBack();
    } catch (e) {
      const msg = e.response?.status === 409
        ? 'An account with this email already exists. Try signing in instead.'
        : friendlyError(e);
      toast.show('Could not create account', { type: 'error', message: msg });
    } finally { setLoading(false); }
  };

  return (
    <Screen tabbed={false} contentStyle={{ paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.xl }}>
      <StatusBar style="dark" />
      <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
        <Icon name="chevron-back" size={20} color={colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join commuters keeping each other safe</Text>

      <TextField
        label="Full name" icon="person-outline" value={name} error={errors.name}
        onChangeText={(v) => { setName(v); clear('name'); }} placeholder="Your name"
      />
      <TextField
        label="Email" icon="mail-outline" value={email} error={errors.email}
        onChangeText={(v) => { setEmail(v); clear('email'); }}
        autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com"
      />
      <TextField
        label="Password" icon="lock-closed-outline" value={password} error={errors.password}
        onChangeText={(v) => { setPassword(v); clear('password'); }}
        secureTextEntry placeholder="At least 6 characters"
        hint="Use 6 or more characters"
      />

      <Text style={styles.label}>I am a</Text>
      <View style={styles.roleRow}>
        {ROLES.map(r => {
          const active = role === r.key;
          return (
            <Pressable
              key={r.key}
              onPress={() => setRole(r.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.roleCard, active ? [styles.roleCardActive, shadows.sm] : null]}
            >
              <View style={[styles.roleIconTile, active && { backgroundColor: colors.primary }]}>
                <Icon name={r.icon} size={22} color={active ? '#fff' : colors.primary} />
              </View>
              <Text style={[styles.roleLabel, active && { color: colors.primary }]}>{r.label}</Text>
              <Text style={styles.roleSub}>{r.sub}</Text>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton title="Create Account" onPress={submit} loading={loading} style={{ marginTop: spacing.xxl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingVertical: spacing.sm, marginBottom: spacing.md, marginLeft: -4,
  },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  title: { ...type.title, fontSize: 28 },
  subtitle: { ...type.body, color: colors.textMuted, marginTop: 4, marginBottom: spacing.sm },
  label: { ...type.label, marginTop: spacing.lg, marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: spacing.md },
  roleCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleCardActive: { borderColor: colors.primary, backgroundColor: '#FBF9FF' },
  roleIconTile: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  roleLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  roleSub: { ...type.caption, marginTop: 2 },
  radio: {
    position: 'absolute', top: 14, right: 14,
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});