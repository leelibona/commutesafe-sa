import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RouteRiskScreen from '../screens/RouteRiskScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import ContactsScreen from '../screens/ContactsScreen';
import TripScreen from '../screens/TripScreen';
import RanksScreen from '../screens/RanksScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import LanguageScreen from '../screens/LanguageScreen';
import { useT } from '../i18n/LanguageContext';
import MainTabs from './MainTabs';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

// Shared look for stack screens that show a header bar
const purpleHeader = {
  headerShown: true,
  headerTintColor: '#fff',
  headerStyle: { backgroundColor: colors.primary },
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
  headerBackTitle: 'Back',
};

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background },
};

export default function RootNavigator() {
  const { token } = useAuth();
  const t = useT();
  // Small helper so each screen below is one line
  const page = (name, component, title) => (
    <Stack.Screen key={name} name={name} component={component} options={{ ...purpleHeader, title }} />
  );

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            {page('Risk', RouteRiskScreen, t('home.risk'))}
            {page('MyReports', MyReportsScreen, t('profile.myReports'))}
            {page('Contacts', ContactsScreen, t('contacts.title'))}
            {page('Trip', TripScreen, t('trip.title'))}
            {page('Ranks', RanksScreen, t('ranks.title'))}
            {page('Notifications', NotificationsScreen, t('notif.title'))}
            {page('NotificationSettings', NotificationSettingsScreen, t('notif.settings'))}
            {page('Language', LanguageScreen, t('lang.title'))}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
