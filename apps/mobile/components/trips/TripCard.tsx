import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/common';

export interface Trip {
  id: string;
  carrier: {
    id: string;
    name: string;
    nameAr: string;
    avatarUrl?: string;
    rating: number;
    tripsCount: number;
    isVerified: boolean;
  };
  from: {
    city: string;
    cityAr: string;
    country: string;
    countryAr: string;
    code: string;
  };
  to: {
    city: string;
    cityAr: string;
    country: string;
    countryAr: string;
    code: string;
  };
  departureDate: string;
  arrivalDate: string;
  availableWeight: number;
  pricePerKg: number;
  flightNumber?: string;
}

interface TripCardProps {
  trip: Trip;
  index: number;
  onPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function TripCard({ trip, index, onPress }: TripCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';
  const isWeb = Platform.OS === 'web';

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AnimatedTouchable
      entering={FadeInUp.delay(index * 100).springify()}
      style={[
        styles.container,
        isWeb && styles.containerWeb,
        { backgroundColor: colors.card, borderColor: colors.border },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      {/* Route Header */}
      <View style={styles.routeSection}>
        <View style={styles.locationBlock}>
          <Text style={[styles.cityCode, { color: colors.primary }]}>
            {trip.from.code}
          </Text>
          <Text style={[styles.cityName, { color: colors.text }]} numberOfLines={1}>
            {isRTL ? trip.from.cityAr : trip.from.city}
          </Text>
        </View>

        <View style={styles.routeLine}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Ionicons name="airplane" size={20} color={colors.primary} />
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
        </View>

        <View style={[styles.locationBlock, styles.locationBlockEnd]}>
          <Text style={[styles.cityCode, { color: colors.success }]}>
            {trip.to.code}
          </Text>
          <Text style={[styles.cityName, { color: colors.text }]} numberOfLines={1}>
            {isRTL ? trip.to.cityAr : trip.to.city}
          </Text>
        </View>
      </View>

      {/* Date & Flight Info */}
      <View style={[styles.infoRow, { borderColor: colors.border }]}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {formatDate(trip.departureDate)}
          </Text>
        </View>
        {trip.flightNumber && (
          <View style={styles.infoItem}>
            <Ionicons name="airplane-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {trip.flightNumber}
            </Text>
          </View>
        )}
        <View style={styles.infoItem}>
          <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {trip.availableWeight} {t('home.kg')}
          </Text>
        </View>
      </View>

      {/* Carrier & Price */}
      <View style={styles.footer}>
        <View style={styles.carrierInfo}>
          <Avatar
            name={isRTL ? trip.carrier.nameAr : trip.carrier.name}
            source={trip.carrier.avatarUrl}
            size="small"
            verified={trip.carrier.isVerified}
          />
          <View style={styles.carrierDetails}>
            <Text style={[styles.carrierName, { color: colors.text }]} numberOfLines={1}>
              {isRTL ? trip.carrier.nameAr : trip.carrier.name}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {trip.carrier.rating} ({trip.carrier.tripsCount})
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.priceBlock}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
            {t('home.startingFrom')}
          </Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            {trip.pricePerKg} {t('common.sar')}
            <Text style={styles.priceUnit}>/{t('home.kg')}</Text>
          </Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  containerWeb: {
    // Web-specific cursor style
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationBlock: {
    flex: 1,
  },
  locationBlockEnd: {
    alignItems: 'flex-end',
  },
  cityCode: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  cityName: {
    fontSize: 13,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
    paddingHorizontal: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    flex: 1,
    height: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carrierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  carrierDetails: {
    flex: 1,
  },
  carrierName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
  },
});
