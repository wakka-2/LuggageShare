import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

export interface FilterState {
  from: string;
  to: string;
  date: string;
  minWeight: number | null;
  maxPrice: number | null;
  verifiedOnly: boolean;
}

interface TripFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
}

const POPULAR_ROUTES = [
  { from: 'RUH', to: 'CAI', label: 'Riyadh → Cairo' },
  { from: 'JED', to: 'DXB', label: 'Jeddah → Dubai' },
  { from: 'RUH', to: 'AMM', label: 'Riyadh → Amman' },
  { from: 'DMM', to: 'BAH', label: 'Dammam → Bahrain' },
];

export function TripFilters({ filters, onFiltersChange, resultCount }: TripFiltersProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isWeb = Platform.OS === 'web';
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      from: '',
      to: '',
      date: '',
      minWeight: null,
      maxPrice: null,
      verifiedOnly: false,
    });
  };

  const hasActiveFilters = filters.from || filters.to || filters.date ||
    filters.minWeight || filters.maxPrice || filters.verifiedOnly;

  return (
    <Animated.View
      entering={FadeIn}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Main Search Row */}
      <View style={[styles.searchRow, isWeb && styles.searchRowWeb]}>
        {/* From */}
        <View style={[styles.inputGroup, isWeb && styles.inputGroupWeb]}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('home.from')}
            placeholderTextColor={colors.textSecondary}
            value={filters.from}
            onChangeText={(text) => updateFilter('from', text)}
          />
        </View>

        {/* Swap Button */}
        <TouchableOpacity
          style={[styles.swapButton, { backgroundColor: colors.background }]}
          onPress={() => {
            const temp = filters.from;
            updateFilter('from', filters.to);
            updateFilter('to', temp);
          }}
        >
          <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* To */}
        <View style={[styles.inputGroup, isWeb && styles.inputGroupWeb]}>
          <Ionicons name="navigate-outline" size={20} color={colors.success} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('home.to')}
            placeholderTextColor={colors.textSecondary}
            value={filters.to}
            onChangeText={(text) => updateFilter('to', text)}
          />
        </View>

        {/* Date */}
        <View style={[styles.inputGroup, isWeb && styles.inputGroupWeb]}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('home.date')}
            placeholderTextColor={colors.textSecondary}
            value={filters.date}
            onChangeText={(text) => updateFilter('date', text)}
          />
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
          {isWeb && <Text style={styles.searchButtonText}>{t('home.searchButton')}</Text>}
        </TouchableOpacity>
      </View>

      {/* Popular Routes */}
      {isWeb && !hasActiveFilters && (
        <Animated.View entering={SlideInUp.delay(100)} style={styles.popularSection}>
          <Text style={[styles.popularLabel, { color: colors.textSecondary }]}>
            {t('home.popularRoutes')}:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.popularRoutes}>
              {POPULAR_ROUTES.map((route, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.routeChip, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => {
                    updateFilter('from', route.from);
                    updateFilter('to', route.to);
                  }}
                >
                  <Text style={[styles.routeChipText, { color: colors.text }]}>
                    {route.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* Advanced Filters Toggle */}
      <View style={styles.advancedRow}>
        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Ionicons
            name={showAdvanced ? 'chevron-up' : 'options-outline'}
            size={18}
            color={colors.textSecondary}
          />
          <Text style={[styles.advancedText, { color: colors.textSecondary }]}>
            {showAdvanced ? 'Hide filters' : 'More filters'}
          </Text>
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={[styles.clearText, { color: colors.error }]}>
              Clear all
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {resultCount} trips found
        </Text>
      </View>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Animated.View entering={SlideInUp} style={styles.advancedFilters}>
          <View style={styles.filterRow}>
            <View style={[styles.filterItem, { backgroundColor: colors.background }]}>
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
                Min Weight (kg)
              </Text>
              <TextInput
                style={[styles.filterInput, { color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={filters.minWeight?.toString() || ''}
                onChangeText={(text) => updateFilter('minWeight', text ? parseInt(text) : null)}
              />
            </View>

            <View style={[styles.filterItem, { backgroundColor: colors.background }]}>
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
                Max Price (SAR)
              </Text>
              <TextInput
                style={[styles.filterInput, { color: colors.text }]}
                placeholder="Any"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={filters.maxPrice?.toString() || ''}
                onChangeText={(text) => updateFilter('maxPrice', text ? parseInt(text) : null)}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.verifiedFilter,
                { backgroundColor: colors.background, borderColor: filters.verifiedOnly ? colors.primary : colors.border }
              ]}
              onPress={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
            >
              <Ionicons
                name={filters.verifiedOnly ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={20}
                color={filters.verifiedOnly ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.verifiedText, { color: filters.verifiedOnly ? colors.primary : colors.textSecondary }]}>
                Verified only
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: 'column',
    gap: 12,
  },
  searchRowWeb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  inputGroupWeb: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    // Note: outlineStyle removed as it's web-only and not in RN types
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  popularSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  popularLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
  popularRoutes: {
    flexDirection: 'row',
    gap: 8,
  },
  routeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  routeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  advancedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  advancedText: {
    fontSize: 13,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultCount: {
    fontSize: 13,
  },
  advancedFilters: {
    marginTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  filterItem: {
    flex: 1,
    minWidth: 120,
    padding: 12,
    borderRadius: 10,
  },
  filterLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  filterInput: {
    fontSize: 15,
    fontWeight: '500',
  },
  verifiedFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
