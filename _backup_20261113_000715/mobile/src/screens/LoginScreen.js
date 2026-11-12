import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { useToast, friendlyError } from '../components/Toast';
import { validateEmail, validatePassword } from '../utils/validation';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('test1@test.com');
  const [password, setPassword] = useState('pass123');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const submit = async () => {
    const next = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(next);
    if (next.email || next.password) return;

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      const msg = e.response?.status === 401
        ? 'That email and password combination is incorrect.'
        : friendlyError(e);
      toast.show('Sign in failed', { type: 'error', message: msg });
    } finally { setLoading(false); }
  };

  return (
    <Screen tabbed={false} background={colors.primary} contentStyle={{ paddingBottom: 0 }}>
      <View style={[styles.hero, { paddingTop: insets.top + 56 }]}>
        <View pointerEvents="none" style={styles.blob} />
        <View style={styles.logo}><Icon name="shield-checkmark" size={40} color="#fff" /></View>
        <Text style={styles.title}>CommuteSafe SA</Text>
        <Text style={styles.subtitle}>Travel. Report. Stay safe.</Text>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Text style={styles.sheetTitle}>Welcome back</Text>
        <Text style={styles.sheetSub}>Sign in to continue your journey</Text>

        <TextField
          label="Email"
          icon="mail-outline"
          value={email}
          onChangeText={(v) => { setEmail(v); if (errors.email) setErrors(e => ({ ...e, email: '' })); }}
          error={errors.email}
          autoComplete="email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={(v) => { setPassword(v); if (errors.password) setErrors(e => ({ ...e, password: '' })); }}
          error={errors.password}
          secureTextEntry
          onSubmitEditing={submit}
          returnKeyType="go"
          placeholder="••••••••"
        />

        <PrimaryButton title="Sign In" onPress={submit} loading={loading} style={{ marginTop: spacing.xl }} />

        <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
          <Text style={styles.linkText}>
            New here? <Text style={styles.linkBold}>Create an account</Text>
          </Text>
        </Pressable>

        <View style={styles.demo}>
          <Icon name="bulb-outline" size={16} color={colors.primaryDark} />
          <Text style={styles.demoText}>
            Demo credentials are pre-filled: test1@test.com / pass123
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingBottom: 48, overflow: 'hidden' },
  blob: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: '#fff', opacity: 0.06, top: -120, right: -120,
  },
  logo: {
    width: 76, height: 76, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { ...type.display, color: '#fff', marginTop: spacing.lg },
  subtitle: { fontSize: 15, color: colors.textOnPrimaryMuted, marginTop: 6 },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    ...shadows.lg,
  },
  sheetTitle: { ...type.title },
  sheetSub: { ...type.body, color: colors.textMuted, marginTop: 4, marginBottom: spacing.sm },
  linkRow: { marginTop: spacing.xl, alignItems: 'center', padding: spacing.sm },
  linkText: { fontSize: 14, color: colors.textMuted },
  linkBold: { color: colors.primary, fontWeight: '700' },
  demo: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoText: { fontSize: 12, color: colors.primaryDark, marginLeft: 6, flexShrink: 1 },
});