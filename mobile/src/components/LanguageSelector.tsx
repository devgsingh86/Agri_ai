/**
 * LanguageSelector — a compact button that opens a modal to switch language.
 * Displays the current language's native name + flag.
 * Place it inline next to the profile name in the Dashboard greeting row.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../store/languageSlice';
import { LANGUAGES } from '../i18n';
import type { RootState, AppDispatch } from '../store';

export function LanguageSelector(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const selected = useSelector((state: RootState) => state.language.selected);
  const [visible, setVisible] = useState(false);

  const current = LANGUAGES.find((l) => l.code === selected) ?? LANGUAGES[0];

  const handleSelect = (code: string) => {
    dispatch(setLanguage(code));
    setVisible(false);
  };

  return (
    <>
      {/* Trigger button */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        accessibilityLabel={`Language: ${current.name}. Tap to change.`}
      >
        <Text style={styles.triggerFlag}>{current.flag}</Text>
        <Text style={styles.triggerName}>{current.nativeName}</Text>
        <Text style={styles.triggerChevron}>▾</Text>
      </TouchableOpacity>

      {/* Language picker modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        />
        <SafeAreaView style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select Language / भाषा चुनें</Text>
          <FlatList
            data={LANGUAGES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const isSelected = item.code === selected;
              return (
                <TouchableOpacity
                  style={[styles.langRow, isSelected && styles.langRowSelected]}
                  onPress={() => handleSelect(item.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.langFlag}>{item.flag}</Text>
                  <View style={styles.langText}>
                    <Text style={[styles.langNative, isSelected && styles.langNativeSelected]}>
                      {item.nativeName}
                    </Text>
                    <Text style={styles.langEnglish}>{item.name}</Text>
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  triggerFlag: { fontSize: 14 },
  triggerName: { fontSize: 12, fontWeight: '600', color: '#2D7A3A', maxWidth: 70 },
  triggerChevron: { fontSize: 10, color: '#2D7A3A' },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '75%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listContent: { paddingVertical: 8 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 14,
  },
  langRowSelected: { backgroundColor: '#F0F7F1' },
  langFlag: { fontSize: 24, width: 32 },
  langText: { flex: 1 },
  langNative: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  langNativeSelected: { color: '#2D7A3A' },
  langEnglish: { fontSize: 12, color: '#888', marginTop: 2 },
  checkmark: { fontSize: 16, color: '#2D7A3A', fontWeight: '700' },
});
