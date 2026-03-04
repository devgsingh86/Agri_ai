/**
 * ProfitabilityScreen — ranks crops by projected net profit per acre
 * for the farmer's state and resource constraints.
 *
 * Layout:
 *   Season toggle (Kharif | Rabi | Zaid | All)
 *   ▸ Filter row (Water, Soil)
 *   Ranked crop list → tap → cost breakdown modal with editable assumptions
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGetProfitabilityQuery } from '../../services/api';
import type { ProfitabilityCrop, ProfitabilitySeason, WaterRequirement, SoilType } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SEASONS: { key: ProfitabilitySeason; label: string }[] = [
  { key: 'all',    label: 'allSeasons' },
  { key: 'kharif', label: 'kharif' },
  { key: 'rabi',   label: 'rabi' },
  { key: 'zaid',   label: 'zaid' },
];

const WATER_OPTIONS: { key: WaterRequirement | 'all'; labelKey: string }[] = [
  { key: 'all',    labelKey: 'allWater' },
  { key: 'low',    labelKey: 'waterLow' },
  { key: 'medium', labelKey: 'waterMedium' },
  { key: 'high',   labelKey: 'waterHigh' },
];

const SOIL_OPTIONS: { key: SoilType | 'all'; labelKey: string }[] = [
  { key: 'all',      labelKey: 'allSoil' },
  { key: 'alluvial', labelKey: 'soilAlluvial' },
  { key: 'black',    labelKey: 'soilBlack' },
  { key: 'red',      labelKey: 'soilRed' },
  { key: 'loamy',    labelKey: 'soilLoamy' },
  { key: 'sandy',    labelKey: 'soilSandy' },
  { key: 'clayey',   labelKey: 'soilClayey' },
];

const SEASON_COLORS: Record<string, string> = {
  kharif: '#1565C0',
  rabi:   '#6A1B9A',
  zaid:   '#E65100',
  all:    '#2D7A3A',
};

const PROFIT_COLOR = (profit: number) => (profit >= 0 ? '#2D7A3A' : '#C62828');
const MEDAL = (rank: number) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}.`;

// ─── Helper ────────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (Math.abs(amount) >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface DetailModalProps {
  crop: ProfitabilityCrop;
  onClose: () => void;
}

function DetailModal({ crop, onClose }: DetailModalProps): React.JSX.Element {
  const { t } = useTranslation();

  // Editable assumptions (local state only — no server write)
  const [yield_, setYield]    = useState(String(crop.yieldPerAcre));
  const [price,  setPrice]    = useState(String(crop.mandiPrice));
  const [seed,   setSeed]     = useState(String(crop.costBreakdown.seed));
  const [fert,   setFert]     = useState(String(crop.costBreakdown.fertilizer));
  const [labour, setLabour]   = useState(String(crop.costBreakdown.labour));
  const [irrig,  setIrrig]    = useState(String(crop.costBreakdown.irrigation));

  const computed = useMemo(() => {
    const y = parseFloat(yield_) || 0;
    const p = parseFloat(price)  || 0;
    const s = parseFloat(seed)   || 0;
    const f = parseFloat(fert)   || 0;
    const l = parseFloat(labour) || 0;
    const i = parseFloat(irrig)  || 0;
    const revenue  = Math.round(y * p);
    const totalCost = s + f + l + i;
    const netProfit = revenue - totalCost;
    const roi = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;
    return { revenue, totalCost, netProfit, roi };
  }, [yield_, price, seed, fert, labour, irrig]);

  const seasonColor = SEASON_COLORS[crop.season] ?? '#2D7A3A';

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalCropName}>{t(crop.cropKey)}</Text>
              <View style={[styles.seasonBadge, { backgroundColor: seasonColor }]}>
                <Text style={styles.seasonBadgeText}>{t(crop.season)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Live profit summary */}
            <View style={[styles.profitSummary, { borderColor: PROFIT_COLOR(computed.netProfit) }]}>
              <Text style={styles.summaryLabel}>{t('netProfitPerAcre')}</Text>
              <Text style={[styles.summaryValue, { color: PROFIT_COLOR(computed.netProfit) }]}>
                {formatINR(computed.netProfit)}
              </Text>
              <Text style={styles.summaryRoi}>
                ROI {computed.roi >= 0 ? '+' : ''}{computed.roi}%  ·  {t('revenue')}: {formatINR(computed.revenue)}
              </Text>
            </View>

            {/* Editable assumptions */}
            <Text style={styles.sectionHeading}>{t('editAssumptions')}</Text>

            <View style={styles.inputGrid}>
              <InputRow label={`${t('expectedYield')} (q/acre)`} value={yield_} onChange={setYield} />
              <InputRow label={`${t('mandiPrice')} (₹/q)`}       value={price}  onChange={setPrice} />
              <InputRow label={`${t('seedCost')} (₹/acre)`}       value={seed}   onChange={setSeed} />
              <InputRow label={`${t('fertCost')} (₹/acre)`}       value={fert}   onChange={setFert} />
              <InputRow label={`${t('labourCost')} (₹/acre)`}     value={labour} onChange={setLabour} />
              <InputRow label={`${t('irrigCost')} (₹/acre)`}      value={irrig}  onChange={setIrrig} />
            </View>

            {/* Cost breakdown bar */}
            <Text style={styles.sectionHeading}>{t('costBreakdown')}</Text>
            {computed.totalCost > 0 && (
              <CostBar
                items={[
                  { label: t('seedCost'),   value: parseFloat(seed)   || 0, color: '#1565C0' },
                  { label: t('fertCost'),   value: parseFloat(fert)   || 0, color: '#6A1B9A' },
                  { label: t('labourCost'), value: parseFloat(labour) || 0, color: '#E65100' },
                  { label: t('irrigCost'),  value: parseFloat(irrig)  || 0, color: '#00838F' },
                ]}
                total={computed.totalCost}
              />
            )}

            {/* Soil & water tags */}
            <View style={styles.tagsRow}>
              <Tag label={`💧 ${t(waterKey(crop.waterRequirement))}`} color="#1565C0" />
              {crop.soilTypes.slice(0, 3).map((s) => (
                <Tag key={s} label={`🌱 ${t(soilKey(s))}`} color="#2D7A3A" />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InputRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        returnKeyType="done"
      />
    </View>
  );
}

function CostBar({ items, total }: { items: { label: string; value: number; color: string }[]; total: number }) {
  return (
    <View>
      <View style={styles.barTrack}>
        {items.map((item) => (
          <View
            key={item.label}
            style={[styles.barSegment, { flex: item.value / total, backgroundColor: item.color }]}
          />
        ))}
      </View>
      <View style={styles.barLegend}>
        {items.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}: {formatINR(item.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

function waterKey(w: WaterRequirement): string {
  return ({ low: 'waterLow', medium: 'waterMedium', high: 'waterHigh' } as Record<string, string>)[w] ?? w;
}
function soilKey(s: SoilType): string {
  return ({
    alluvial: 'soilAlluvial', black: 'soilBlack', red: 'soilRed',
    loamy: 'soilLoamy', sandy: 'soilSandy', clayey: 'soilClayey',
  } as Record<string, string>)[s] ?? s;
}

// ─── Crop Card ────────────────────────────────────────────────────────────────

function CropCard({ crop, rank, onPress }: { crop: ProfitabilityCrop; rank: number; onPress: () => void }) {
  const { t } = useTranslation();
  const profit    = crop.netProfitPerAcre;
  const seasonClr = SEASON_COLORS[crop.season] ?? '#2D7A3A';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardLeft}>
        <Text style={styles.rankMedal}>{MEDAL(rank)}</Text>
        <View>
          <Text style={styles.cardCropName}>{t(crop.cropKey)}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.seasonPill, { backgroundColor: seasonClr + '22', borderColor: seasonClr }]}>
              <Text style={[styles.seasonPillText, { color: seasonClr }]}>{t(crop.season)}</Text>
            </View>
            <Text style={styles.cardSubtext}>
              {crop.yieldPerAcre}q/acre · ₹{crop.mandiPrice}/q
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.profitAmount, { color: PROFIT_COLOR(profit) }]}>
          {formatINR(profit)}
        </Text>
        <Text style={styles.perAcreLabel}>{t('perAcre')}</Text>
        <Text style={[styles.roiText, { color: PROFIT_COLOR(profit) }]}>
          {profit >= 0 ? '+' : ''}{crop.roi}% ROI
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export function ProfitabilityScreen(): React.JSX.Element {
  const { t } = useTranslation();

  const [season,  setSeason]  = useState<ProfitabilitySeason>('all');
  const [water,   setWater]   = useState<WaterRequirement | 'all'>('all');
  const [soil,    setSoil]    = useState<SoilType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<ProfitabilityCrop | null>(null);

  // Always fetch ALL crops once — filter client-side for instant tab switching
  const { data, isLoading, isError, refetch } = useGetProfitabilityQuery({});

  const filteredCrops = useMemo(() => {
    if (!data?.crops) return [];
    return data.crops
      .filter((c) => season === 'all' || c.season === season)
      .filter((c) => water  === 'all' || c.waterRequirement === water)
      .filter((c) => soil   === 'all' || c.soilTypes.includes(soil as SoilType));
  }, [data, season, water, soil]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Season toggle */}
      <View style={styles.seasonBar}>
        {SEASONS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.seasonBtn, season === key && styles.seasonBtnActive]}
            onPress={() => setSeason(key)}
          >
            <Text style={[styles.seasonBtnText, season === key && styles.seasonBtnTextActive]}>
              {t(label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter toggle */}
      <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters((v) => !v)}>
        <Text style={styles.filterToggleText}>
          {showFilters ? '▲' : '▼'} {t('filters')}
          {(water !== 'all' || soil !== 'all') ? '  •  ' + t('filtersActive') : ''}
        </Text>
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.filterPanel}>
          {/* Water filter */}
          <Text style={styles.filterLabel}>{t('waterAvail')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {WATER_OPTIONS.map(({ key, labelKey }) => (
              <TouchableOpacity
                key={key}
                style={[styles.chip, water === key && styles.chipActive]}
                onPress={() => setWater(key)}
              >
                <Text style={[styles.chipText, water === key && styles.chipTextActive]}>{t(labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Soil filter */}
          <Text style={styles.filterLabel}>{t('soilType')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {SOIL_OPTIONS.map(({ key, labelKey }) => (
              <TouchableOpacity
                key={key}
                style={[styles.chip, soil === key && styles.chipActive]}
                onPress={() => setSoil(key as SoilType | 'all')}
              >
                <Text style={[styles.chipText, soil === key && styles.chipTextActive]}>{t(labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Crop list */}
      {isLoading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color="#2D7A3A" />
          <Text style={styles.loadingText}>{t('calculatingProfits')}</Text>
        </View>
      ) : isError || !data ? (
        <View style={styles.centred}>
          <Text style={styles.errorText}>{t('couldNotLoadProfitability')}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          <Text style={styles.listMeta}>
            📍 {data.state}  ·  {data.farmSizeAcres.toFixed(1)} {t('acres')}
            {filteredCrops.length > 0 ? `  ·  ${filteredCrops.length} ${t('cropsFound')}` : ''}
          </Text>
          {filteredCrops.length === 0 ? (
            <Text style={styles.noResults}>{t('noMatchingCrops')}</Text>
          ) : (
            filteredCrops.map((crop, i) => (
              <CropCard key={crop.cropKey + crop.season} crop={crop} rank={i} onPress={() => setSelected(crop)} />
            ))
          )}
        </ScrollView>
      )}

      {selected && <DetailModal crop={selected} onClose={() => setSelected(null)} />}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F5' },

  // Season toggle
  seasonBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  seasonBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  seasonBtnActive: { backgroundColor: '#2D7A3A' },
  seasonBtnText: { fontSize: 12, fontWeight: '600', color: '#666' },
  seasonBtnTextActive: { color: '#FFFFFF' },

  // Filter
  filterToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  filterToggleText: { fontSize: 13, color: '#2D7A3A', fontWeight: '600' },
  filterPanel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#666', marginTop: 10, marginBottom: 6 },
  chipRow: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 8,
    backgroundColor: '#FAFAFA',
  },
  chipActive: { borderColor: '#2D7A3A', backgroundColor: '#E8F5E9' },
  chipText: { fontSize: 12, color: '#666' },
  chipTextActive: { color: '#2D7A3A', fontWeight: '700' },

  // List
  list: { flex: 1 },
  listContent: { padding: 12, gap: 8, paddingBottom: 32 },
  listMeta: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 4 },
  noResults: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },

  // Crop card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  rankMedal: { fontSize: 20, minWidth: 28 },
  cardCropName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  seasonPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  seasonPillText: { fontSize: 10, fontWeight: '700' },
  cardSubtext: { fontSize: 11, color: '#888' },
  cardRight: { alignItems: 'flex-end' },
  profitAmount: { fontSize: 18, fontWeight: '800' },
  perAcreLabel: { fontSize: 10, color: '#888', marginTop: 1 },
  roiText: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  // States
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#666' },
  errorText: { fontSize: 14, color: '#999' },
  retryBtn: { backgroundColor: '#2D7A3A', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalCropName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  seasonBadge: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  seasonBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 18, color: '#999' },

  profitSummary: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: { fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 32, fontWeight: '800' },
  summaryRoi: { fontSize: 12, color: '#888', marginTop: 4 },

  sectionHeading: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12, marginTop: 8 },

  inputGrid: { gap: 10, marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputLabel: { fontSize: 13, color: '#555', flex: 1 },
  input: {
    width: 110,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'right',
  },

  barTrack: { flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 10 },
  barSegment: { height: '100%' },
  barLegend: { flexWrap: 'wrap', flexDirection: 'row', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#555' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, paddingBottom: 16 },
  tag: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, fontWeight: '600' },
});
