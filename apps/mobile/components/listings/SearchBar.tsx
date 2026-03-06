import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { BubbleInput, BubbleButton, BubblePill } from '@/components/common';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';

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
        <BubbleInput
          value={from}
          onChangeText={onFromChange}
          placeholder={t('searchBar.from')}
          dotColor={V2_COLORS.accent1}
          icon="location"
        />

        {/* Swap Button */}
        <TouchableOpacity onPress={handleSwap} style={styles.swapButton}>
          <Animated.View style={swapAnimatedStyle}>
            <Ionicons name="swap-vertical" size={20} color={V2_COLORS.primary} />
          </Animated.View>
        </TouchableOpacity>

        <BubbleInput
          value={to}
          onChangeText={onToChange}
          placeholder={t('searchBar.to')}
          dotColor={V2_COLORS.secondary}
          icon="navigate"
        />

        <BubbleInput
          value={date ? formatDateDisplay(date) : ''}
          onChangeText={onDateChange}
          placeholder={t('searchBar.date')}
          dotColor={V2_COLORS.accent2}
          icon="calendar"
        />

        <BubbleButton
          label={isWeb ? t('searchBar.search') : ''}
          icon="search"
          variant="gradient"
          onPress={onSearch || (() => {})}
          fullWidth
          size="lg"
        />
      </View>

      {/* Quick Options */}
      {showQuickOptions && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.quickOptions}>
          <View style={styles.quickSection}>
            <Text style={styles.quickLabel}>{t('searchBar.when')}</Text>
            <View style={styles.quickChips}>
              {QUICK_DATES.map((item) => (
                <BubblePill
                  key={item.key}
                  label={t(item.labelKey)}
                  icon="calendar-outline"
                  active={false}
                  color={V2_COLORS.accent2}
                  onPress={() => onDateChange(item.getValue())}
                />
              ))}
            </View>
          </View>

          <View style={styles.quickSection}>
            <Text style={styles.quickLabel}>{t('searchBar.popular')}</Text>
            <View style={styles.quickChips}>
              {POPULAR_ROUTES.map((route, index) => (
                <BubblePill
                  key={index}
                  label={t(route.labelKey)}
                  icon="airplane-outline"
                  active={false}
                  color={V2_COLORS.primary}
                  onPress={() => {
                    onFromChange(route.from);
                    onToChange(route.to);
                  }}
                />
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
              <View style={[styles.filterTag, { backgroundColor: V2_COLORS.primary + '15' }]}>
                <Text style={[styles.filterTagText, { color: V2_COLORS.primary }]}>
                  {t('searchBar.fromLabel')} {from}
                </Text>
                <TouchableOpacity onPress={() => onFromChange('')}>
                  <Ionicons name="close" size={14} color={V2_COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            {to && (
              <View style={[styles.filterTag, { backgroundColor: V2_COLORS.accent1 + '15' }]}>
                <Text style={[styles.filterTagText, { color: V2_COLORS.accent1 }]}>
                  {t('searchBar.toLabel')} {to}
                </Text>
                <TouchableOpacity onPress={() => onToChange('')}>
                  <Ionicons name="close" size={14} color={V2_COLORS.accent1} />
                </TouchableOpacity>
              </View>
            )}
            {date && (
              <View style={[styles.filterTag, { backgroundColor: V2_COLORS.accent2 + '15' }]}>
                <Text style={[styles.filterTagText, { color: V2_COLORS.accent2 }]}>
                  {formatDateDisplay(date)}
                </Text>
                <TouchableOpacity onPress={() => onDateChange('')}>
                  <Ionicons name="close" size={14} color={V2_COLORS.accent2} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={clearAll}>
            <Text style={[styles.clearAllText, { color: V2_COLORS.secondary }]}>
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
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: V2_COLORS.blob1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    ...BUBBLE_SHADOWS.xs,
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
    color: V2_COLORS.textMuted,
  },
  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
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
    borderRadius: RADIUS.pill,
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
