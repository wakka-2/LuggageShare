import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS, BUBBLE_SHADOWS, themed } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { OptionChips, ChipOption } from '../OptionChips';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { CityPickerField } from '@/components/common/CityPickerField';
import type { StepProps } from '../WizardContainer';

const POPULAR_ROUTES: ChipOption[] = [
  { id: 'RUH-JED', label: 'searchBar.routeRuhJed' },
  { id: 'RUH-DXB', label: 'searchBar.routeRuhDxb' },
  { id: 'JED-CAI', label: 'searchBar.routeJedCai' },
  { id: 'RUH-AMM', label: 'searchBar.routeRuhAmm' },
];

const ROUTE_MAP: Record<string, { from: string; fromCode: string; to: string; toCode: string }> = {
  'RUH-JED': { from: 'Riyadh', fromCode: 'RUH', to: 'Jeddah', toCode: 'JED' },
  'RUH-DXB': { from: 'Riyadh', fromCode: 'RUH', to: 'Dubai', toCode: 'DXB' },
  'JED-CAI': { from: 'Jeddah', fromCode: 'JED', to: 'Cairo', toCode: 'CAI' },
  'RUH-AMM': { from: 'Riyadh', fromCode: 'RUH', to: 'Amman', toCode: 'AMM' },
};

export function RouteStep({ data, updateData, goNext }: StepProps) {
  const { t } = useTranslation();

  const sameCity =
    !!data.departureCity &&
    data.departureCity.trim().toLowerCase() === data.arrivalCity?.trim().toLowerCase();
  const canAdvance = !!data.departureCity?.trim() && !!data.arrivalCity?.trim() && !sameCity;
  const selectedRoute =
    data.departureCode && data.arrivalCode ? `${data.departureCode}-${data.arrivalCode}` : null;

  const handlePopularRoute = (id: string) => {
    const route = ROUTE_MAP[id];
    if (!route) return;
    updateData({
      departureCity: route.from,
      departureCode: route.fromCode,
      arrivalCity: route.to,
      arrivalCode: route.toCode,
    });
  };

  const swap = () =>
    updateData({
      departureCity: data.arrivalCity,
      departureCode: data.arrivalCode,
      arrivalCity: data.departureCity,
      arrivalCode: data.departureCode,
    });

  return (
    <View>
      <QuestionTitle emoji="✈️" title={t('listing.wizard.route.title')} />

      <Animated.View entering={FadeInUp.delay(150).springify()}>
        <CityPickerField
          label={t('listing.wizard.route.from')}
          dotColor={V2_COLORS.accent1}
          city={data.departureCity}
          code={data.departureCode}
          placeholder={t('cityPicker.selectDeparture')}
          onSelect={({ city, code }) => updateData({ departureCity: city, departureCode: code })}
        />

        <View style={styles.swapRow}>
          <View style={styles.swapLine} />
          <TouchableOpacity
            style={styles.swapBtn}
            onPress={swap}
            disabled={!data.departureCity && !data.arrivalCity}
            accessibilityRole="button"
            accessibilityLabel={t('searchBar.swapCities')}
          >
            <Ionicons name="swap-vertical" size={20} color={V2_COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.swapLine} />
        </View>

        <CityPickerField
          label={t('listing.wizard.route.to')}
          dotColor={V2_COLORS.secondary}
          city={data.arrivalCity}
          code={data.arrivalCode}
          placeholder={t('cityPicker.selectArrival')}
          onSelect={({ city, code }) => updateData({ arrivalCity: city, arrivalCode: code })}
        />
        {sameCity && <Text style={styles.error}>{t('cityPicker.sameCity')}</Text>}
      </Animated.View>

      {/* Popular Routes */}
      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.popular}>
        <Text style={styles.popularLabel}>{t('listing.wizard.route.popular')}</Text>
        <OptionChips
          options={POPULAR_ROUTES}
          selected={selectedRoute}
          onSelect={handlePopularRoute}
        />
      </Animated.View>

      <View style={styles.nextContainer}>
        <AnimatedButton
          disabled={!canAdvance}
          title={t('wizard.next')}
          onPress={goNext}
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    swapRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginVertical: 2,
    },
    swapLine: { flex: 1, height: 1, backgroundColor: V2_COLORS.border },
    swapBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: V2_COLORS.surface,
      ...BUBBLE_SHADOWS.xs,
    },
    error: { color: V2_COLORS.secondary, fontSize: 13, marginTop: 4 },
    popular: { marginTop: 20, marginBottom: 24 },
    popularLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: V2_COLORS.textSoft,
      marginBottom: 10,
      textAlign: 'left',
    },
    nextContainer: { marginTop: 8 },
  })
);
