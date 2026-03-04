/**
 * Navigation root — determines which stack to render based on auth + profile state.
 *
 * Logic:
 *   1. On mount: restoreToken() from Keychain
 *   2. isAuthenticated = false → AuthStack (Login / Register)
 *   3. isAuthenticated = true, no profile → OnboardingStack
 *   4. isAuthenticated = true, profile exists → AppStack (tabs)
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { useGetProfileQuery } from '../services/api';
import { useAppSelector } from '../hooks/useRedux';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Onboarding screens
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { PersonalInfoScreen } from '../screens/onboarding/PersonalInfoScreen';
import { FarmSizeScreen } from '../screens/onboarding/FarmSizeScreen';
import { CropSelectionScreen } from '../screens/onboarding/CropSelectionScreen';
import { LocationScreen } from '../screens/onboarding/LocationScreen';
import { ExperienceScreen } from '../screens/onboarding/ExperienceScreen';
import { ReviewScreen } from '../screens/onboarding/ReviewScreen';

// App screens
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';

import type {
  AuthStackParamList,
  OnboardingStackParamList,
  AppTabParamList,
  RootStackParamList,
} from '../types';

// ─── Stack / Tab navigators ────────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const AppTab = createBottomTabNavigator<AppTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// ─── Individual navigators ─────────────────────────────────────────────────────

function AuthNavigator(): React.JSX.Element {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingNavigator(): React.JSX.Element {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#2D7A3A',
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitleVisible: false,
      }}
    >
      <OnboardingStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <OnboardingStack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={{ title: 'Personal Info' }}
      />
      <OnboardingStack.Screen
        name="FarmSize"
        component={FarmSizeScreen}
        options={{ title: 'Farm Size' }}
      />
      <OnboardingStack.Screen
        name="CropSelection"
        component={CropSelectionScreen}
        options={{ title: 'Select Crops' }}
      />
      <OnboardingStack.Screen
        name="Location"
        component={LocationScreen}
        options={{ title: 'Farm Location' }}
      />
      <OnboardingStack.Screen
        name="Experience"
        component={ExperienceScreen}
        options={{ title: 'Your Experience' }}
      />
      <OnboardingStack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: 'Review Profile' }}
      />
    </OnboardingStack.Navigator>
  );
}

function AppNavigator(): React.JSX.Element {
  return (
    <AppTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2D7A3A',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#E0E0E0',
        },
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1A1A1A',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <AppTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon label="🏠" color={color} />
          ),
        }}
      />
      <AppTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabIcon label="👤" color={color} />
          ),
        }}
      />
    </AppTab.Navigator>
  );
}

// Simple emoji-based tab icon (no native vector-icons dependency at runtime)
function TabIcon({ label }: { label: string; color: string }): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Emoji renders on both platforms without native module linking */}
      <Text style={{ fontSize: 20 }}>{label}</Text>
    </View>
  );
}

// ─── Root Navigator ────────────────────────────────────────────────────────────

/**
 * Inner component: can call hooks that depend on auth state.
 * Shown once token restoration completes.
 */
function InnerNavigator(): React.JSX.Element {
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  // Only fetch profile when authenticated — skips if no token
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetProfileQuery(undefined, { skip: !isAuthenticated });

  // While we're checking if a profile exists, show spinner
  if (isAuthenticated && isProfileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2D7A3A" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : isProfileError || !profile ? (
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <RootStack.Screen name="App" component={AppNavigator} />
      )}
    </RootStack.Navigator>
  );
}

/**
 * RootNavigator — restores token on mount then renders InnerNavigator.
 */
export function RootNavigator(): React.JSX.Element {
  const { restoreToken } = useAuth();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    restoreToken().finally(() => setIsRestoring(false));
  }, [restoreToken]);

  if (isRestoring) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2D7A3A" />
      </View>
    );
  }

  return <InnerNavigator />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
