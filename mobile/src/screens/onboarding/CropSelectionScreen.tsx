/**
 * CropSelectionScreen — Step 3 of 5.
 * Multi-select 1–5 crops from API catalogue, with custom crop support.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { setCrops, nextStep } from '../../store/onboardingSlice';
import { useSaveProgressMutation } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { StepNavigation } from '../../components/StepNavigation';
import { CropSelector } from '../../components/CropSelector';
import type { OnboardingStackParamList, CropItem } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CropSelection'>;

export function CropSelectionScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const selectedCrops = useAppSelector((s) => s.onboarding.farmDetails.crops);
  const onboardingState = useAppSelector((s) => s.onboarding);
  const [saveProgress, { isLoading }] = useSaveProgressMutation();

  const handleChange = (crops: CropItem[]) => {
    dispatch(setCrops(crops));
  };

  const onNext = async () => {
    if (selectedCrops.length === 0) {
      Alert.alert('Crops Required', 'Please select at least one crop before continuing.');
      return;
    }
    if (selectedCrops.length > 5) {
      Alert.alert('Too Many Crops', 'You can select at most 5 crops.');
      return;
    }

    dispatch(nextStep());

    try {
      await saveProgress({
        current_step: 4,
        saved_data: {
          ...onboardingState,
          farmDetails: { ...onboardingState.farmDetails, crops: selectedCrops },
          currentStep: 4,
        },
      }).unwrap();
    } catch { /* best-effort */ }

    navigation.navigate('Location');
  };

  return (
    <View style={styles.flex}>
      <ProgressIndicator currentStep={3} />

      <View style={styles.container}>
        <Text style={styles.title}>What do you grow?</Text>
        <Text style={styles.subtitle}>
          Select up to 5 crops. Can't find yours? Type the name to add it.
        </Text>

        <CropSelector
          selectedCrops={selectedCrops}
          onChange={handleChange}
          maxSelections={5}
        />
      </View>

      <StepNavigation
        onBack={() => navigation.goBack()}
        onNext={onNext}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 6, marginTop: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 20 },
});
