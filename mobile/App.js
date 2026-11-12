import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ToastProvider } from './src/components/Toast';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import Icon from './src/components/Icon';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

function AppInner() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <View style={styles.logo}><Icon name="shield-checkmark" size={38} color="#fff" /></View>
        <Text style={styles.brand}>CommuteSafe SA</Text>
        <ActivityIndicator size="small" color="#fff" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <NotificationsProvider>
              <AppInner />
            </NotificationsProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  logo: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  brand: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 16, letterSpacing: -0.3 },
});
