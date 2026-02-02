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
  { from: 'RUH', to: 'DXB', label: 'Riyadh → Dubai', labelAr: 'الرياض → دبي' },
  { from: 'JED', to: 'CAI', label: 'Jeddah → Cairo', labelAr: 'جدة → القاهرة' },
  { from: 'DMM', to: 'BAH', label: 'Dammam → Bahrain', labelAr: 'الدمام → البحرين' },
  { from: 'RUH', to: 'AMM', label: 'Riyadh → Amman', labelAr: 'الرياض → عمان' },
];

const QUICK_DATES = [
  { key: 'today', label: 'Today', labelAr: 'اليوم', getValue: () => new Date().toISOString().split('T')[0] },
  { key: 'tomorrow', label: 'Tomorrow', labelAr: 'غداً', getValue: () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }},
  { key: 'week', label: 'This week', labelAr: 'هذا الأسبوع', getValue: () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }},
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
  const { i18n } = useTranslation();
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
        {/* From Input */}
        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={isRTL ? 'من أين؟' : 'From'}
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

        {/* Swap Button */}
        <AnimatedTouchable
          onPress={handleSwap}
          style={[styles.swapButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Animated.View style={swapAnimatedStyle}>
            <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
          </Animated.View>
        </AnimatedTouchable>

        {/* To Input */}
        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="navigate" size={20} color={colors.success} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={isRTL ? 'إلى أين؟' : 'To'}
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

        {/* Date Input */}
        <View style={[styles.inputWrapper, styles.dateInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="calendar" size={20} color={colors.warning} />
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
              placeholder={isRTL ? 'التاريخ' : 'Date'}
            />
          ) : (
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={isRTL ? 'التاريخ' : 'Date'}
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

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={onSearch}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
          {isWeb && (
            <Text style={styles.searchButtonText}>
              {isRTL ? 'بحث' : 'Search'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Options */}
      {showQuickOptions && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.quickOptions}>
          {/* Quick Dates */}
          <View style={styles.quickSection}>
            <Text style={[styles.quickLabel, { color: colors.textTertiary }]}>
              {isRTL ? 'التاريخ:' : 'When:'}
            </Text>
            <View style={styles.quickChips}>
              {QUICK_DATES.map((item, index) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.quickChip, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' }]}
                  onPress={() => onDateChange(item.getValue())}
                >
                  <Ionicons name="calendar-outline" size={14} color={colors.warning} />
                  <Text style={[styles.quickChipText, { color: colors.warning }]}>
                    {isRTL ? item.labelAr : item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Popular Routes */}
          <View style={styles.quickSection}>
            <Text style={[styles.quickLabel, { color: colors.textTertiary }]}>
              {isRTL ? 'الوجهات الشائعة:' : 'Popular:'}
            </Text>
            <View style={styles.quickChips}>
              {POPULAR_ROUTES.map((route, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickChip, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}
                  onPress={() => {
                    onFromChange(route.from);
                    onToChange(route.to);
                  }}
                >
                  <Ionicons name="airplane-outline" size={14} color={colors.primary} />
                  <Text style={[styles.quickChipText, { color: colors.primary }]}>
                    {isRTL ? route.labelAr : route.label}
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
              <View style={[styles.filterTag, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.filterTagText, { color: colors.primary }]}>
                  {isRTL ? 'من:' : 'From:'} {from}
                </Text>
                <TouchableOpacity onPress={() => onFromChange('')}>
                  <Ionicons name="close" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            {to && (
              <View style={[styles.filterTag, { backgroundColor: colors.success + '15' }]}>
                <Text style={[styles.filterTagText, { color: colors.success }]}>
                  {isRTL ? 'إلى:' : 'To:'} {to}
                </Text>
                <TouchableOpacity onPress={() => onToChange('')}>
                  <Ionicons name="close" size={14} color={colors.success} />
                </TouchableOpacity>
              </View>
            )}
            {date && (
              <View style={[styles.filterTag, { backgroundColor: colors.warning + '15' }]}>
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
              {isRTL ? 'مسح الكل' : 'Clear all'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    flex: 1,
    minWidth: 120,
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
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
