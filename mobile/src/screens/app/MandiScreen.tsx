/**
 * MandiScreen — Mandi Price Analytics
 *
 * Tabs:
 *   1. Latest Prices  — price cards for farmer's crops with ▲▼ trend
 *   2. 90-Day Trend   — custom bar-chart without native dependencies
 *   3. Comparison     — sortable multi-Mandi table
 *   4. Alerts         — price alert creation and management
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useGetMandiPricesQuery,
  useGetMandiHistoryQuery,
  useGetMandiComparisonQuery,
  useGetMandiAlertsQuery,
  useCreateMandiAlertMutation,
  useDeleteMandiAlertMutation,
} from '../../services/api';
import type { MandiPrice, PriceHistoryPoint, MandiAlert } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['latestPrices', 'priceHistory', 'comparison', 'priceAlerts'] as const;
type TabKey = typeof TABS[number];

const COMMON_CROPS = [
  'crop_wheat', 'crop_rice', 'crop_potato', 'crop_onion', 'crop_tomato',
  'crop_maize', 'crop_soybean', 'crop_mustard', 'crop_chickpea', 'crop_tur_dal',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.round(amount)}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch { return dateStr; }
}

/** Returns ▲ / ▼ / — and color based on price trend vs 7-day avg */
function trendInfo(history: PriceHistoryPoint[]): { arrow: string; color: string; pct: number } {
  if (history.length < 8) return { arrow: '—', color: '#888', pct: 0 };
  const recent = history.slice(-1)[0].modalPrice;
  const week   = history.slice(-8, -1).reduce((s, p) => s + p.modalPrice, 0) / 7;
  const pct    = Math.round(((recent - week) / week) * 100);
  if (pct > 1)  return { arrow: '▲', color: '#2D7A3A', pct };
  if (pct < -1) return { arrow: '▼', color: '#C62828', pct };
  return { arrow: '—', color: '#888', pct };
}

/** Compute "best time to sell" label */
function bestTimeLabel(history: PriceHistoryPoint[], t: (k: string) => string): { text: string; color: string } {
  if (history.length < 10) return { text: t('bestTimeNeutral'), color: '#888' };
  const avg   = history.reduce((s, p) => s + p.modalPrice, 0) / history.length;
  const recent = history.slice(-3).reduce((s, p) => s + p.modalPrice, 0) / 3;
  const pct    = ((recent - avg) / avg) * 100;
  if (pct > 5)  return { text: t('bestTimeHigh'), color: '#2D7A3A' };
  if (pct < -5) return { text: t('bestTimeLow'),  color: '#C62828' };
  return { text: t('bestTimeNeutral'), color: '#E65100' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single price card for the Latest Prices tab */
function PriceCard({ price, onPress }: { price: MandiPrice; onPress: () => void }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardCrop}>{t(price.cropKey)}</Text>
        <Text style={styles.cardMarket}>📍 {price.market}</Text>
      </View>
      <View style={styles.cardPrices}>
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>{t('minPrice')}</Text>
          <Text style={styles.priceVal}>₹{Math.round(price.minPrice)}</Text>
        </View>
        <View style={styles.priceColCenter}>
          <Text style={styles.modalPriceLabel}>{t('modalPrice')}</Text>
          <Text style={styles.modalPriceVal}>₹{Math.round(price.modalPrice)}</Text>
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>{t('maxPrice')}</Text>
          <Text style={styles.priceVal}>₹{Math.round(price.maxPrice)}</Text>
        </View>
      </View>
      <Text style={styles.cardDate}>{t('perQuintal')} · {formatDate(price.priceDate)}</Text>
    </TouchableOpacity>
  );
}

/** Minimal bar-chart rendered with Views — no native libs required */
function PriceChart({ history }: { history: PriceHistoryPoint[] }): React.JSX.Element {
  const { t } = useTranslation();

  // Sample to max 30 points for display
  const points = useMemo(() => {
    if (history.length <= 30) return history;
    const step = Math.ceil(history.length / 30);
    return history.filter((_, i) => i % step === 0);
  }, [history]);

  if (points.length === 0) {
    return <Text style={styles.noData}>{t('noHistory')}</Text>;
  }

  const maxPrice = Math.max(...points.map((p) => p.maxPrice));
  const minPrice = Math.min(...points.map((p) => p.minPrice));
  const range    = maxPrice - minPrice || 1;
  const CHART_H  = 140;

  const best = bestTimeLabel(history, t);

  return (
    <View>
      {/* Best-time indicator */}
      <View style={[styles.bestTimeBox, { borderColor: best.color }]}>
        <Text style={styles.bestTimeLabel}>{t('bestTimeTo')}</Text>
        <Text style={[styles.bestTimeText, { color: best.color }]}>{best.text}</Text>
      </View>

      {/* Chart area */}
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>{formatINR(maxPrice)}</Text>
          <Text style={styles.yLabel}>{formatINR((maxPrice + minPrice) / 2)}</Text>
          <Text style={styles.yLabel}>{formatINR(minPrice)}</Text>
        </View>

        {/* Bars */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={[styles.barsRow, { height: CHART_H }]}>
            {points.map((p, i) => {
              const barH = Math.max(4, ((p.modalPrice - minPrice) / range) * CHART_H);
              return (
                <View key={i} style={styles.barWrapper}>
                  <View style={[styles.bar, { height: barH }]} />
                  {i % 5 === 0 && (
                    <Text style={styles.barLabel}>{formatDate(p.date)}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBox label={t('minPrice')} value={formatINR(minPrice)} color="#C62828" />
        <StatBox label={t('maxPrice')} value={formatINR(maxPrice)} color="#2D7A3A" />
        <StatBox label={t('modalPrice')} value={formatINR(points[points.length - 1]?.modalPrice ?? 0)} color="#1565C0" />
      </View>
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }): React.JSX.Element {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** Multi-Mandi comparison table row */
function MandiRow({ price, rank, isHighest, isLowest }: {
  price: MandiPrice; rank: number; isHighest: boolean; isLowest: boolean;
}): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={[styles.mandiRow, rank % 2 === 0 && styles.mandiRowAlt]}>
      <Text style={styles.mandiRank}>{rank + 1}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.mandiMarket}>{price.market}</Text>
        <Text style={styles.mandiDistrict}>{price.district}</Text>
      </View>
      <View style={styles.mandiPriceCol}>
        <Text style={[styles.mandiModal, isHighest && styles.priceHigh, isLowest && styles.priceLow]}>
          ₹{Math.round(price.modalPrice)}
        </Text>
        {isHighest && <Text style={styles.badgeHigh}>{t('highestPrice')}</Text>}
        {isLowest  && <Text style={styles.badgeLow}>{t('lowestPrice')}</Text>}
      </View>
    </View>
  );
}

/** Alert row */
function AlertRow({ alert, onDelete }: { alert: MandiAlert; onDelete: () => void }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.alertRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.alertCrop}>{t(alert.cropKey)}</Text>
        <Text style={styles.alertDetail}>
          {alert.direction === 'above' ? '▲' : '▼'} ₹{Math.round(alert.targetPrice)}{t('perQuintal')}
        </Text>
      </View>
      <View style={styles.alertRight}>
        <Text style={[styles.alertStatus, alert.isActive ? styles.alertActive : styles.alertTriggered]}>
          {alert.isActive ? t('alertActive') : t('alertTriggered')}
        </Text>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>{t('deleteAlert')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** Add alert modal */
function AddAlertModal({
  cropKeys,
  onClose,
}: {
  cropKeys: string[];
  onClose: () => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const [createAlert, { isLoading }] = useCreateMandiAlertMutation();
  const [cropKey, setCropKey]   = useState(cropKeys[0] ?? 'crop_wheat');
  const [price, setPrice]       = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');

  const submit = async () => {
    if (!price || isNaN(Number(price))) return;
    await createAlert({ cropKey, targetPrice: Number(price), direction });
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{t('addAlert')}</Text>

          {/* Crop selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropChips}>
            {cropKeys.map((ck) => (
              <TouchableOpacity
                key={ck}
                style={[styles.chip, cropKey === ck && styles.chipActive]}
                onPress={() => setCropKey(ck)}
              >
                <Text style={[styles.chipText, cropKey === ck && styles.chipTextActive]}>{t(ck)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Direction */}
          <Text style={styles.inputLabel}>{t('alertDirection')}</Text>
          <View style={styles.directionRow}>
            {(['above', 'below'] as const).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.dirBtn, direction === d && styles.dirBtnActive]}
                onPress={() => setDirection(d)}
              >
                <Text style={[styles.dirBtnText, direction === d && styles.dirBtnTextActive]}>
                  {d === 'above' ? '▲ ' : '▼ '}{t(d)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price input */}
          <Text style={styles.inputLabel}>{t('alertTargetPrice')}</Text>
          <TextInput
            style={styles.priceInput}
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 2500"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={submit} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={styles.saveBtnText}>✓ {t('addAlert')}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function MandiScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('latestPrices');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [showAddAlert, setShowAddAlert] = useState(false);

  // Fetch latest prices (always loaded)
  const { data: pricesData, isLoading: pricesLoading, isError: pricesError, refetch: refetchPrices } =
    useGetMandiPricesQuery({});

  // Fetch history only when crop is selected
  const { data: historyData, isLoading: historyLoading } =
    useGetMandiHistoryQuery(selectedCrop ?? '', { skip: !selectedCrop });

  // Fetch comparison for selected crop
  const { data: compData, isLoading: compLoading } =
    useGetMandiComparisonQuery(selectedCrop ?? '', { skip: !selectedCrop || activeTab !== 'comparison' });

  // Alerts
  const { data: alerts = [], isLoading: alertsLoading } = useGetMandiAlertsQuery();
  const [deleteAlert] = useDeleteMandiAlertMutation();

  const cropKeys = useMemo(() => {
    if (pricesData?.cropKeys?.length) return pricesData.cropKeys;
    return COMMON_CROPS.slice(0, 5);
  }, [pricesData]);

  // Group latest prices by cropKey (take most recent per crop)
  const latestByCrop = useMemo(() => {
    if (!pricesData?.prices) return [];
    const seen = new Set<string>();
    const result: MandiPrice[] = [];
    for (const p of pricesData.prices) {
      if (!seen.has(p.cropKey)) {
        seen.add(p.cropKey);
        result.push(p);
      }
    }
    return result;
  }, [pricesData]);

  // Handle crop selection — auto-show history
  const selectCrop = useCallback((ck: string) => {
    setSelectedCrop(ck);
    setActiveTab('priceHistory');
  }, []);

  const renderContent = () => {
    if (pricesLoading) {
      return (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color="#2D7A3A" />
          <Text style={styles.loadingText}>{t('loadingPrices')}</Text>
        </View>
      );
    }

    if (pricesError) {
      return (
        <View style={styles.centred}>
          <Text style={styles.errorText}>{t('couldNotLoadMandi')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetchPrices}>
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeTab) {
      case 'latestPrices':
        return (
          <ScrollView contentContainerStyle={styles.listContent}>
            {pricesData && (
              <Text style={styles.metaText}>📍 {pricesData.state}</Text>
            )}
            {latestByCrop.map((price) => (
              <PriceCard key={price.cropKey} price={price} onPress={() => selectCrop(price.cropKey)} />
            ))}
          </ScrollView>
        );

      case 'priceHistory':
        return (
          <ScrollView contentContainerStyle={styles.listContent}>
            {/* Crop selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropChipsBar}>
              {cropKeys.map((ck) => (
                <TouchableOpacity
                  key={ck}
                  style={[styles.cropChip, selectedCrop === ck && styles.cropChipActive]}
                  onPress={() => setSelectedCrop(ck)}
                >
                  <Text style={[styles.cropChipText, selectedCrop === ck && styles.cropChipTextActive]}>
                    {t(ck)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {!selectedCrop ? (
              <Text style={styles.hintText}>{t('selectCropForChart')}</Text>
            ) : historyLoading ? (
              <View style={styles.centred}>
                <ActivityIndicator color="#2D7A3A" />
              </View>
            ) : historyData ? (
              <PriceChart history={historyData.history} />
            ) : null}
          </ScrollView>
        );

      case 'comparison': {
        return (
          <ScrollView contentContainerStyle={styles.listContent}>
            {/* Crop selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropChipsBar}>
              {cropKeys.map((ck) => (
                <TouchableOpacity
                  key={ck}
                  style={[styles.cropChip, selectedCrop === ck && styles.cropChipActive]}
                  onPress={() => setSelectedCrop(ck)}
                >
                  <Text style={[styles.cropChipText, selectedCrop === ck && styles.cropChipTextActive]}>
                    {t(ck)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {!selectedCrop ? (
              <Text style={styles.hintText}>{t('selectCropForChart')}</Text>
            ) : compLoading ? (
              <View style={styles.centred}><ActivityIndicator color="#2D7A3A" /></View>
            ) : compData?.mandis?.length ? (
              <>
                <View style={styles.tableHeader}>
                  <Text style={styles.thRank}>#</Text>
                  <Text style={[styles.thCell, { flex: 1 }]}>{t('market')}</Text>
                  <Text style={styles.thPrice}>{t('modalPrice')}</Text>
                </View>
                {compData.mandis.map((price, i) => (
                  <MandiRow
                    key={price.id ?? i}
                    price={price}
                    rank={i}
                    isHighest={i === 0}
                    isLowest={i === compData.mandis.length - 1}
                  />
                ))}
              </>
            ) : (
              <Text style={styles.noData}>{t('noMatchingCrops')}</Text>
            )}
          </ScrollView>
        );
      }

      case 'priceAlerts':
        return (
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.addAlertBtn} onPress={() => setShowAddAlert(true)}>
              <Text style={styles.addAlertText}>+ {t('addAlert')}</Text>
            </TouchableOpacity>
            {alertsLoading ? (
              <ActivityIndicator color="#2D7A3A" style={{ marginTop: 20 }} />
            ) : alerts.length === 0 ? (
              <Text style={styles.noData}>{t('noAlerts')}</Text>
            ) : (
              <FlatList
                data={alerts}
                keyExtractor={(a) => a.id}
                renderItem={({ item }) => (
                  <AlertRow
                    alert={item}
                    onDelete={() => deleteAlert(item.id)}
                  />
                )}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {t(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {showAddAlert && (
        <AddAlertModal
          cropKeys={cropKeys}
          onClose={() => setShowAddAlert(false)}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  // Tab bar
  tabBar:     { maxHeight: 48, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  tab:        { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:  { borderBottomColor: '#2D7A3A' },
  tabText:    { fontSize: 13, color: '#666', fontWeight: '500' },
  tabTextActive: { color: '#2D7A3A', fontWeight: '700' },

  // Layout
  centred:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 12 },
  listContent:  { padding: 16, gap: 12 },
  loadingText:  { color: '#666', fontSize: 14 },
  errorText:    { color: '#C62828', fontSize: 15, textAlign: 'center' },
  retryBtn:     { backgroundColor: '#2D7A3A', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText:    { color: '#FFF', fontWeight: '700' },
  metaText:     { fontSize: 13, color: '#888', marginBottom: 4 },
  noData:       { textAlign: 'center', color: '#888', marginTop: 32, fontSize: 14 },
  hintText:     { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },

  // Price card
  card:         { backgroundColor: '#FFF', borderRadius: 12, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardCrop:     { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  cardMarket:   { fontSize: 12, color: '#888' },
  cardPrices:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceCol:     { alignItems: 'center', flex: 1 },
  priceColCenter: { alignItems: 'center', flex: 1, backgroundColor: '#F0FAF2', borderRadius: 8, paddingVertical: 6 },
  priceLabel:   { fontSize: 11, color: '#888', marginBottom: 2 },
  priceVal:     { fontSize: 14, fontWeight: '600', color: '#333' },
  modalPriceLabel: { fontSize: 11, color: '#2D7A3A', fontWeight: '600', marginBottom: 2 },
  modalPriceVal:   { fontSize: 20, fontWeight: '800', color: '#2D7A3A' },
  cardDate:     { marginTop: 8, fontSize: 11, color: '#AAA', textAlign: 'right' },

  // Chart
  bestTimeBox:  { borderWidth: 1.5, borderRadius: 10, padding: 12, marginBottom: 12 },
  bestTimeLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginBottom: 2 },
  bestTimeText: { fontSize: 13, fontWeight: '700' },
  chartContainer: { flexDirection: 'row', height: 160, marginBottom: 8 },
  yAxis:        { width: 52, justifyContent: 'space-between', paddingVertical: 4, alignItems: 'flex-end', paddingRight: 6 },
  yLabel:       { fontSize: 10, color: '#888' },
  barsRow:      { flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 20 },
  barWrapper:   { alignItems: 'center', marginHorizontal: 2, width: 12 },
  bar:          { width: 8, backgroundColor: '#2D7A3A', borderRadius: 2 },
  barLabel:     { position: 'absolute', bottom: -18, fontSize: 8, color: '#888', width: 40, textAlign: 'center' },
  statsRow:     { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  statBox:      { alignItems: 'center' },
  statVal:      { fontSize: 16, fontWeight: '800' },
  statLabel:    { fontSize: 11, color: '#888' },

  // Crop chips
  cropChipsBar: { marginBottom: 12 },
  cropChip:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#CCC', marginRight: 8, backgroundColor: '#FFF' },
  cropChipActive: { backgroundColor: '#2D7A3A', borderColor: '#2D7A3A' },
  cropChipText: { fontSize: 12, color: '#555', fontWeight: '500' },
  cropChipTextActive: { color: '#FFF' },

  // Comparison table
  tableHeader:  { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 4 },
  thRank:       { width: 30, fontSize: 12, fontWeight: '700', color: '#888', textAlign: 'center' },
  thCell:       { fontSize: 12, fontWeight: '700', color: '#888' },
  thPrice:      { width: 80, fontSize: 12, fontWeight: '700', color: '#888', textAlign: 'right' },
  mandiRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4 },
  mandiRowAlt:  { backgroundColor: '#F9F9F9' },
  mandiRank:    { width: 30, fontSize: 14, color: '#888', textAlign: 'center' },
  mandiMarket:  { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  mandiDistrict: { fontSize: 12, color: '#888' },
  mandiPriceCol: { width: 80, alignItems: 'flex-end' },
  mandiModal:   { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  priceHigh:    { color: '#2D7A3A' },
  priceLow:     { color: '#C62828' },
  badgeHigh:    { fontSize: 10, color: '#2D7A3A', fontWeight: '700' },
  badgeLow:     { fontSize: 10, color: '#C62828', fontWeight: '700' },

  // Alerts
  addAlertBtn:  { margin: 16, backgroundColor: '#2D7A3A', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  addAlertText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  alertRow:     { backgroundColor: '#FFF', borderRadius: 10, padding: 12, marginHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  alertCrop:    { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  alertDetail:  { fontSize: 13, color: '#555' },
  alertRight:   { alignItems: 'flex-end', gap: 6 },
  alertStatus:  { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  alertActive:  { backgroundColor: '#E8F5E9', color: '#2D7A3A' },
  alertTriggered: { backgroundColor: '#FFF3E0', color: '#E65100' },
  deleteBtn:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#C62828' },
  deleteBtnText: { fontSize: 12, color: '#C62828', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet:   { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  cropChips:    { maxHeight: 44 },
  chip:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#CCC', marginRight: 8 },
  chipActive:   { backgroundColor: '#2D7A3A', borderColor: '#2D7A3A' },
  chipText:     { fontSize: 12, color: '#555' },
  chipTextActive: { color: '#FFF' },
  inputLabel:   { fontSize: 13, fontWeight: '600', color: '#555' },
  directionRow: { flexDirection: 'row', gap: 10 },
  dirBtn:       { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CCC', alignItems: 'center' },
  dirBtnActive: { borderColor: '#2D7A3A', backgroundColor: '#F0FAF2' },
  dirBtnText:   { fontSize: 14, color: '#555', fontWeight: '600' },
  dirBtnTextActive: { color: '#2D7A3A' },
  priceInput:   { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, fontSize: 16, color: '#1A1A1A' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn:    { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#CCC', alignItems: 'center' },
  cancelBtnText: { fontSize: 16, color: '#888' },
  saveBtn:      { flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: '#2D7A3A', alignItems: 'center' },
  saveBtnText:  { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
