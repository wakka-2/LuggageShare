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
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/common';
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
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';
  const isWeb = Platform.OS === 'web';
  const isOffer = listing.type === 'offer';

  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(elevation.value, [0, 1], [0.08, 0.2], Extrapolation.CLAMP),
    shadowRadius: interpolate(elevation.value, [0, 1], [8, 20], Extrapolation.CLAMP),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
    elevation.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    elevation.value = withTiming(0, { duration: 200 });
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

  // Color scheme based on type
  const typeColors = isOffer
    ? { primary: colors.primary, gradient: [colors.primary, colors.primaryDark] as const }
    : { primary: colors.success, gradient: ['#22C55E', '#16A34A'] as const };

  const typeLabel = isOffer ? t('listingCard.offer') : t('listingCard.request');

  // List View Layout - Compact and clean
  if (viewMode === 'list') {
    return (
      <AnimatedTouchable
        entering={FadeIn.delay(index * 30).duration(300)}
        style={[
          styles.listContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
          animatedStyle,
          isWeb && styles.listContainerWeb,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Type indicator bar */}
        <View style={[styles.listTypeBar, { backgroundColor: typeColors.primary }]} />

        {/* Main Content */}
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
              {isRTL ? listing.titleAr : listing.title}
            </Text>
            <View style={styles.listPriceContainer}>
              <Text style={[styles.listPrice, { color: typeColors.primary }]}>
                {listing.pricing.small}
              </Text>
              <Text style={[styles.listPriceCurrency, { color: colors.textSecondary }]}>
                {t('common.sar')}
              </Text>
            </View>
          </View>

          <View style={styles.listMeta}>
            <View style={styles.listRoute}>
              <Ionicons name="location" size={14} color={typeColors.primary} />
              <Text style={[styles.listRouteText, { color: colors.text }]}>
                {listing.from.code}
              </Text>
              <Ionicons name="arrow-forward" size={12} color={colors.textTertiary} />
              <Text style={[styles.listRouteText, { color: colors.text }]}>{listing.to.code}</Text>
            </View>
            <View style={styles.listDateContainer}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.listDate, { color: colors.textSecondary }]}>
                {formatDate(listing.travelDate)}
              </Text>
            </View>
          </View>

          <View style={styles.listFooter}>
            <View style={styles.listUserInfo}>
              <Avatar
                name={isRTL ? listing.user.nameAr : listing.user.name}
                source={listing.user.avatarUrl}
                size="tiny"
                verified={listing.user.isVerified}
              />
              <Text
                style={[styles.listUserName, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {isRTL ? listing.user.nameAr : listing.user.name}
              </Text>
              {listing.user.isVerified && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                </View>
              )}
            </View>
            <Text style={[styles.listTime, { color: colors.textTertiary }]}>
              {formatTimeAgo(listing.createdAt)}
            </Text>
          </View>
        </View>
      </AnimatedTouchable>
    );
  }

  // Grid View Layout - Rich and visually appealing
  return (
    <AnimatedTouchable
      entering={FadeInDown.delay(index * 60)
        .duration(400)
        .springify()}
      style={[
        styles.gridContainer,
        { backgroundColor: colors.card },
        animatedStyle,
        shadowStyle,
        isWeb && styles.gridContainerWeb,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {/* Gradient Header */}
      <View style={styles.gradientHeader}>
        <LinearGradient
          colors={typeColors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.typeBadge}>
              <Ionicons name={isOffer ? 'airplane' : 'cube'} size={16} color="#FFFFFF" />
              <Text style={styles.typeBadgeText}>{typeLabel}</Text>
            </View>
            <View style={styles.viewsContainer}>
              <Ionicons name="eye" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.viewsText}>{listing.views}</Text>
            </View>
          </View>

          {/* Route Display */}
          <View style={styles.routeDisplay}>
            <View style={styles.routeCity}>
              <Text style={styles.routeCode}>{listing.from.code}</Text>
              <Text style={styles.routeCityName} numberOfLines={1}>
                {isRTL ? listing.from.cityAr : listing.from.city}
              </Text>
            </View>
            <View style={styles.routeArrow}>
              <View style={styles.routeLine} />
              <View style={styles.planeIcon}>
                <Ionicons name="airplane" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.routeLine} />
            </View>
            <View style={[styles.routeCity, styles.routeCityEnd]}>
              <Text style={styles.routeCode}>{listing.to.code}</Text>
              <Text style={styles.routeCityName} numberOfLines={1}>
                {isRTL ? listing.to.cityAr : listing.to.city}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        {/* Title */}
        <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={2}>
          {isRTL ? listing.titleAr : listing.title}
        </Text>

        {/* Quick Info Pills */}
        <View style={styles.infoPills}>
          <View style={[styles.pill, { backgroundColor: colors.primary + '12' }]}>
            <Ionicons name="calendar" size={14} color={colors.primary} />
            <Text style={[styles.pillText, { color: colors.primary }]}>
              {formatDate(listing.travelDate)}
            </Text>
          </View>
          {(listing.availableWeight || listing.neededWeight) && (
            <View style={[styles.pill, { backgroundColor: colors.success + '12' }]}>
              <Ionicons name="scale" size={14} color={colors.success} />
              <Text style={[styles.pillText, { color: colors.success }]}>
                {listing.availableWeight || listing.neededWeight} kg
              </Text>
            </View>
          )}
        </View>

        {/* Item Restrictions */}
        <View style={styles.restrictionsSection}>
          <View style={styles.restrictionsRow}>
            {listing.restrictions.allowed.slice(0, 4).map((key) => {
              const category = ITEM_CATEGORIES.allowed.find((c) => c.key === key);
              if (!category) return null;
              return (
                <View
                  key={key}
                  style={[styles.restrictionIcon, { backgroundColor: colors.success + '10' }]}
                >
                  <Ionicons name={category.icon as any} size={14} color={colors.success} />
                </View>
              );
            })}
            {listing.restrictions.notAllowed.slice(0, 2).map((key) => {
              const category = ITEM_CATEGORIES.notAllowed.find((c) => c.key === key);
              if (!category) return null;
              return (
                <View
                  key={key}
                  style={[styles.restrictionIcon, { backgroundColor: colors.error + '10' }]}
                >
                  <Ionicons name={category.icon as any} size={14} color={colors.error} />
                </View>
              );
            })}
          </View>
        </View>

        {/* Pricing Section */}
        <View style={[styles.pricingSection, { borderColor: colors.border }]}>
          <View style={styles.priceMain}>
            <Text style={[styles.priceFrom, { color: colors.textSecondary }]}>
              {t('listingCard.starting')}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceValue, { color: colors.text }]}>
                {listing.pricing.small}
              </Text>
              <Text style={[styles.priceCurrency, { color: colors.textSecondary }]}>
                {t('common.sar')}
              </Text>
            </View>
          </View>
          {listing.pricing.negotiable && (
            <View style={[styles.negotiableBadge, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="chatbubble-ellipses" size={14} color={colors.warning} />
              <Text style={[styles.negotiableText, { color: colors.warning }]}>
                {t('listingCard.negotiate')}
              </Text>
            </View>
          )}
        </View>

        {/* Footer: User Info */}
        <View style={[styles.cardFooter, { borderColor: colors.border }]}>
          <View style={styles.userSection}>
            <Avatar
              name={isRTL ? listing.user.nameAr : listing.user.name}
              source={listing.user.avatarUrl}
              size="small"
              verified={listing.user.isVerified}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {isRTL ? listing.user.nameAr : listing.user.name}
              </Text>
              <View style={styles.userStats}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={[styles.userRating, { color: colors.textSecondary }]}>
                  {listing.user.rating}
                </Text>
                <Text style={[styles.userDeals, { color: colors.textTertiary }]}>
                  • {listing.user.completedDeals} {t('listingCard.deals')}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.actionHint}>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  // Grid View Styles
  gridContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  gridContainerWeb: {
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        } as any)
      : {}),
  },
  gradientHeader: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  routeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeCity: {
    flex: 1,
  },
  routeCityEnd: {
    alignItems: 'flex-end',
  },
  routeCode: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  routeCityName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  routeArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.2,
    paddingHorizontal: 8,
  },
  routeLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  planeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cardBody: {
    padding: 16,
  },
  gridTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 14,
  },
  infoPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  restrictionsSection: {
    marginBottom: 14,
  },
  restrictionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  restrictionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pricingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    marginBottom: 14,
  },
  priceMain: {},
  priceFrom: {
    fontSize: 12,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: {
    fontSize: 26,
    fontWeight: '700',
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '500',
  },
  negotiableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  negotiableText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  userRating: {
    fontSize: 13,
    fontWeight: '500',
  },
  userDeals: {
    fontSize: 12,
  },
  actionHint: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // List View Styles
  listContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  listContainerWeb: {
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        } as any)
      : {}),
  },
  listTypeBar: {
    width: 4,
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
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
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
    gap: 4,
  },
  listRouteText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listDate: {
    fontSize: 13,
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
    flex: 1,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTime: {
    fontSize: 12,
  },
});
