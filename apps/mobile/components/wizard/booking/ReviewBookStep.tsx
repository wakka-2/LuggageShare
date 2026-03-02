import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { Avatar } from '@/components/common';
import type { StepProps } from '../WizardContainer';

export function ReviewBookStep({ data, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const weight = parseFloat(data.weight) || 0;
  const listingPrice = data.listingPrice || 0;
  const subtotal = weight * listingPrice;
  const serviceFee = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + serviceFee;

  return (
    <View>
      <QuestionTitle
        emoji="✨"
        title={t('booking.wizard.review.title', { defaultValue: 'Review your booking' })}
      />

      {/* Carrier Card */}
      {data.carrierName && (
        <Animated.View
          entering={FadeInUp.delay(150).springify()}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('booking.wizard.review.carrier', { defaultValue: 'Carrier:' })}
          </Text>
          <View style={styles.carrierRow}>
            <Avatar name={data.carrierName} size="small" verified={data.carrierVerified} />
            <View>
              <Text style={[styles.carrierName, { color: colors.text }]}>{data.carrierName}</Text>
              <Text style={[styles.routeText, { color: colors.textSecondary }]}>
                ✈️ {data.departureCity} → {data.arrivalCity}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Item Card */}
      <Animated.View
        entering={FadeInUp.delay(250).springify()}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
          {t('booking.wizard.review.item', { defaultValue: 'Your item:' })}
        </Text>
        <View style={styles.itemRow}>
          <Ionicons name="cube" size={18} color={colors.primary} />
          <Text style={[styles.itemText, { color: colors.text }]}>{data.itemName || '—'}</Text>
        </View>
        <View style={styles.itemRow}>
          <Ionicons name="scale" size={18} color={colors.primary} />
          <Text style={[styles.itemText, { color: colors.text }]}>{weight} kg</Text>
        </View>
        {data.pickupLocation && (
          <View style={styles.itemRow}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={[styles.itemText, { color: colors.text }]} numberOfLines={2}>
              {data.pickupLocation}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Price Breakdown */}
      <Animated.View
        entering={FadeInUp.delay(350).springify()}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
          {t('booking.wizard.review.breakdown', { defaultValue: 'Price breakdown:' })}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
            {weight} kg × SAR {listingPrice}
          </Text>
          <Text style={[styles.priceValue, { color: colors.text }]}>{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
            {t('booking.wizard.review.serviceFee', { defaultValue: 'Service fee' })}
          </Text>
          <Text style={[styles.priceValue, { color: colors.text }]}>{serviceFee.toFixed(2)}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.priceRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>
            {t('booking.wizard.review.total', { defaultValue: 'Total' })}
          </Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>SAR {total.toFixed(2)}</Text>
        </View>
      </Animated.View>

      {/* Confirm */}
      <Animated.View entering={FadeInUp.delay(450).springify()}>
        <AnimatedButton
          title={`📦  ${t('wizard.confirm', { defaultValue: 'Confirm Booking' })}`}
          onPress={goNext}
          size="lg"
          fullWidth
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  carrierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carrierName: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeText: {
    fontSize: 13,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 15,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});
