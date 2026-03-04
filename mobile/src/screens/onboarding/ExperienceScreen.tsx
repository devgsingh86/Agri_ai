/**
 * ExperienceScreen — Step 5 of 5.
 * Radio buttons for experience level + optional years input.
 */
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import { experienceSchema, ExperienceFormValues } from '../../utils/validation';
import { setExperience, nextStep } from '../../store/onboardingSlice';
import { useSaveProgressMutation } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { StepNavigation } from '../../components/StepNavigation';
import type { OnboardingStackParamList, ExperienceLevel } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Experience'>;

interface LevelOption {
  value: ExperienceLevel;
  label: string;
  description: string;
  icon: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to farming (< 2 years)',
    icon: '🌱',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Some experience (2–5 years)',
    icon: '🌿',
  },
  {
    value: 'experienced',
    label: 'Experienced',
    description: 'Confident farmer (5–15 years)',
    icon: '🌾',
  },
  {
    value: 'expert',
    label: 'Expert',
    description: 'Seasoned professional (15+ years)',
    icon: '🏆',
  },
];

export function ExperienceScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const savedExp = useAppSelector((s) => s.onboarding.experience);
  const onboardingState = useAppSelector((s) => s.onboarding);
  const [saveProgress, { isLoading }] = useSaveProgressMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: yupResolver(experienceSchema),
    defaultValues: {
      level: (savedExp.level as ExperienceLevel) || undefined,
      yearsOfExperience: savedExp.yearsOfExperience
        ? Number(savedExp.yearsOfExperience)
        : undefined,
    },
  });

  const onNext = async (values: ExperienceFormValues) => {
    dispatch(setExperience({
      level: values.level as ExperienceLevel,
      yearsOfExperience: values.yearsOfExperience !== undefined
        ? String(values.yearsOfExperience)
        : '',
    }));
    dispatch(nextStep());

    try {
      await saveProgress({
        current_step: 5,
        saved_data: {
          ...onboardingState,
          experience: {
            level: values.level,
            yearsOfExperience: values.yearsOfExperience !== undefined
              ? String(values.yearsOfExperience)
              : '',
          },
          currentStep: 5,
        },
      }).unwrap();
    } catch { /* best-effort */ }

    navigation.navigate('Review');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ProgressIndicator currentStep={5} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Your farming experience</Text>
        <Text style={styles.subtitle}>
          This helps us tailor advice to your skill level.
        </Text>

        {/* Experience level radio buttons */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Experience Level <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="level"
            render={({ field: { onChange, value } }) => (
              <View style={styles.levelOptions}>
                {LEVEL_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.levelOption,
                      value === opt.value && styles.levelOptionActive,
                    ]}
                    onPress={() => onChange(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: value === opt.value }}
                    accessibilityLabel={opt.label}
                  >
                    <View style={styles.levelLeft}>
                      <Text style={styles.levelIcon}>{opt.icon}</Text>
                      <View>
                        <Text
                          style={[
                            styles.levelLabel,
                            value === opt.value && styles.levelLabelActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text style={styles.levelDesc}>{opt.description}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        value === opt.value && styles.radioSelected,
                      ]}
                    >
                      {value === opt.value && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.level && (
            <Text style={styles.errorText}>{errors.level.message}</Text>
          )}
        </View>

        {/* Years of experience (optional) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Years of Experience{' '}
            <Text style={styles.optional}>(optional)</Text>
          </Text>
          <Controller
            control={control}
            name="yearsOfExperience"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.yearsOfExperience && styles.inputError]}
                placeholder="e.g. 10"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                returnKeyType="done"
                value={value !== undefined && value !== null ? String(value) : ''}
                onChangeText={(text) => onChange(text ? Number(text) : undefined)}
                onBlur={onBlur}
                accessibilityLabel="Years of experience"
              />
            )}
          />
          {errors.yearsOfExperience && (
            <Text style={styles.errorText}>{errors.yearsOfExperience.message}</Text>
          )}
        </View>
      </ScrollView>

      <StepNavigation
        onBack={() => navigation.goBack()}
        onNext={handleSubmit(onNext)}
        nextLabel="Review"
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 6, marginTop: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 20 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  required: { color: '#E53935' },
  optional: { fontSize: 12, color: '#999', fontWeight: '400' },
  levelOptions: { gap: 10 },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  levelOptionActive: {
    borderColor: '#2D7A3A',
    backgroundColor: '#F1F8F2',
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  levelIcon: { fontSize: 26 },
  levelLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  levelLabelActive: { color: '#2D7A3A' },
  levelDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#2D7A3A' },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2D7A3A',
  },
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
});
