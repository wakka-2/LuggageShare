import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { Avatar } from '@/components/common';
import type { StepProps } from '../WizardContainer';

export function ReviewBookStep({ data, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
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
        <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.card}>
          <Text style={styles.cardLabel}>
            {t('booking.wizard.review.carrier', { defaultValue: 'Carrier:' })}
          </Text>
          <View style={styles.carrierRow}>
            <Avatar name={data.carrierName} size="small" verified={data.carrierVerified} />
            <View>
              <Text style={styles.carrierName}>{data.carrierName}</Text>
              <Text style={styles.routeText}>
                ✈️ {data.departureCity} → {data.arrivalCity}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Item Card */}
      <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.card}>
        <Text style={styles.cardLabel}>
          {t('booking.wizard.review.item', { defaultValue: 'Your item:' })}
        </Text>
        <View style={styles.itemRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="cube" size={16} color={V2_COLORS.primary} />
          </View>
          <Text style={styles.itemText}>{data.itemName || '—'}</Text>
        </View>
        <View style={styles.itemRow}>
          <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.accent2 + '15' }]}>
            <Ionicons name="scale" size={16} color={V2_COLORS.accent2} />
          </View>
          <Text style={styles.itemText}>{weight} kg</Text>
        </View>
        {data.pickupLocation && (
          <View style={styles.itemRow}>
            <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.accent1 + '15' }]}>
              <Ionicons name="location" size={16} color={V2_COLORS.accent1} />
            </View>
            <Text style={styles.itemText} numberOfLines={2}>
              {data.pickupLocation}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Price Breakdown */}
      <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.card}>
        <Text style={styles.cardLabel}>
          {t('booking.wizard.review.breakdown', { defaultValue: 'Price breakdown:' })}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {weight} kg × SAR {listingPrice}
          </Text>
          <Text style={styles.priceValue}>{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {t('booking.wizard.review.serviceFee', { defaultValue: 'Service fee' })}
          </Text>
          <Text style={styles.priceValue}>{serviceFee.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>
            {t('booking.wizard.review.total', { defaultValue: 'Total' })}
          </Text>
          <Text style={styles.totalValue}>SAR {total.toFixed(2)}</Text>
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
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    color: V2_COLORS.textSoft,
  },
  carrierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carrierName: {
    fontSize: 16,
    fontWeight: '600',
    color: V2_COLORS.text,
  },
  routeText: {
    fontSize: 13,
    marginTop: 2,
    color: V2_COLORS.textSoft,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: V2_COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: V2_COLORS.text,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: V2_COLORS.textSoft,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: V2_COLORS.text,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: V2_COLORS.cardShadow,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: V2_COLORS.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: V2_COLORS.primary,
  },
});
