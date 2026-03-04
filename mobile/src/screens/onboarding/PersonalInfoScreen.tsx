/**
 * PersonalInfoScreen — Step 1 of 5.
 * Collects firstName, lastName, phoneNumber.
 * Auto-saves progress to server on Next.
 */
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { personalInfoSchema, PersonalInfoFormValues } from '../../utils/validation';
import { setPersonalInfo, nextStep } from '../../store/onboardingSlice';
import { useSaveProgressMutation } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { StepNavigation } from '../../components/StepNavigation';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PersonalInfo'>;

export function PersonalInfoScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const savedInfo = useAppSelector((s) => s.onboarding.personalInfo);
  const onboardingState = useAppSelector((s) => s.onboarding);
  const [saveProgress, { isLoading }] = useSaveProgressMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoFormValues>({
    resolver: yupResolver(personalInfoSchema),
    defaultValues: {
      firstName: savedInfo.firstName,
      lastName: savedInfo.lastName,
      phoneNumber: savedInfo.phoneNumber,
    },
  });

  const onNext = async (values: PersonalInfoFormValues) => {
    dispatch(setPersonalInfo({
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber ?? '',
    }));
    dispatch(nextStep());

    // Auto-save progress to server (non-blocking failure)
    try {
      await saveProgress({
        current_step: 2,
        saved_data: {
          ...onboardingState,
          personalInfo: {
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: values.phoneNumber ?? '',
          },
          currentStep: 2,
        },
      }).unwrap();
    } catch {
      // Silent — progress save is best-effort
    }

    navigation.navigate('FarmSize');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ProgressIndicator currentStep={1} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>
          Your name helps us personalise your experience.
        </Text>

        {/* First Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            First Name <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="e.g. Rajesh"
                placeholderTextColor="#999"
                returnKeyType="next"
                autoCapitalize="words"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                accessibilityLabel="First name"
              />
            )}
          />
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName.message}</Text>
          )}
        </View>

        {/* Last Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Last Name <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="e.g. Kumar"
                placeholderTextColor="#999"
                returnKeyType="next"
                autoCapitalize="words"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                accessibilityLabel="Last name"
              />
            )}
          />
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName.message}</Text>
          )}
        </View>

        {/* Phone Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone Number <Text style={styles.optional}>(optional)</Text></Text>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.phoneNumber && styles.inputError]}
                placeholder="+91 98765 43210"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                returnKeyType="done"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                accessibilityLabel="Phone number"
              />
            )}
          />
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
          )}
          <Text style={styles.hint}>E.164 format recommended: +91 XXXXX XXXXX</Text>
        </View>
      </ScrollView>

      <StepNavigation
        onBack={() => navigation.goBack()}
        onNext={handleSubmit(onNext)}
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  required: { color: '#E53935' },
  optional: { fontSize: 12, color: '#999', fontWeight: '400' },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: '#E53935' },
  errorText: { fontSize: 12, color: '#E53935', marginTop: 4 },
  hint: { fontSize: 12, color: '#999', marginTop: 4 },
});
