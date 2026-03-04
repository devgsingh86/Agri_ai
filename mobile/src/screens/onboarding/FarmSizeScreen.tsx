/**
 * FarmSizeScreen — Step 2 of 5.
 * Farm size (number) + unit selector (hectares / acres).
 * Shows real-time conversion when acres is selected.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { farmSizeSchema, FarmSizeFormValues } from '../../utils/validation';
import { setFarmSize, nextStep } from '../../store/onboardingSlice';
import { useSaveProgressMutation } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { StepNavigation } from '../../components/StepNavigation';
import type { OnboardingStackParamList, FarmSizeUnit } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'FarmSize'>;

const ACRES_TO_HECTARES = 0.404686;

export function FarmSizeScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const savedDetails = useAppSelector((s) => s.onboarding.farmDetails);
  const onboardingState = useAppSelector((s) => s.onboarding);
  const [saveProgress, { isLoading }] = useSaveProgressMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmSizeFormValues>({
    resolver: yupResolver(farmSizeSchema),
    defaultValues: {
      farmSize: savedDetails.farmSize ? Number(savedDetails.farmSize) : ('' as unknown as number),
      farmSizeUnit: savedDetails.farmSizeUnit ?? 'hectares',
    },
  });

  // Watch for live conversion display
  const watchedSize = useWatch({ control, name: 'farmSize' });
  const watchedUnit = useWatch({ control, name: 'farmSizeUnit' });

  const [conversionText, setConversionText] = useState('');

  useEffect(() => {
    const num = Number(watchedSize);
    if (!isNaN(num) && num > 0 && watchedUnit === 'acres') {
      const hectares = (num * ACRES_TO_HECTARES).toFixed(2);
      setConversionText(`= ${hectares} hectares`);
    } else {
      setConversionText('');
    }
  }, [watchedSize, watchedUnit]);

  const onNext = async (values: FarmSizeFormValues) => {
    dispatch(setFarmSize({
      farmSize: String(values.farmSize),
      farmSizeUnit: values.farmSizeUnit as FarmSizeUnit,
    }));
    dispatch(nextStep());

    try {
      await saveProgress({
        current_step: 3,
        saved_data: {
          ...onboardingState,
          farmDetails: {
            ...onboardingState.farmDetails,
            farmSize: String(values.farmSize),
            farmSizeUnit: values.farmSizeUnit,
          },
          currentStep: 3,
        },
      }).unwrap();
    } catch { /* best-effort */ }

    navigation.navigate('CropSelection');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ProgressIndicator currentStep={2} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>How big is your farm?</Text>
        <Text style={styles.subtitle}>
          Enter your total cultivable land area.
        </Text>

        {/* Farm size input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Farm Size <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="farmSize"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.farmSize && styles.inputError]}
                placeholder="e.g. 5.5"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                returnKeyType="done"
                value={value !== undefined && value !== null ? String(value) : ''}
                onChangeText={(text) => onChange(text ? Number(text) : text)}
                onBlur={onBlur}
                accessibilityLabel="Farm size"
              />
            )}
          />
          {errors.farmSize && (
            <Text style={styles.errorText}>{errors.farmSize.message}</Text>
          )}
          {conversionText ? (
            <Text style={styles.conversionText}>📐 {conversionText}</Text>
          ) : null}
        </View>

        {/* Unit selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Unit</Text>
          <Controller
            control={control}
            name="farmSizeUnit"
            render={({ field: { onChange, value } }) => (
              <View style={styles.unitRow}>
                {(['hectares', 'acres'] as FarmSizeUnit[]).map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      value === unit && styles.unitButtonActive,
                    ]}
                    onPress={() => onChange(unit)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: value === unit }}
                    accessibilityLabel={unit}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        value === unit && styles.unitTextActive,
                      ]}
                    >
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.farmSizeUnit && (
            <Text style={styles.errorText}>{errors.farmSizeUnit.message}</Text>
          )}
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 1 hectare = 2.47 acres · Valid range: 0.01 – 100,000
          </Text>
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
  container: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 6, marginTop: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 20 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  required: { color: '#E53935' },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 20,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
    fontWeight: '600',
  },
  inputError: { borderColor: '#E53935' },
  errorText: { fontSize: 12, color: '#E53935', marginTop: 4 },
  conversionText: {
    fontSize: 14,
    color: '#2D7A3A',
    marginTop: 6,
    fontWeight: '500',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  unitButtonActive: {
    borderColor: '#2D7A3A',
    backgroundColor: '#E8F5E9',
  },
  unitText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  unitTextActive: {
    color: '#2D7A3A',
  },
  infoCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  infoText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
  },
});
