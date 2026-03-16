import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Avatar, MetaChip } from '@/components/common';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, TYPOGRAPHY } from '@/providers/ThemeProvider';
import { Listing, ViewMode, ITEM_CATEGORIES } from './types';

interface ListingCardProps {
  listing: Listing;
  index: number;
  viewMode: ViewMode;
  onPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const ListingCard = React.memo(function ListingCard({
  listing,
  index,
  viewMode,
  onPress,
}: ListingCardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const isWeb = Platform.OS === 'web';
  const isOffer = listing.type === 'offer';

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('listingCard.today');
    if (diffDays === 1) return t('listingCard.tomorrow');
    if (diffDays < 7) return t('listingCard.inDays', { count: diffDays });

    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return t('listingCard.justNow');
    if (diffHours < 24) return t('listingCard.hoursAgo', { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    return t('listingCard.daysAgo', { count: diffDays });
  };

  // V2 color scheme
  const typeColor = isOffer ? V2_COLORS.primary : V2_COLORS.accent1;
  const originDotColor = V2_COLORS.accent1;
  const destDotColor = V2_COLORS.secondary;
  const typeLabel = isOffer ? t('listingCard.offer') : t('listingCard.request');

  const accessibilityLabel = `${typeLabel}: ${listing.from.code} to ${listing.to.code}, ${listing.pricing.small} SAR, by ${listing.user.name}`;

  // List View Layout - V2 Compact
  if (viewMode === 'list') {
    return (
      <AnimatedTouchable
        entering={FadeIn.delay(index * 30).duration(300)}
        style={[styles.listContainer, animatedStyle, isWeb && styles.listContainerWeb]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {/* Type dot */}
        <View style={[styles.listTypeDot, { backgroundColor: typeColor }]} />

        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle} numberOfLines={1}>
              {listing.title}
            </Text>
            <View style={styles.listPriceContainer}>
              <Text style={[styles.listPrice, { color: typeColor }]}>{listing.pricing.small}</Text>
              <Text style={styles.listPriceCurrency}>{t('common.sar')}</Text>
            </View>
          </View>

          <View style={styles.listMeta}>
            <View style={styles.listRoute}>
              <View style={[styles.routeDot, { backgroundColor: originDotColor }]} />
              <Text style={styles.listRouteText}>{listing.from.code}</Text>
              <Ionicons name="arrow-forward" size={12} color={V2_COLORS.textMuted} />
              <View style={[styles.routeDot, { backgroundColor: destDotColor }]} />
              <Text style={styles.listRouteText}>{listing.to.code}</Text>
            </View>
            <MetaChip icon="calendar-outline" label={formatDate(listing.travelDate)} />
          </View>

          <View style={styles.listFooter}>
            <View style={styles.listUserInfo}>
              <Avatar
                name={listing.user.name}
                source={listing.user.avatarUrl}
                size="tiny"
                verified={listing.user.isVerified}
              />
              <Text style={styles.listUserName} numberOfLines={1}>
                {listing.user.name}
              </Text>
            </View>
            <Text style={styles.listTime}>{formatTimeAgo(listing.createdAt)}</Text>
          </View>
        </View>
      </AnimatedTouchable>
    );
  }

  // Grid View Layout - V2 Bubble Card
  return (
    <AnimatedTouchable
      entering={FadeInDown.delay(index * 60)
        .duration(400)
        .springify()}
      style={[styles.gridContainer, animatedStyle, isWeb && styles.gridContainerWeb]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Type Badge + Views */}
      <View style={styles.headerContent}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '15' }]}>
          <Ionicons name={isOffer ? 'airplane' : 'cube'} size={14} color={typeColor} />
          <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
        </View>
        <View style={styles.viewsContainer}>
          <Ionicons name="eye-outline" size={14} color={V2_COLORS.textMuted} />
          <Text style={styles.viewsText}>{listing.views}</Text>
        </View>
      </View>

      {/* Route Display with colored dots */}
      <View style={styles.routeDisplay}>
        <View style={styles.routeCity}>
          <View style={[styles.routeDotLarge, { backgroundColor: originDotColor }]} />
          <View>
            <Text style={styles.routeCode}>{listing.from.code}</Text>
            <Text style={styles.routeCityName} numberOfLines={1}>
              {listing.from.city}
            </Text>
          </View>
        </View>
        <View style={styles.routeArrow}>
          <View style={styles.routeLine} />
          <Ionicons name="airplane" size={16} color={V2_COLORS.textMuted} />
          <View style={styles.routeLine} />
        </View>
        <View style={[styles.routeCity, styles.routeCityEnd]}>
          <View>
            <Text style={[styles.routeCode, { textAlign: 'right' }]}>{listing.to.code}</Text>
            <Text style={[styles.routeCityName, { textAlign: 'right' }]} numberOfLines={1}>
              {listing.to.city}
            </Text>
          </View>
          <View style={[styles.routeDotLarge, { backgroundColor: destDotColor }]} />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.gridTitle} numberOfLines={2}>
        {listing.title}
      </Text>

      {/* Meta Chips */}
      <View style={styles.metaRow}>
        <MetaChip
          icon="calendar"
          label={formatDate(listing.travelDate)}
          color={V2_COLORS.primary}
        />
        {(listing.availableWeight || listing.neededWeight) && (
          <MetaChip
            icon="scale"
            label={`${listing.availableWeight || listing.neededWeight} kg`}
            color={V2_COLORS.accent1}
          />
        )}
        {listing.pricing.negotiable && (
          <MetaChip
            icon="chatbubble-ellipses"
            label={t('listingCard.negotiate')}
            color={V2_COLORS.accent2}
          />
        )}
      </View>

      {/* Pricing + User Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.userSection}>
          <Avatar
            name={listing.user.name}
            source={listing.user.avatarUrl}
            size="small"
            verified={listing.user.isVerified}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {listing.user.name}
            </Text>
            <View style={styles.userStats}>
              <Ionicons name="star" size={12} color={V2_COLORS.accent2} />
              <Text style={styles.userRating}>{listing.user.rating}</Text>
            </View>
          </View>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.priceValue}>{listing.pricing.small}</Text>
          <Text style={styles.priceCurrency}>{t('common.sar')}</Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  // Grid View Styles — V2 Bubble Card
  gridContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    padding: 18,
    marginBottom: 16,
    ...BUBBLE_SHADOWS.lg,
  },
  gridContainerWeb: {
    ...(Platform.OS === 'web'
      ? ({ cursor: 'pointer', transition: 'transform 0.2s ease' } as any)
      : {}),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    gap: 5,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    color: V2_COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  routeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  routeCity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeCityEnd: {
    justifyContent: 'flex-end',
  },
  routeDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeCode: {
    ...TYPOGRAPHY.h1,
    color: V2_COLORS.text,
  },
  routeCityName: {
    ...TYPOGRAPHY.small,
    color: V2_COLORS.textSoft,
  },
  routeArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.8,
    paddingHorizontal: 4,
  },
  routeLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: V2_COLORS.textMuted + '40',
  },
  gridTitle: {
    ...TYPOGRAPHY.h3,
    color: V2_COLORS.text,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: V2_COLORS.cardShadow,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: V2_COLORS.text,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  userRating: {
    fontSize: 12,
    fontWeight: '600',
    color: V2_COLORS.textSoft,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: V2_COLORS.text,
    letterSpacing: -0.3,
  },
  priceCurrency: {
    fontSize: 12,
    fontWeight: '500',
    color: V2_COLORS.textSoft,
  },

  // List View Styles — V2
  listContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    marginBottom: 10,
    ...BUBBLE_SHADOWS.sm,
  },
  listContainerWeb: {
    ...(Platform.OS === 'web'
      ? ({ cursor: 'pointer', transition: 'transform 0.15s ease' } as any)
      : {}),
  },
  listTypeDot: {
    width: 4,
    borderTopLeftRadius: RADIUS.card,
    borderBottomLeftRadius: RADIUS.card,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listContent: {
    flex: 1,
    padding: 14,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: V2_COLORS.text,
    flex: 1,
    marginEnd: 12,
  },
  listPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  listPrice: {
    fontSize: 17,
    fontWeight: '700',
  },
  listPriceCurrency: {
    fontSize: 12,
    fontWeight: '500',
    color: V2_COLORS.textSoft,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listRouteText: {
    fontSize: 14,
    fontWeight: '700',
    color: V2_COLORS.text,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  listUserName: {
    fontSize: 13,
    color: V2_COLORS.textSoft,
    flex: 1,
  },
  listTime: {
    fontSize: 12,
    color: V2_COLORS.textMuted,
  },
});
