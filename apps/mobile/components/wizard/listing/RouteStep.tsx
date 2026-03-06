import React, { useState, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { OptionChips, ChipOption } from '../OptionChips';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

const POPULAR_ROUTES: ChipOption[] = [
  { id: 'ruh-jed', label: 'Riyadh → Jeddah' },
  { id: 'ruh-dxb', label: 'RUH → DXB' },
  { id: 'jed-cai', label: 'Jeddah → Cairo' },
  { id: 'ruh-amm', label: 'RUH → AMM' },
];

const ROUTE_MAP: Record<string, { from: string; fromCode: string; to: string; toCode: string }> = {
  'ruh-jed': { from: 'Riyadh', fromCode: 'RUH', to: 'Jeddah', toCode: 'JED' },
  'ruh-dxb': { from: 'Riyadh', fromCode: 'RUH', to: 'Dubai', toCode: 'DXB' },
  'jed-cai': { from: 'Jeddah', fromCode: 'JED', to: 'Cairo', toCode: 'CAI' },
  'ruh-amm': { from: 'Riyadh', fromCode: 'RUH', to: 'Amman', toCode: 'AMM' },
};

interface CityEntry {
  name: string;
  nameAr: string;
  code: string;
  country: string;
}

const CITIES: CityEntry[] = [
  { name: 'Riyadh', nameAr: 'الرياض', code: 'RUH', country: 'SA' },
  { name: 'Jeddah', nameAr: 'جدة', code: 'JED', country: 'SA' },
  { name: 'Dammam', nameAr: 'الدمام', code: 'DMM', country: 'SA' },
  { name: 'Medina', nameAr: 'المدينة', code: 'MED', country: 'SA' },
  { name: 'Abha', nameAr: 'أبها', code: 'AHB', country: 'SA' },
  { name: 'Tabuk', nameAr: 'تبوك', code: 'TUU', country: 'SA' },
  { name: 'Dubai', nameAr: 'دبي', code: 'DXB', country: 'AE' },
  { name: 'Abu Dhabi', nameAr: 'أبوظبي', code: 'AUH', country: 'AE' },
  { name: 'Sharjah', nameAr: 'الشارقة', code: 'SHJ', country: 'AE' },
  { name: 'Cairo', nameAr: 'القاهرة', code: 'CAI', country: 'EG' },
  { name: 'Alexandria', nameAr: 'الإسكندرية', code: 'HBE', country: 'EG' },
  { name: 'Amman', nameAr: 'عمّان', code: 'AMM', country: 'JO' },
  { name: 'Beirut', nameAr: 'بيروت', code: 'BEY', country: 'LB' },
  { name: 'Istanbul', nameAr: 'إسطنبول', code: 'IST', country: 'TR' },
  { name: 'Doha', nameAr: 'الدوحة', code: 'DOH', country: 'QA' },
  { name: 'Kuwait City', nameAr: 'الكويت', code: 'KWI', country: 'KW' },
  { name: 'Muscat', nameAr: 'مسقط', code: 'MCT', country: 'OM' },
  { name: 'Bahrain', nameAr: 'البحرين', code: 'BAH', country: 'BH' },
  { name: 'London', nameAr: 'لندن', code: 'LHR', country: 'GB' },
  { name: 'Paris', nameAr: 'باريس', code: 'CDG', country: 'FR' },
  { name: 'Kuala Lumpur', nameAr: 'كوالالمبور', code: 'KUL', country: 'MY' },
  { name: 'Casablanca', nameAr: 'الدار البيضاء', code: 'CMN', country: 'MA' },
  { name: 'Tunis', nameAr: 'تونس', code: 'TUN', country: 'TN' },
  { name: 'Baghdad', nameAr: 'بغداد', code: 'BGW', country: 'IQ' },
  { name: 'Khartoum', nameAr: 'الخرطوم', code: 'KRT', country: 'SD' },
];

function filterCities(query: string, isArabic: boolean): CityEntry[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameAr.includes(query) ||
      c.code.toLowerCase().includes(q)
  ).slice(0, 5);
}

export function RouteStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const [focusedField, setFocusedField] = useState<'from' | 'to' | null>(null);

  const fromSuggestions = useMemo(
    () => (focusedField === 'from' ? filterCities(data.departureCity || '', isRTL) : []),
    [data.departureCity, focusedField, isRTL]
  );
  const toSuggestions = useMemo(
    () => (focusedField === 'to' ? filterCities(data.arrivalCity || '', isRTL) : []),
    [data.arrivalCity, focusedField, isRTL]
  );

  const canAdvance = !!data.departureCity?.trim() && !!data.arrivalCity?.trim();

  const handlePopularRoute = (id: string) => {
    const route = ROUTE_MAP[id];
    if (route) {
      updateData({
        departureCity: route.from,
        departureCode: route.fromCode,
        arrivalCity: route.to,
        arrivalCode: route.toCode,
      });
    }
  };

  return (
    <View>
      <QuestionTitle
        emoji="✈️"
        title={t('listing.wizard.route.title', { defaultValue: 'Where are you traveling?' })}
      />

      {/* From */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <Ionicons name="airplane-outline" size={18} color={colors.primary} />
          <Animated.Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('listing.wizard.route.from', { defaultValue: 'From' })}
          </Animated.Text>
        </View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.departureCity || ''}
          onChangeText={(v) => updateData({ departureCity: v })}
          onFocus={() => setFocusedField('from')}
          onBlur={() => setTimeout(() => setFocusedField((f) => (f === 'from' ? null : f)), 200)}
          placeholder={t('listing.wizard.route.searchCity', { defaultValue: 'Search city...' })}
          placeholderTextColor={colors.textMuted}
          textAlign={isRTL ? 'right' : 'left'}
        />
        {fromSuggestions.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(150)}
            style={[
              styles.suggestions,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {fromSuggestions.map((city) => (
              <TouchableOpacity
                key={city.code}
                style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  updateData({ departureCity: city.name, departureCode: city.code });
                  setFocusedField(null);
                }}
              >
                <Text style={[styles.suggestionName, { color: colors.text }]}>
                  {isRTL ? city.nameAr : city.name}
                </Text>
                <Text style={[styles.suggestionCode, { color: colors.textMuted }]}>
                  {city.code}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
        <TextInput
          style={[
            styles.codeInput,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.departureCode || ''}
          onChangeText={(v) => updateData({ departureCode: v.toUpperCase() })}
          placeholder="RUH"
          placeholderTextColor={colors.textMuted}
          maxLength={4}
          autoCapitalize="characters"
          textAlign="center"
        />
      </Animated.View>

      {/* To */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <Ionicons name="location-outline" size={18} color={colors.success} />
          <Animated.Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('listing.wizard.route.to', { defaultValue: 'To' })}
          </Animated.Text>
        </View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.arrivalCity || ''}
          onChangeText={(v) => updateData({ arrivalCity: v })}
          onFocus={() => setFocusedField('to')}
          onBlur={() => setTimeout(() => setFocusedField((f) => (f === 'to' ? null : f)), 200)}
          placeholder={t('listing.wizard.route.searchCity', { defaultValue: 'Search city...' })}
          placeholderTextColor={colors.textMuted}
          textAlign={isRTL ? 'right' : 'left'}
        />
        {toSuggestions.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(150)}
            style={[
              styles.suggestions,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {toSuggestions.map((city) => (
              <TouchableOpacity
                key={city.code}
                style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  updateData({ arrivalCity: city.name, arrivalCode: city.code });
                  setFocusedField(null);
                }}
              >
                <Text style={[styles.suggestionName, { color: colors.text }]}>
                  {isRTL ? city.nameAr : city.name}
                </Text>
                <Text style={[styles.suggestionCode, { color: colors.textMuted }]}>
                  {city.code}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
        <TextInput
          style={[
            styles.codeInput,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={data.arrivalCode || ''}
          onChangeText={(v) => updateData({ arrivalCode: v.toUpperCase() })}
          placeholder="JED"
          placeholderTextColor={colors.textMuted}
          maxLength={4}
          autoCapitalize="characters"
          textAlign="center"
        />
      </Animated.View>

      {/* Popular Routes */}
      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.popular}>
        <Animated.Text style={[styles.popularLabel, { color: colors.textSecondary }]}>
          {t('listing.wizard.route.popular', { defaultValue: 'Popular Routes:' })}
        </Animated.Text>
        <OptionChips options={POPULAR_ROUTES} selected={null} onSelect={handlePopularRoute} />
      </Animated.View>

      {/* Next */}
      {canAdvance && (
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.nextContainer}>
          <AnimatedButton
            title={t('wizard.next', { defaultValue: 'Next' })}
            onPress={goNext}
            size="lg"
            fullWidth
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  codeInput: {
    height: 40,
    width: 80,
    borderRadius: RADIUS.input,
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 1,
    letterSpacing: 1,
  },
  suggestions: {
    borderRadius: RADIUS.input,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '500',
  },
  suggestionCode: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  popular: {
    marginTop: 8,
    marginBottom: 24,
  },
  popularLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  nextContainer: {
    marginTop: 8,
  },
});
