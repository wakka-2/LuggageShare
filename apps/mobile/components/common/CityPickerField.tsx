import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, themed } from '@/providers/ThemeProvider';
import { searchAirports, cityLabel, findAirport, type Airport } from '@/lib/airports';

export interface CitySelection {
  city: string;
  code: string;
}

interface CityPickerFieldProps {
  label: string;
  dotColor: string;
  city?: string | null;
  code?: string | null;
  placeholder: string;
  onSelect: (value: CitySelection) => void;
}

/**
 * Tap-to-pick city field with a searchable airport list (Arabic, English or
 * IATA code). Picking fills city and code together; a city that is not in the
 * list can still be used via the "Use …" row.
 */
export function CityPickerField({
  label,
  dotColor,
  city,
  code,
  placeholder,
  onSelect,
}: CityPickerFieldProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchAirports(query), [query]);
  const trimmed = query.trim();
  const showCustom = trimmed.length > 1 && !findAirport(trimmed);

  const pick = (value: CitySelection) => {
    onSelect(value);
    setOpen(false);
    setQuery('');
  };

  const pickAirport = (a: Airport) => pick({ city: a.en, code: a.code });

  return (
    <View style={styles.group}>
      <View style={styles.labelRow}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.label}>{label}</Text>
      </View>

      <TouchableOpacity
        style={styles.field}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${city ? cityLabel(city, i18n.language) : placeholder}`}
      >
        <Ionicons
          name="location-outline"
          size={20}
          color={city ? V2_COLORS.primary : V2_COLORS.textMuted}
        />
        <Text style={[styles.fieldText, !city && styles.placeholder]} numberOfLines={1}>
          {city ? cityLabel(city, i18n.language) : placeholder}
        </Text>
        {!!code && (
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{code}</Text>
          </View>
        )}
        <Ionicons name="chevron-down" size={18} color={V2_COLORS.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <SafeAreaView style={[styles.modal, { direction: isRTL ? 'rtl' : 'ltr' }]}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => setOpen(false)}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Ionicons name="close" size={22} color={V2_COLORS.text} />
            </Pressable>
            <Text style={styles.modalTitle}>{label}</Text>
            <View style={styles.closeBtn} />
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={V2_COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={t('cityPicker.search')}
              placeholderTextColor={V2_COLORS.textMuted}
              autoFocus
              autoCorrect={false}
              returnKeyType="done"
              textAlign={isRTL ? 'right' : 'left'}
            />
            {!!query && (
              <Pressable onPress={() => setQuery('')} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color={V2_COLORS.textMuted} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={results}
            keyExtractor={(a) => a.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            ListFooterComponent={
              showCustom ? (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => pick({ city: trimmed, code: '' })}
                >
                  <Ionicons name="add-circle-outline" size={22} color={V2_COLORS.primary} />
                  <Text style={[styles.rowCity, { color: V2_COLORS.primary }]}>
                    {t('cityPicker.useCustom', { city: trimmed })}
                  </Text>
                </TouchableOpacity>
              ) : null
            }
            ListEmptyComponent={
              showCustom ? null : <Text style={styles.empty}>{t('cityPicker.noResults')}</Text>
            }
            renderItem={({ item }) => {
              const selected = item.en === city;
              return (
                <TouchableOpacity
                  style={[styles.row, selected && styles.rowSelected]}
                  onPress={() => pickAirport(item)}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowCity}>{isRTL ? item.ar : item.en}</Text>
                    <Text style={styles.rowCountry}>{isRTL ? item.countryAr : item.countryEn}</Text>
                  </View>
                  <Text style={styles.rowCode}>{item.code}</Text>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={20} color={V2_COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    group: { marginBottom: 12 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    label: { fontSize: 14, fontWeight: '600', color: V2_COLORS.textSoft },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 56,
      paddingHorizontal: 18,
      borderRadius: RADIUS.card,
      backgroundColor: V2_COLORS.surface,
      ...BUBBLE_SHADOWS.xs,
    },
    fieldText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: V2_COLORS.text,
      textAlign: 'left',
    },
    placeholder: { fontWeight: '400', color: V2_COLORS.textMuted },
    codeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: V2_COLORS.primary + '22',
    },
    codeText: { fontSize: 12, fontWeight: '700', color: V2_COLORS.primary, letterSpacing: 1 },

    modal: { flex: 1, backgroundColor: V2_COLORS.bg },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: 17, fontWeight: '700', color: V2_COLORS.text },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 14,
      height: 48,
      borderRadius: RADIUS.card,
      backgroundColor: V2_COLORS.surface,
    },
    searchInput: { flex: 1, fontSize: 16, color: V2_COLORS.text },
    list: { paddingHorizontal: 16, paddingBottom: 40 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    rowSelected: { backgroundColor: V2_COLORS.primary + '14' },
    rowText: { flex: 1 },
    rowCity: { fontSize: 16, fontWeight: '600', color: V2_COLORS.text, textAlign: 'left' },
    rowCountry: { fontSize: 13, color: V2_COLORS.textMuted, marginTop: 2, textAlign: 'left' },
    rowCode: { fontSize: 13, fontWeight: '700', color: V2_COLORS.textSoft, letterSpacing: 1 },
    empty: { textAlign: 'center', color: V2_COLORS.textMuted, marginTop: 32 },
  })
);
