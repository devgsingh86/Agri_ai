/**
 * WelcomeScreen — onboarding entry point.
 * Checks server for existing progress so the user can resume where they left off.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGetProgressQuery } from '../../services/api';
import { hydrateFromProgress, setCurrentStep } from '../../store/onboardingSlice';
import { useAppDispatch } from '../../hooks/useRedux';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import type { OnboardingStackParamList, OnboardingState } from '../../types';

type WelcomeNav = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export function WelcomeScreen(): React.JSX.Element {
  const navigation = useNavigation<WelcomeNav>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [resumeStep, setResumeStep] = useState<number | null>(null);

  const { data: progress, isLoading, isError } = useGetProgressQuery();

  // Parse saved progress and store the resume step
  useEffect(() => {
    if (progress && progress.current_step > 1 && progress.saved_data) {
      const savedState = progress.saved_data as Partial<OnboardingState>;
      dispatch(hydrateFromProgress({ ...savedState, currentStep: progress.current_step }));
      setResumeStep(progress.current_step);
    }
  }, [progress, dispatch]);

  const startFresh = () => {
    dispatch(setCurrentStep(1));
    navigation.navigate('PersonalInfo');
  };

  const resumeOnboarding = () => {
    if (resumeStep === null) return;
    dispatch(setCurrentStep(resumeStep));
    // Map step numbers to screen names type-safely
    const stepScreenMap: Record<number, keyof OnboardingStackParamList> = {
      2: 'PersonalInfo',
      3: 'FarmSize',
      4: 'CropSelection',
      5: 'Location',
      6: 'Experience',
    };
    const screenName = stepScreenMap[resumeStep] ?? 'PersonalInfo';
    navigation.navigate(screenName);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D7A3A" />
        <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🌾</Text>
        <Text style={styles.heroTitle}>AgriAI</Text>
        <Text style={styles.heroSubtitle}>
          {t('welcomeSubtitle')}
        </Text>
      </View>

      {/* Feature highlights */}
      <View style={styles.features}>
        {[
          { icon: '📍', text: 'Location-aware crop recommendations' },
          { icon: '🌡️', text: 'Real-time weather & soil insights' },
          { icon: '📊', text: 'Personalised farm analytics' },
        ].map(({ icon, text }) => (
          <View key={text} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureText}>{text}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isError && (
          <Text style={styles.errorNote}>
            ⚠️ Could not check existing progress — starting fresh.
          </Text>
        )}

        {resumeStep !== null && resumeStep > 1 && (
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={resumeOnboarding}
            accessibilityRole="button"
            accessibilityLabel="Resume onboarding"
          >
            <Text style={styles.resumeText}>
              ▶ {t('resumeProgress')} — Step {resumeStep} of 5
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.startButton}
          onPress={startFresh}
          accessibilityRole="button"
          accessibilityLabel="Start onboarding"
        >
          <Text style={styles.startText}>
            {resumeStep && resumeStep > 1 ? t('startFresh') : `${t('getStarted')} →`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Sign in to existing account"
        >
          <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroEmoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5FBF5',
    borderRadius: 12,
    padding: 14,
    gap: 14,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
  },
  errorNote: {
    fontSize: 13,
    color: '#E65100',
    textAlign: 'center',
    marginBottom: 4,
  },
  resumeButton: {
    borderWidth: 2,
    borderColor: '#2D7A3A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resumeText: {
    fontSize: 16,
    color: '#2D7A3A',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#2D7A3A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
  loginLinkBold: {
    color: '#2D7A3A',
    fontWeight: '700',
  },
});
