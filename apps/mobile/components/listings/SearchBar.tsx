import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SPACING, TYPOGRAPHY, SECTION_TINTS } from '@/providers/ThemeProvider';

interface SearchBarProps {
  from: string;
  to: string;
  date: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSearch?: () => void;
  onSwap?: () => void;
}

const POPULAR_ROUTES = [
  { from: 'RUH', to: 'DXB', labelKey: 'searchBar.routeRuhDxb' },
  { from: 'JED', to: 'CAI', labelKey: 'searchBar.routeJedCai' },
  { from: 'DMM', to: 'BAH', labelKey: 'searchBar.routeDmmBah' },
  { from: 'RUH', to: 'AMM', labelKey: 'searchBar.routeRuhAmm' },
];

const QUICK_DATES = [
  {
    key: 'today',
    labelKey: 'searchBar.today',
    getValue: () => new Date().toISOString().split('T')[0],
  },
  {
    key: 'tomorrow',
    labelKey: 'searchBar.tomorrow',
    getValue: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    },
  },
  {
    key: 'week',
    labelKey: 'searchBar.thisWeek',
    getValue: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    },
  },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function SearchBar({
  from,
  to,
  date,
  onFromChange,
  onToChange,
  onDateChange,
  onSearch,
  onSwap,
}: SearchBarProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';
  const isWeb = Platform.OS === 'web';

  const swapRotation = useSharedValue(0);

  const handleSwap = () => {
    swapRotation.value = withSpring(swapRotation.value + 180, { damping: 12 });
    onSwap?.();
  };

  const swapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swapRotation.value}deg` }],
  }));

  const showQuickOptions = !from && !to && !date;
  const hasFilters = from || to || date;

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const clearAll = () => {
    onFromChange('');
    onToChange('');
    onDateChange('');
  };

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      {/* Search Inputs */}
      <View style={[styles.searchRow, isWeb && styles.searchRowWeb]}>
        {/* From Input — V2: solid white with colored left accent */}
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: SECTION_TINTS.purple, borderColor: colors.primary + '20' },
          ]}
        >
          <View style={[styles.inputIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="location" size={16} color={colors.primary} />
          </View>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('searchBar.from')}
            placeholderTextColor={colors.textTertiary}
            value={from}
            onChangeText={onFromChange}
          />
          {from.length > 0 && (
            <TouchableOpacity onPress={() => onFromChange('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Swap Button — V2: solid primary pill */}
        <AnimatedTouchable
          onPress={handleSwap}
          style={[
            styles.swapButton,
            { backgroundColor: colors.primary + '12', borderColor: colors.primary + '25' },
          ]}
        >
          <Animated.View style={swapAnimatedStyle}>
            <Ionicons name="swap-vertical" size={20} color={colors.primary} />
          </Animated.View>
        </AnimatedTouchable>

        {/* To Input — V2: solid white with colored accent */}
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: SECTION_TINTS.green, borderColor: colors.success + '20' },
          ]}
        >
          <View style={[styles.inputIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="navigate" size={16} color={colors.success} />
          </View>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('searchBar.to')}
            placeholderTextColor={colors.textTertiary}
            value={to}
            onChangeText={onToChange}
          />
          {to.length > 0 && (
            <TouchableOpacity onPress={() => onToChange('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Date Input — V2: solid white with amber accent */}
        <View
          style={[
            styles.inputWrapper,
            styles.dateInput,
            { backgroundColor: SECTION_TINTS.amber, borderColor: colors.warning + '20' },
          ]}
        >
          <View style={[styles.inputIcon, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="calendar" size={16} color={colors.warning} />
          </View>
          {isWeb ? (
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: colors.text,
                fontSize: 15,
                fontWeight: '500',
                fontFamily: 'inherit',
              }}
              placeholder={t('searchBar.date')}
            />
          ) : (
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={t('searchBar.date')}
              placeholderTextColor={colors.textTertiary}
              value={date ? formatDateDisplay(date) : ''}
              onChangeText={onDateChange}
            />
          )}
          {date.length > 0 && (
            <TouchableOpacity onPress={() => onDateChange('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Button — V2: chunky 3D Duolingo style */}
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={onSearch}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
          {isWeb && <Text style={styles.searchButtonText}>{t('searchBar.search')}</Text>}
        </TouchableOpacity>
      </View>

      {/* Quick Options */}
      {showQuickOptions && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.quickOptions}>
          {/* Quick Dates */}
          <View style={styles.quickSection}>
            <Text style={[styles.quickLabel, { color: colors.textTertiary }]}>
              {t('searchBar.when')}
            </Text>
            <View style={styles.quickChips}>
              {QUICK_DATES.map((item, index) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.quickChip,
                    { backgroundColor: colors.warning + '12', borderColor: colors.warning + '30' },
                  ]}
                  onPress={() => onDateChange(item.getValue())}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={14} color={colors.warning} />
                  <Text style={[styles.quickChipText, { color: colors.warning }]}>
                    {t(item.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Popular Routes */}
          <View style={styles.quickSection}>
            <Text style={[styles.quickLabel, { color: colors.textTertiary }]}>
              {t('searchBar.popular')}
            </Text>
            <View style={styles.quickChips}>
              {POPULAR_ROUTES.map((route, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickChip,
                    { backgroundColor: colors.primary + '10', borderColor: colors.primary + '25' },
                  ]}
                  onPress={() => {
                    onFromChange(route.from);
                    onToChange(route.to);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="airplane-outline" size={14} color={colors.primary} />
                  <Text style={[styles.quickChipText, { color: colors.primary }]}>
                    {t(route.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Active Filters Summary */}
      {hasFilters && (
        <Animated.View entering={FadeIn} style={styles.activeFilters}>
          <View style={styles.filterTags}>
            {from && (
              <View
                style={[
                  styles.filterTag,
                  { backgroundColor: colors.primary + '12', borderColor: colors.primary + '25' },
                ]}
              >
                <Text style={[styles.filterTagText, { color: colors.primary }]}>
                  {t('searchBar.fromLabel')} {from}
                </Text>
                <TouchableOpacity onPress={() => onFromChange('')}>
                  <Ionicons name="close" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            {to && (
              <View
                style={[
                  styles.filterTag,
                  { backgroundColor: colors.success + '12', borderColor: colors.success + '25' },
                ]}
              >
                <Text style={[styles.filterTagText, { color: colors.success }]}>
                  {t('searchBar.toLabel')} {to}
                </Text>
                <TouchableOpacity onPress={() => onToChange('')}>
                  <Ionicons name="close" size={14} color={colors.success} />
                </TouchableOpacity>
              </View>
            )}
            {date && (
              <View
                style={[
                  styles.filterTag,
                  { backgroundColor: colors.warning + '12', borderColor: colors.warning + '25' },
                ]}
              >
                <Text style={[styles.filterTagText, { color: colors.warning }]}>
                  {formatDateDisplay(date)}
                </Text>
                <TouchableOpacity onPress={() => onDateChange('')}>
                  <Ionicons name="close" size={14} color={colors.warning} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={clearAll}>
            <Text style={[styles.clearAllText, { color: colors.error }]}>
              {t('searchBar.clearAll')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'column',
    gap: 10,
  },
  searchRowWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  // V2: Solid pastel-tinted input with rounded icon
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.input,
    borderWidth: 1.5,
    paddingHorizontal: SPACING[2], // 8
    paddingVertical: SPACING[2], // 8
    gap: SPACING[2], // 8
    flex: 1,
    minWidth: 120,
  },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInput: {
    minWidth: 140,
    maxWidth: 180,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  // V2: Chunky swap button
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  // V2: Chunky 3D search button (Duolingo-style)
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[5], // 20
    paddingVertical: SPACING[3], // 12
    borderRadius: RADIUS.button,
    gap: SPACING[2],
    // 3D bottom border effect
    borderBottomWidth: 3,
    borderBottomColor: '#5A52D5',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  quickOptions: {
    marginTop: 16,
    gap: 14,
  },
  quickSection: {
    gap: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // V2: Solid pill chips with visible borders
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    gap: SPACING[1],
  },
  quickChipText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  // V2: Solid colored filter tags with borders
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.badge,
    borderWidth: 1,
    gap: 6,
  },
  filterTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
