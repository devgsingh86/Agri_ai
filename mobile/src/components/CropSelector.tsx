/**
 * CropSelector — searchable, multi-select crop picker backed by the /crops API.
 * Supports adding custom crops not present in the catalogue.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useGetCropsQuery } from '../services/api';
import type { CropItem, Crop } from '../types';

interface CropSelectorProps {
  selectedCrops: CropItem[];
  onChange: (crops: CropItem[]) => void;
  maxSelections?: number;
}

export function CropSelector({
  selectedCrops,
  onChange,
  maxSelections = 5,
}: CropSelectorProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 300 ms debounce on search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  const { data: cropsData, isFetching } = useGetCropsQuery(
    debouncedQuery ? { search: debouncedQuery, limit: 30 } : { limit: 30 }
  );

  const crops: Crop[] = cropsData?.data ?? [];

  const isSelected = useCallback(
    (crop: Crop): boolean =>
      selectedCrops.some((sc) => sc.crop_id === crop.id || sc.crop_name === crop.name),
    [selectedCrops]
  );

  const toggleCrop = useCallback(
    (crop: Crop) => {
      if (isSelected(crop)) {
        onChange(selectedCrops.filter((sc) => sc.crop_id !== crop.id));
      } else if (selectedCrops.length < maxSelections) {
        onChange([
          ...selectedCrops,
          { crop_id: crop.id, crop_name: crop.name, is_custom: false },
        ]);
      }
    },
    [isSelected, selectedCrops, onChange, maxSelections]
  );

  const addCustomCrop = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    if (selectedCrops.some((sc) => sc.crop_name.toLowerCase() === trimmed.toLowerCase()))
      return;
    if (selectedCrops.length >= maxSelections) return;
    onChange([
      ...selectedCrops,
      { crop_id: null, crop_name: trimmed, is_custom: true },
    ]);
    setSearchQuery('');
  }, [searchQuery, selectedCrops, onChange, maxSelections]);

  const removeSelected = useCallback(
    (cropName: string) => {
      onChange(selectedCrops.filter((sc) => sc.crop_name !== cropName));
    },
    [selectedCrops, onChange]
  );

  const showCustomAdd =
    searchQuery.trim().length > 0 &&
    !crops.some((c) => c.name.toLowerCase() === searchQuery.trim().toLowerCase()) &&
    !selectedCrops.some(
      (sc) => sc.crop_name.toLowerCase() === searchQuery.trim().toLowerCase()
    ) &&
    selectedCrops.length < maxSelections;

  return (
    <View style={styles.container}>
      {/* Search input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search crops..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="words"
        accessibilityLabel="Search crops"
      />

      {/* Selected chips */}
      {selectedCrops.length > 0 && (
        <View style={styles.chipsContainer}>
          {selectedCrops.map((sc) => (
            <View key={sc.crop_name} style={styles.chip}>
              <Text style={styles.chipText}>
                {sc.crop_name}
                {sc.is_custom ? ' ✦' : ''}
              </Text>
              <TouchableOpacity
                onPress={() => removeSelected(sc.crop_name)}
                accessibilityLabel={`Remove ${sc.crop_name}`}
                style={styles.chipRemove}
              >
                <Text style={styles.chipRemoveText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.limitHint}>
        {selectedCrops.length}/{maxSelections} selected
      </Text>

      {/* Results list */}
      {isFetching ? (
        <ActivityIndicator style={styles.loader} color="#2D7A3A" />
      ) : (
        <FlatList
          data={crops}
          keyExtractor={(item) => item.id}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const selected = isSelected(item);
            const disabled = !selected && selectedCrops.length >= maxSelections;
            return (
              <TouchableOpacity
                style={[
                  styles.cropRow,
                  selected && styles.cropRowSelected,
                  disabled && styles.cropRowDisabled,
                ]}
                onPress={() => toggleCrop(item)}
                disabled={disabled}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={item.name}
              >
                <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.cropInfo}>
                  <Text style={[styles.cropName, disabled && styles.cropNameDisabled]}>
                    {item.name}
                  </Text>
                  {item.category ? (
                    <Text style={styles.cropCategory}>{item.category}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {debouncedQuery ? `No crops found for "${debouncedQuery}"` : 'No crops available'}
            </Text>
          }
        />
      )}

      {/* Add custom crop */}
      {showCustomAdd && (
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={addCustomCrop}
          accessibilityLabel={`Add "${searchQuery.trim()}" as custom crop`}
        >
          <Text style={styles.addCustomText}>
            + Add "{searchQuery.trim()}" as custom crop
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  chipText: {
    fontSize: 13,
    color: '#2D7A3A',
    fontWeight: '500',
  },
  chipRemove: {
    marginLeft: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#A5D6A7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRemoveText: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 18,
  },
  limitHint: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    textAlign: 'right',
  },
  loader: {
    marginVertical: 20,
  },
  list: {
    maxHeight: 260,
  },
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  cropRowSelected: {
    backgroundColor: '#F1F8F2',
  },
  cropRowDisabled: {
    opacity: 0.4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#2D7A3A',
    backgroundColor: '#2D7A3A',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 15,
    color: '#333',
  },
  cropNameDisabled: {
    color: '#AAAAAA',
  },
  cropCategory: {
    fontSize: 12,
    color: '#888',
    marginTop: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    paddingVertical: 20,
    fontSize: 14,
  },
  addCustomButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addCustomText: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '500',
  },
});
