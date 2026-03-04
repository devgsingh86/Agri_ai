/**
 * LocationScreen — Step 4 of 5.
 * Two modes: GPS (react-native-geolocation-service) or manual form entry.
 * Falls back gracefully to manual if GPS fails or permission denied.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { locationManualSchema, LocationManualFormValues } from '../../utils/validation';
import { setLocation, setGpsCoords, nextStep } from '../../store/onboardingSlice';
import { useSaveProgressMutation } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { StepNavigation } from '../../components/StepNavigation';
import type { OnboardingStackParamList, LocationType } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Location'>;

export function LocationScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const savedLocation = useAppSelector((s) => s.onboarding.location);
  const onboardingState = useAppSelector((s) => s.onboarding);
  const [saveProgress, { isLoading: isSaving }] = useSaveProgressMutation();

  const [activeTab, setActiveTab] = useState<LocationType>(savedLocation.locationType);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsCoords, setGpsCoordsLocal] = useState<
    { latitude: number; longitude: number } | null
  >(
    savedLocation.latitude !== undefined && savedLocation.longitude !== undefined
      ? { latitude: savedLocation.latitude, longitude: savedLocation.longitude }
      : null
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationManualFormValues>({
    resolver: yupResolver(locationManualSchema),
    defaultValues: {
      country: savedLocation.country,
      state: savedLocation.state,
      district: savedLocation.district,
      village: savedLocation.village,
      address: savedLocation.address,
    },
  });

  // ─── GPS Flow ──────────────────────────────────────────────────────────────

  const requestGps = () => {
    setIsLocating(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoordsLocal({ latitude, longitude });
        dispatch(setGpsCoords({ latitude, longitude }));
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to get your location.';
        if (error.code === 1) msg = 'Location permission denied. Please enter manually.';
        else if (error.code === 2) msg = 'Location unavailable. Please enter manually.';
        else if (error.code === 3) msg = 'Location request timed out. Please enter manually.';
        Alert.alert('GPS Error', msg, [
          {
            text: 'Enter Manually',
            onPress: () => setActiveTab('manual'),
          },
          { text: 'Try Again', onPress: requestGps },
        ]);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // ─── Next handlers ─────────────────────────────────────────────────────────

  const onNextGps = async () => {
    if (!gpsCoords) {
      Alert.alert('GPS Required', 'Please get your GPS location or switch to manual entry.');
      return;
    }
    dispatch(setLocation({ locationType: 'gps' }));
    dispatch(nextStep());
    await persistAndNavigate({ locationType: 'gps', ...gpsCoords });
  };

  const onNextManual = async (values: LocationManualFormValues) => {
    dispatch(setLocation({
      locationType: 'manual',
      country: values.country,
      state: values.state,
      district: values.district,
      village: values.village ?? '',
      address: values.address ?? '',
    }));
    dispatch(nextStep());
    await persistAndNavigate({
      locationType: 'manual',
      country: values.country,
      state: values.state,
      district: values.district,
      village: values.village,
      address: values.address,
    });
  };

  const persistAndNavigate = async (locationData: Record<string, unknown>) => {
    try {
      await saveProgress({
        current_step: 5,
        saved_data: {
          ...onboardingState,
          location: { ...onboardingState.location, ...locationData },
          currentStep: 5,
        },
      }).unwrap();
    } catch { /* best-effort */ }
    navigation.navigate('Experience');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ProgressIndicator currentStep={4} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Where is your farm?</Text>
        <Text style={styles.subtitle}>
          Location helps us provide accurate weather and crop advice.
        </Text>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          {(['gps', 'manual'] as LocationType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'gps' ? '📍 Use GPS' : '✏️ Enter Manually'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* GPS Panel */}
        {activeTab === 'gps' && (
          <View style={styles.gpsPanel}>
            <TouchableOpacity
              style={[styles.gpsButton, isLocating && styles.gpsButtonDisabled]}
              onPress={requestGps}
              disabled={isLocating}
              accessibilityRole="button"
              accessibilityLabel="Get GPS location"
            >
              {isLocating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.gpsButtonText}>
                  {gpsCoords ? '🔄 Refresh Location' : '📍 Get My Location'}
                </Text>
              )}
            </TouchableOpacity>

            {gpsCoords && (
              <View style={styles.coordsCard}>
                <Text style={styles.coordsTitle}>✅ Location Obtained</Text>
                <Text style={styles.coordsText}>
                  Lat: {gpsCoords.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordsText}>
                  Lon: {gpsCoords.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.switchLink}
              onPress={() => setActiveTab('manual')}
            >
              <Text style={styles.switchLinkText}>Prefer to enter manually?</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Manual Panel */}
        {activeTab === 'manual' && (
          <View>
            {/* Country */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Country <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="country"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.country && styles.inputError]}
                    placeholder="e.g. India"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.country && <Text style={styles.errorText}>{errors.country.message}</Text>}
            </View>

            {/* State */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                State / Province <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="state"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.state && styles.inputError]}
                    placeholder="e.g. Punjab"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.state && <Text style={styles.errorText}>{errors.state.message}</Text>}
            </View>

            {/* District */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                District <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="district"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.district && styles.inputError]}
                    placeholder="e.g. Ludhiana"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.district && <Text style={styles.errorText}>{errors.district.message}</Text>}
            </View>

            {/* Village (optional) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Village <Text style={styles.optional}>(optional)</Text>
              </Text>
              <Controller
                control={control}
                name="village"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Sahnewal"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>

            {/* Address (optional) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Address / Landmark <Text style={styles.optional}>(optional)</Text>
              </Text>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Additional address details"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <StepNavigation
        onBack={() => navigation.goBack()}
        onNext={activeTab === 'gps' ? onNextGps : handleSubmit(onNextManual)}
        isLoading={isSaving || isLocating}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 6, marginTop: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  tabActive: { borderColor: '#2D7A3A', backgroundColor: '#E8F5E9' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  tabTextActive: { color: '#2D7A3A', fontWeight: '700' },
  gpsPanel: { alignItems: 'center', paddingTop: 16, gap: 16 },
  gpsButton: {
    backgroundColor: '#2D7A3A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  gpsButtonDisabled: { backgroundColor: '#9AC99F' },
  gpsButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
  coordsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 14,
    width: '100%',
    gap: 4,
  },
  coordsTitle: { fontSize: 14, fontWeight: '700', color: '#2D7A3A', marginBottom: 4 },
  coordsText: { fontSize: 13, color: '#444' },
  switchLink: { paddingVertical: 8 },
  switchLinkText: { fontSize: 14, color: '#2D7A3A', textDecorationLine: 'underline' },
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
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  errorText: { fontSize: 12, color: '#E53935', marginTop: 4 },
});
