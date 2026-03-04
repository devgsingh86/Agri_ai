/**
 * DashboardScreen — Main app home tab.
 * Shows welcome message and profile completeness bar.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGetProfileQuery } from '../../services/api';
import { WeatherForecastCard } from '../../components/WeatherForecastCard';
import { LanguageSelector } from '../../components/LanguageSelector';

export function DashboardScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { data: profile, isLoading, isError, refetch, isFetching } = useGetProfileQuery();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2D7A3A" />
        <Text style={styles.loadingText}>{t('loadingDashboard')}</Text>
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>{t('couldNotLoadProfile')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completeness = profile.completeness ?? 0;
  const firstName = profile.first_name;
  const cropNames = profile.crops?.map((c) => c.crop_name).join(', ') ?? '—';
  const farmSizeDisplay = `${profile.farm_size} ${profile.farm_size_unit}`;

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
      {/* Greeting row with language selector */}
      <View style={styles.greeting}>
        <Text style={styles.greetingEmoji}>🌾</Text>
        <View style={styles.greetingText}>
          <Text style={styles.greetingTitle}>{t('welcomeBack')}</Text>
          <Text style={styles.greetingName}>{firstName}!</Text>
        </View>
        <LanguageSelector />
      </View>

      {/* Completeness card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{t('profileCompleteness')}</Text>
          <Text style={styles.completenessPercent}>{completeness}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${completeness}%` }]}
          />
        </View>
        {completeness < 100 && (
          <Text style={styles.completenessHint}>{t('completeProfileHint')}</Text>
        )}
      </View>

      {/* Farm summary cards */}
      <Text style={styles.sectionLabel}>{t('farmAtGlance')}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📐</Text>
          <Text style={styles.statValue}>{farmSizeDisplay}</Text>
          <Text style={styles.statLabel}>{t('farmSize')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🌱</Text>
          <Text style={styles.statValue}>{profile.crops?.length ?? 0}</Text>
          <Text style={styles.statLabel}>{t('crops')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏅</Text>
          <Text style={styles.statValue}>
            {profile.experience_level
              ? profile.experience_level.charAt(0).toUpperCase() +
                profile.experience_level.slice(1)
              : '—'}
          </Text>
          <Text style={styles.statLabel}>{t('level')}</Text>
        </View>
      </View>

      {/* Crops detail */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('cropsBeingGrown')}</Text>
        <Text style={styles.cropsList}>{cropNames}</Text>
      </View>

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('farmLocation')}</Text>
        <Text style={styles.locationText}>
          {[profile.village, profile.district, profile.state, profile.country]
            .filter(Boolean)
            .join(', ')}
        </Text>
        {profile.location_type === 'gps' && profile.latitude && (
          <Text style={styles.gpsTag}>
            GPS: {parseFloat(String(profile.latitude)).toFixed(4)}, {profile.longitude ? parseFloat(String(profile.longitude)).toFixed(4) : ''}
          </Text>
        )}
      </View>

      {/* Weather Forecast */}
      <WeatherForecastCard />

      {/* Spacer */}
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
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  greetingEmoji: { fontSize: 44 },
  greetingText: { flex: 1 },
  greetingTitle: { fontSize: 14, color: '#888' },
  greetingName: { fontSize: 26, fontWeight: '700', color: '#1A1A1A' },
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  completenessPercent: { fontSize: 18, fontWeight: '700', color: '#2D7A3A' },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  completenessHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  statLabel: { fontSize: 11, color: '#888' },
  cropsList: { fontSize: 14, color: '#444', lineHeight: 20 },
  locationText: { fontSize: 14, color: '#444', lineHeight: 20 },
  gpsTag: { fontSize: 12, color: '#888', marginTop: 4 },
});
