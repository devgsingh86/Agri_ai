/**
 * ReviewScreen — Final onboarding step.
 * Summarises all collected data with section-level Edit buttons.
 * "Submit Profile" → POST /api/v1/profile → navigate to Dashboard.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCreateProfileMutation } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { resetOnboarding } from '../../store/onboardingSlice';
import type { OnboardingStackParamList, FarmProfileRequest, ExperienceLevel } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Review'>;

export function ReviewScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { personalInfo, farmDetails, location, experience } = useAppSelector(
    (s) => s.onboarding
  );
  const [createProfile, { isLoading }] = useCreateProfileMutation();

  const onSubmit = async () => {
    // Validate completeness before submission
    if (!personalInfo.firstName || !personalInfo.lastName) {
      Alert.alert('Incomplete', 'Please complete your personal info (Step 1).');
      navigation.navigate('PersonalInfo');
      return;
    }
    if (!farmDetails.farmSize || farmDetails.crops.length === 0) {
      Alert.alert('Incomplete', 'Please complete farm details (Steps 2–3).');
      navigation.navigate('FarmSize');
      return;
    }
    if (!experience.level) {
      Alert.alert('Incomplete', 'Please set your experience level (Step 5).');
      navigation.navigate('Experience');
      return;
    }

    const payload: FarmProfileRequest = {
      first_name: personalInfo.firstName,
      last_name: personalInfo.lastName,
      phone_number: personalInfo.phoneNumber || null,
      farm_size: Number(farmDetails.farmSize),
      farm_size_unit: farmDetails.farmSizeUnit,
      location_type: location.locationType,
      latitude: location.locationType === 'gps' ? location.latitude : null,
      longitude: location.locationType === 'gps' ? location.longitude : null,
      country: location.country,
      state: location.state,
      district: location.district || null,
      village: location.village || null,
      address: location.address || null,
      experience_level: experience.level as ExperienceLevel,
      years_of_experience: experience.yearsOfExperience
        ? Number(experience.yearsOfExperience)
        : null,
      crops: farmDetails.crops,
    };

    try {
      await createProfile(payload).unwrap();
      dispatch(resetOnboarding());
      // RTK Query's invalidatesTags: ['Profile'] on createProfile causes the
      // InnerNavigator to refetch getProfile and automatically switch to AppStack.
      // No explicit navigation.dispatch needed — RootNavigator handles it reactively.
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'data' in err
          ? (err as { data: { message: string } }).data?.message ?? 'Submission failed.'
          : 'Submission failed. Please try again.';
      Alert.alert('Error', message);
    }
  };

  // ─── Section helpers ───────────────────────────────────────────────────────

  const SectionHeader = ({
    title,
    onEdit,
    icon,
  }: {
    title: string;
    onEdit: () => void;
    icon: string;
  }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onEdit} accessibilityRole="button" accessibilityLabel={`Edit ${title}`}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Review Your Profile</Text>
        <Text style={styles.subtitle}>
          Please confirm all details before submitting.
        </Text>

        {/* Personal Info */}
        <View style={styles.section}>
          <SectionHeader
            title="Personal Information"
            icon="👤"
            onEdit={() => navigation.navigate('PersonalInfo')}
          />
          <Row label="First Name" value={personalInfo.firstName} />
          <Row label="Last Name" value={personalInfo.lastName} />
          <Row
            label="Phone"
            value={personalInfo.phoneNumber || 'Not provided'}
          />
        </View>

        {/* Farm Details */}
        <View style={styles.section}>
          <SectionHeader
            title="Farm Details"
            icon="🌾"
            onEdit={() => navigation.navigate('FarmSize')}
          />
          <Row
            label="Farm Size"
            value={
              farmDetails.farmSize
                ? `${farmDetails.farmSize} ${farmDetails.farmSizeUnit}`
                : 'Not set'
            }
          />
          <Row
            label="Crops"
            value={
              farmDetails.crops.length > 0
                ? farmDetails.crops
                    .map((c) => c.crop_name + (c.is_custom ? ' ✦' : ''))
                    .join(', ')
                : 'None selected'
            }
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <SectionHeader
            title="Location"
            icon="📍"
            onEdit={() => navigation.navigate('Location')}
          />
          {location.locationType === 'gps' ? (
            <>
              <Row label="Method" value="GPS" />
              <Row
                label="Coordinates"
                value={
                  location.latitude !== undefined
                    ? `${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}`
                    : 'Not captured'
                }
              />
            </>
          ) : (
            <>
              <Row label="Method" value="Manual" />
              <Row label="Country" value={location.country} />
              <Row label="State" value={location.state} />
              <Row label="District" value={location.district} />
              {location.village ? <Row label="Village" value={location.village} /> : null}
              {location.address ? <Row label="Address" value={location.address} /> : null}
            </>
          )}
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <SectionHeader
            title="Experience"
            icon="🏅"
            onEdit={() => navigation.navigate('Experience')}
          />
          <Row
            label="Level"
            value={
              experience.level
                ? experience.level.charAt(0).toUpperCase() + experience.level.slice(1)
                : 'Not set'
            }
          />
          {experience.yearsOfExperience ? (
            <Row label="Years" value={`${experience.yearsOfExperience} years`} />
          ) : null}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitDisabled]}
          onPress={onSubmit}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Submit profile"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>✓ Submit Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8F8F8' },
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  editText: { fontSize: 13, color: '#2D7A3A', fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 13, color: '#888', flex: 1 },
  rowValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#2D7A3A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: { backgroundColor: '#9AC99F' },
  submitText: { fontSize: 17, color: '#FFFFFF', fontWeight: '700' },
});
