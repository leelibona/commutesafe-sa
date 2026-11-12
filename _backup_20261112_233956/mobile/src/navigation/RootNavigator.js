import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RouteRiskScreen from '../screens/RouteRiskScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
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
            <Stack.Screen
              name="Risk"
              component={RouteRiskScreen}
              options={{ ...purpleHeader, title: 'Route risk' }}
            />
            <Stack.Screen
              name="MyReports"
              component={MyReportsScreen}
              options={{ ...purpleHeader, title: 'My reports' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}