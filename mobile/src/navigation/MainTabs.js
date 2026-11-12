import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import ReportScreen from '../screens/ReportScreen';
import SosScreen from '../screens/SosScreen';
import CheckVehicleScreen from '../screens/CheckVehicleScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Icon from '../components/Icon';
import { colors, shadows } from '../theme/colors';
import { useT } from '../i18n/LanguageContext';

const Tab = createBottomTabNavigator();

// [icon when selected, icon when not selected]
const icons = {
  Home: ['home', 'home-outline'],
  Report: ['create', 'create-outline'],
  SOS: ['alert-circle', 'alert-circle'],
  Check: ['search', 'search-outline'],
  Profile: ['person', 'person-outline'],
};

function TabIcon({ name, focused }) {
  const isSos = name === 'SOS';
  return (
    <View
      style={[
        styles.iconWrap,
        focused && styles.iconWrapActive,
        isSos && styles.sosWrap,
        isSos && focused && styles.sosWrapActive,
      ]}
    >
      <Icon
        name={icons[name][focused ? 0 : 1]}
        size={isSos ? 22 : 21}
        color={isSos ? colors.danger : focused ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const t = useT();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: route.name === 'SOS' ? colors.danger : colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarStyle: [
          styles.tabBar,
          shadows.lg,
          { height: 66 + insets.bottom, paddingBottom: Math.max(insets.bottom, 8) },
        ],
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tab.home') }} />
      <Tab.Screen name="Report" component={ReportScreen} options={{ title: t('tab.report') }} />
      <Tab.Screen name="SOS" component={SosScreen} options={{ title: t('tab.sos') }} />
      <Tab.Screen name="Check" component={CheckVehicleScreen} options={{ title: t('tab.check') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tab.profile') }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
  },
  iconWrap: {
    width: 44, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.primaryLight },
  sosWrap: { backgroundColor: colors.dangerLight },
  sosWrapActive: { backgroundColor: '#FBD5D5' },
});
