/**
 * WeatherForecastCard — displays a 7-day crop-aware weather forecast.
 * Fetches from GET /api/v1/weather which uses the user's GPS location
 * and their specific crops to generate personalised advisories.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGetWeatherQuery } from '../services/api';
import type { AdvisoryType, WeatherDay } from '../types';

const ADVISORY_COLORS: Record<AdvisoryType, string> = {
  warning: '#FFF3CD',
  info: '#D1ECF1',
  tip: '#D4EDDA',
};

const ADVISORY_BORDER: Record<AdvisoryType, string> = {
  warning: '#FFC107',
  info: '#17A2B8',
  tip: '#28A745',
};

const ADVISORY_ICON: Record<AdvisoryType, string> = {
  warning: '⚠️',
  info: 'ℹ️',
  tip: '💡',
};

/** Formats "2026-03-04" → "Wed 4 Mar" */
function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Single day column */
function DayColumn({ day, isToday, t }: { day: WeatherDay; isToday: boolean; t: (key: string) => string }) {
  return (
    <View style={[styles.dayCol, isToday && styles.dayColToday]}>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
        {isToday ? t('today') : formatDate(day.date).split(' ')[0]}
      </Text>
      <Text style={styles.dayIcon}>{day.icon}</Text>
      <Text style={[styles.tempMax, isToday && styles.tempMaxToday]}>{day.tempMax}°</Text>
      <Text style={styles.tempMin}>{day.tempMin}°</Text>
      {day.precipProbability > 20 ? (
        <Text style={styles.rain}>💧{day.precipProbability}%</Text>
      ) : (
        <View style={styles.rainPlaceholder} />
      )}
    </View>
  );
}

export function WeatherForecastCard(): React.JSX.Element {
  const { t } = useTranslation();
  const { data: weather, isLoading, isError, refetch } = useGetWeatherQuery();
  const [showAllAdvisories, setShowAllAdvisories] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('weekForecast')}</Text>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#2D7A3A" />
          <Text style={styles.loadingText}>{t('fetchingForecast')}</Text>
        </View>
      </View>
    );
  }

  if (isError || !weather) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('weekForecast')}</Text>
        <Text style={styles.errorText}>{t('couldNotLoadForecast')}</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const visibleAdvisories = showAllAdvisories ? weather.advisories : weather.advisories.slice(0, 2);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>{t('weekForecast')}</Text>
        <Text style={styles.timezone}>
          {weather.locationLabel ?? weather.timezone.replace('_', ' ')}
        </Text>
      </View>

      {/* Today hero */}
      {weather.days[0] && (
        <View style={styles.todayHero}>
          <Text style={styles.todayIcon}>{weather.days[0].icon}</Text>
          <View style={styles.todayInfo}>
            <Text style={styles.todayCondition}>{t(weather.days[0].conditionKey)}</Text>
            <Text style={styles.todayTemp}>
              {weather.days[0].tempMax}° <Text style={styles.todayTempMin}>/ {weather.days[0].tempMin}°C</Text>
            </Text>
            <Text style={styles.todayMeta}>
              💧 {weather.days[0].precipProbability}% rain  · 💨 {weather.days[0].windSpeed} km/h
            </Text>
          </View>
        </View>
      )}

      {/* 7-day strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayStrip}
        contentContainerStyle={styles.dayStripContent}
      >
        {weather.days.map((day, i) => (
          <DayColumn key={day.date} day={day} isToday={day.date === todayStr || i === 0} t={t} />
        ))}
      </ScrollView>

      {/* Crop advisories */}
      {weather.advisories.length > 0 && (
        <View style={styles.advisorySection}>
          <Text style={styles.advisoryHeading}>{t('cropAdvisories')}</Text>
          {visibleAdvisories.map((a, i) => (
            <View
              key={i}
              style={[
                styles.advisoryItem,
                { backgroundColor: ADVISORY_COLORS[a.type], borderLeftColor: ADVISORY_BORDER[a.type] },
              ]}
            >
              <Text style={styles.advisoryIcon}>{ADVISORY_ICON[a.type]}</Text>
              <Text style={styles.advisoryText}>{t(a.messageKey, a.params)}</Text>
            </View>
          ))}
          {weather.advisories.length > 2 && (
            <TouchableOpacity
              onPress={() => setShowAllAdvisories((v) => !v)}
              style={styles.showMoreBtn}
            >
              <Text style={styles.showMoreText}>
                {showAllAdvisories
                  ? t('showLess')
                  : t('showMore', { count: weather.advisories.length - 2 })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  timezone: { fontSize: 11, color: '#999' },

  // Today hero
  todayHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  todayIcon: { fontSize: 44 },
  todayInfo: { flex: 1 },
  todayCondition: { fontSize: 14, fontWeight: '600', color: '#333' },
  todayTemp: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginTop: 2 },
  todayTempMin: { fontSize: 18, fontWeight: '400', color: '#888' },
  todayMeta: { fontSize: 12, color: '#666', marginTop: 4 },

  // Day strip
  dayStrip: { marginBottom: 4 },
  dayStripContent: { gap: 6, paddingVertical: 4 },
  dayCol: {
    width: 60,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  dayColToday: { backgroundColor: '#E8F5E9' },
  dayLabel: { fontSize: 11, fontWeight: '600', color: '#888', marginBottom: 4 },
  dayLabelToday: { color: '#2D7A3A' },
  dayIcon: { fontSize: 20, marginBottom: 4 },
  tempMax: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  tempMaxToday: { color: '#2D7A3A' },
  tempMin: { fontSize: 12, color: '#999' },
  rain: { fontSize: 10, color: '#1565C0', marginTop: 2 },
  rainPlaceholder: { height: 14 },

  // Advisories
  advisorySection: { marginTop: 12 },
  advisoryHeading: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 8 },
  advisoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    gap: 8,
  },
  advisoryIcon: { fontSize: 14, marginTop: 1 },
  advisoryText: { flex: 1, fontSize: 12, color: '#333', lineHeight: 18 },
  showMoreBtn: { alignSelf: 'center', paddingVertical: 4 },
  showMoreText: { fontSize: 12, color: '#2D7A3A', fontWeight: '600' },

  // States
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  loadingText: { fontSize: 13, color: '#666' },
  errorText: { fontSize: 13, color: '#999', marginBottom: 8 },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#2D7A3A',
    borderRadius: 6,
  },
  retryText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
});
