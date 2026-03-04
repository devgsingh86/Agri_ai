/**
 * ProfileScreen — shows the user's farm profile with an Edit button.
 * Edit mode opens a PATCH flow via the onboarding-style fields.
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
  RefreshControl,
} from 'react-native';
import { useGetProfileQuery } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export function ProfileScreen(): React.JSX.Element {
  const { data: profile, isLoading, isError, refetch, isFetching } = useGetProfileQuery();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    Alert.alert(t('signOutTitle'), t('signOutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('signOut'),
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2D7A3A" />
        <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>{t('couldNotLoadProfileError')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const Section = ({ title, icon }: { title: string; icon: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const Row = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          onRefresh={refetch}
          tintColor="#2D7A3A"
        />
      }
    >
      {/* Avatar / name header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {profile.first_name?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.profileName}>
          {profile.first_name} {profile.last_name}
        </Text>
        {profile.phone_number ? (
          <Text style={styles.profilePhone}>{profile.phone_number}</Text>
        ) : null}
        <View style={styles.completenessBadge}>
          <Text style={styles.completenessText}>
            {t('profileCompletePercent', { percent: profile.completeness })}
          </Text>
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.card}>
        <Section title={t('personalInfo')} icon="👤" />
        <Row label={t('firstName')} value={profile.first_name} />
        <Row label={t('lastName')} value={profile.last_name} />
        <Row label={t('phone')} value={profile.phone_number} />
      </View>

      {/* Farm Details */}
      <View style={styles.card}>
        <Section title={t('farmDetails')} icon="🌾" />
        <Row
          label={t('farmSize')}
          value={`${parseFloat(String(profile.farm_size))} ${profile.farm_size_unit} (${profile.farm_size_hectares ? parseFloat(String(profile.farm_size_hectares)).toFixed(2) : '?'} ha)`}
        />
        <Row
          label={t('crops')}
          value={
            profile.crops?.length
              ? profile.crops.map((c) => c.crop_name).join(', ')
              : null
          }
        />
      </View>

      {/* Experience */}
      <View style={styles.card}>
        <Section title={t('experience')} icon="🏅" />
        <Row
          label={t('level')}
          value={
            profile.experience_level
              ? profile.experience_level.charAt(0).toUpperCase() +
                profile.experience_level.slice(1)
              : null
          }
        />
        <Row
          label={t('years', { count: profile.years_of_experience ?? 0 })}
          value={
            profile.years_of_experience !== null &&
            profile.years_of_experience !== undefined
              ? `${profile.years_of_experience}`
              : null
          }
        />
      </View>

      {/* Location */}
      <View style={styles.card}>
        <Section title={t('location')} icon="📍" />
        <Row label={t('locationType')} value={profile.location_type === 'gps' ? t('gps') : t('manual')} />
        {profile.location_type === 'gps' && profile.latitude ? (
          <Row
            label={t('coordinates')}
            value={`${parseFloat(String(profile.latitude)).toFixed(5)}, ${profile.longitude ? parseFloat(String(profile.longitude)).toFixed(5) : ''}`}
          />
        ) : null}
        <Row label={t('country')} value={profile.country} />
        <Row label={t('state')} value={profile.state} />
        <Row label={t('district')} value={profile.district} />
        {profile.village ? <Row label={t('village')} value={profile.village} /> : null}
        {profile.address ? <Row label={t('address')} value={profile.address} /> : null}
      </View>

      {/* Timestamps */}
      <View style={styles.card}>
        <Section title={t('accountInfo')} icon="ℹ️" />
        <Row
          label={t('profileCreated')}
          value={new Date(profile.created_at).toLocaleDateString()}
        />
        <Row
          label={t('lastUpdated')}
          value={new Date(profile.updated_at).toLocaleDateString()}
        />
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <Text style={styles.logoutText}>{t('signOut')}</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F7F5' },
  container: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F5F7F5',
  },
  loadingText: { fontSize: 14, color: '#666' },
  errorEmoji: { fontSize: 40 },
  errorTitle: { fontSize: 16, color: '#666' },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#2D7A3A',
    borderRadius: 8,
  },
  retryText: { color: '#FFF', fontWeight: '600' },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2D7A3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarInitial: { fontSize: 32, color: '#FFFFFF', fontWeight: '700' },
  profileName: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  profilePhone: { fontSize: 14, color: '#666', marginTop: 2 },
  completenessBadge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
  },
  completenessText: { fontSize: 13, color: '#2D7A3A', fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
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
  logoutButton: {
    borderWidth: 1.5,
    borderColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  logoutText: { fontSize: 15, color: '#E53935', fontWeight: '600' },
});
