import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SHADOWS, TYPOGRAPHY, SPACING, SECTION_TINTS } from '@/providers/ThemeProvider';
import { useListings } from '@/hooks/useListings';
import { mapApiListingToListing } from '@/lib/mappers';
import { HomeHeader } from '@/components/home';
import { EmptyState, SolidCard } from '@/components/common';
import {
  ListingCard,
  ViewToggle,
  PostTypeTabs,
  SearchBar,
  MOCK_LISTINGS,
  ViewMode,
  ListingType,
} from '@/components/listings';
import { useUnreadCount } from '@/hooks/useNotifications';
import { SkeletonCard, StaggeredItem } from '@/components/animations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabValue = ListingType | 'all';

interface StatCardData {
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tint: string;
}

// ---------------------------------------------------------------------------
// Home Screen
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  // ── State ──────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // ── Data Fetching ──────────────────────────────────────
  const {
    data: apiListings,
    isLoading,
    isError,
    refetch,
  } = useListings({
    from: searchFrom || undefined,
    to: searchTo || undefined,
    date: searchDate || undefined,
  });

  // ── Pull-to-Refresh Airplane Animation ─────────────────
  const airplaneRotation = useSharedValue(0);
  const airplaneAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${airplaneRotation.value}deg` }],
  }));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    airplaneRotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
    await refetch();
    airplaneRotation.value = withTiming(0, { duration: 300 });
    setRefreshing(false);
  }, [refetch, airplaneRotation]);

  // ── Data Mapping (API -> UI, with mock fallback) ───────
  const allListings = useMemo(() => {
    if (apiListings && apiListings.length > 0) {
      return apiListings.map(mapApiListingToListing);
    }
    if (isError || (!isLoading && (!apiListings || apiListings.length === 0))) {
      return MOCK_LISTINGS;
    }
    return [];
  }, [apiListings, isLoading, isError]);

  // ── Client-Side Tab Filtering ──────────────────────────
  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      if (activeTab !== 'all' && listing.type !== activeTab) {
        return false;
      }
      return true;
    });
  }, [allListings, activeTab]);

  // ── Tab Counts ─────────────────────────────────────────
  const tabCounts = useMemo(
    () => ({
      all: allListings.length,
      offer: allListings.filter((l) => l.type === 'offer').length,
      request: allListings.filter((l) => l.type === 'request').length,
    }),
    [allListings]
  );

  // ── Handlers ───────────────────────────────────────────
  const handleSwap = useCallback(() => {
    const temp = searchFrom;
    setSearchFrom(searchTo);
    setSearchTo(temp);
  }, [searchFrom, searchTo]);

  const handleListingPress = useCallback(
    (listingId: string) => {
      router.push(`/listing/${listingId}`);
    },
    [router]
  );

  const handleClearFilters = useCallback(() => {
    setSearchFrom('');
    setSearchTo('');
    setSearchDate('');
    setActiveTab('all');
  }, []);

  const notificationCount = useUnreadCount();

  // ── Stat Cards (V2 — bold colors with tints) ──────────
  const statCards: StatCardData[] = [
    {
      value: '2.5K+',
      label: t('home.travelers', { defaultValue: 'Travelers' }),
      icon: 'people',
      color: colors.primary,
      tint: SECTION_TINTS.purple,
    },
    {
      value: '15K+',
      label: t('home.deliveries', { defaultValue: 'Deliveries' }),
      icon: 'cube',
      color: colors.success,
      tint: SECTION_TINTS.green,
    },
    {
      value: '4.8',
      label: t('home.rating', { defaultValue: 'Rating' }),
      icon: 'star',
      color: colors.warning,
      tint: SECTION_TINTS.amber,
    },
  ];

  const hasActiveFilters = searchFrom || searchTo || searchDate;

  // ── Render ─────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]} edges={['top']}>
      {/* ── Header ─────────────────────────────────────── */}
      <HomeHeader notificationCount={notificationCount} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={['transparent']}
            progressBackgroundColor="transparent"
          />
        }
      >
        {/* ── Airplane Refresh Indicator ──────────────── */}
        {refreshing && (
          <View style={styles.refreshIndicator}>
            <Animated.View style={airplaneAnimatedStyle}>
              <Ionicons name="airplane" size={28} color={colors.primary} />
            </Animated.View>
          </View>
        )}

        {/* ── Hero Section (V2 — clean white, bold text) ── */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.hero}>
          <Text style={[styles.heroLabel, { color: colors.textTertiary }]}>
            {t('home.welcomeTo', { defaultValue: 'Welcome to' })}
          </Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {t('home.discoverCarriers', { defaultValue: 'Discover' })}
            {'\n'}
            <Text style={{ color: colors.primary }}>
              {t('home.carriers', { defaultValue: 'Carriers' })}
            </Text>
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {t('home.heroDescription', {
              defaultValue: 'Connect with travelers to send or carry packages worldwide',
            })}
          </Text>
        </Animated.View>

        {/* ── Search Section (V2 — solid card, no glass) ─ */}
        <Animated.View entering={FadeIn.delay(80).duration(400)} style={styles.searchSection}>
          <SolidCard accentColor={colors.primary} style={styles.searchCard}>
            <SearchBar
              from={searchFrom}
              to={searchTo}
              date={searchDate}
              onFromChange={setSearchFrom}
              onToChange={setSearchTo}
              onDateChange={setSearchDate}
              onSwap={handleSwap}
            />
          </SolidCard>
        </Animated.View>

        {/* ── Quick Stats (V2 — solid tinted cards with 3D borders) ── */}
        <Animated.View entering={FadeInUp.delay(150).duration(400)} style={styles.statsRow}>
          {statCards.map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeInUp.delay(150 + index * 80)
                .duration(400)
                .springify()}
              style={styles.statCardWrapper}
            >
              <SolidCard
                accentColor={stat.color}
                tint={stat.tint}
                style={styles.statCard}
                radius={RADIUS.button}
              >
                <View style={[styles.statIconCircle, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon} size={18} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                  {stat.label}
                </Text>
              </SolidCard>
            </Animated.View>
          ))}
        </Animated.View>

        {/* ── Section Divider ────────────────────────────── */}
        <View style={[styles.sectionDivider, { backgroundColor: SECTION_TINTS.neutral }]}>
          <View style={styles.sectionDividerInner}>
            {/* ── Tabs + View Toggle Row ──────────────────── */}
            <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.controlsRow}>
              <View style={styles.tabsWrapper}>
                <PostTypeTabs value={activeTab} onChange={setActiveTab} counts={tabCounts} />
              </View>
              <View style={styles.toggleWrapper}>
                <ViewToggle value={viewMode} onChange={setViewMode} />
              </View>
            </Animated.View>

            {/* ── Results Count ───────────────────────────── */}
            <Animated.View entering={FadeIn.delay(250).duration(400)} style={styles.resultsRow}>
              <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                {isLoading
                  ? t('common.loading', { defaultValue: 'Loading...' })
                  : `${filteredListings.length} ${t('home.listings', { defaultValue: 'listings' })}`}
              </Text>
              {hasActiveFilters && (
                <View style={[styles.filteredPill, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.filteredBadge, { color: colors.primary }]}>
                    {t('home.filtered', { defaultValue: 'Filtered' })}
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>
        </View>

        {/* ── Loading State: Skeleton Cards ────────────── */}
        {isLoading && (
          <View style={styles.listingsContainer}>
            {[0, 1, 2].map((i) => (
              <Animated.View key={`skeleton-${i}`} entering={FadeIn.delay(i * 100).duration(300)}>
                <SkeletonCard />
              </Animated.View>
            ))}
          </View>
        )}

        {/* ── Listings ────────────────────────────────── */}
        {!isLoading && (
          <Animated.View layout={Layout.springify()} style={styles.listingsContainer}>
            {filteredListings.map((listing, index) => (
              <StaggeredItem key={listing.id} index={index} baseDelay={50}>
                <ListingCard
                  listing={listing}
                  index={index}
                  viewMode={viewMode}
                  onPress={() => handleListingPress(listing.id)}
                />
              </StaggeredItem>
            ))}

            {/* ── Empty State ──────────────────────────── */}
            {filteredListings.length === 0 && (
              <EmptyState
                lottieAnimation="search"
                title={t('home.noListings', {
                  defaultValue: 'No listings found',
                })}
                description={t('home.noListingsDescriptionShort', {
                  defaultValue: 'Try adjusting your search or filters',
                })}
                actionLabel={t('home.clearFilters', {
                  defaultValue: 'Clear Filters',
                })}
                onAction={handleClearFilters}
                style={styles.emptyState}
              />
            )}
          </Animated.View>
        )}

        {/* ── Bottom Spacer for Absolute Tab Bar ───────── */}
        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// V2 Styles — Solid, colorful, Duolingo-inspired
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // ── Layout ─────────────────────────────────────────────
  container: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    paddingBottom: SPACING[7], // 32
  } as ViewStyle,

  // ── Refresh ────────────────────────────────────────────
  refreshIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4], // 16
  } as ViewStyle,

  // ── Hero Section (V2 — clean white, no gradient) ──────
  hero: {
    paddingHorizontal: SPACING[5], // 20
    paddingTop: SPACING[2], // 8
    paddingBottom: SPACING[5], // 20
  } as ViewStyle,

  heroLabel: {
    ...TYPOGRAPHY.small,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING[1], // 4
    fontWeight: '700',
  } as TextStyle,

  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
    letterSpacing: -0.8,
    marginBottom: SPACING[2], // 8
  } as TextStyle,

  heroSubtitle: {
    ...TYPOGRAPHY.body,
    lineHeight: 22,
    maxWidth: 300,
  } as TextStyle,

  // ── Search Section (V2 — solid card) ──────────────────
  searchSection: {
    paddingHorizontal: SPACING[4], // 16
    marginBottom: SPACING[5], // 20
  } as ViewStyle,

  searchCard: {
    borderRadius: RADIUS.card, // 20
  } as ViewStyle,

  // ── Stats Row (V2 — solid tinted cards) ───────────────
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[4], // 16
    marginBottom: SPACING[5], // 20
    gap: SPACING[3], // 12
  } as ViewStyle,

  statCardWrapper: {
    flex: 1,
  } as ViewStyle,

  statCard: {
    alignItems: 'center',
    paddingVertical: SPACING[4], // 16
    paddingHorizontal: SPACING[2], // 8
  } as ViewStyle,

  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[2], // 8
  } as ViewStyle,

  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  } as TextStyle,

  statLabel: {
    ...TYPOGRAPHY.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,

  // ── Section Divider (V2 — soft tinted background) ─────
  sectionDivider: {
    marginBottom: SPACING[3], // 12
    paddingVertical: SPACING[4], // 16
  } as ViewStyle,

  sectionDividerInner: {
    paddingHorizontal: SPACING[4], // 16
  } as ViewStyle,

  // ── Controls Row (Tabs + View Toggle) ──────────────────
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING[2], // 8
  } as ViewStyle,

  tabsWrapper: {
    flex: 1,
  } as ViewStyle,

  toggleWrapper: {
    marginStart: SPACING[4], // 16
    paddingTop: SPACING[1], // 4
  } as ViewStyle,

  // ── Results Row ────────────────────────────────────────
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2], // 8
  } as ViewStyle,

  resultsCount: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  } as TextStyle,

  filteredPill: {
    paddingHorizontal: SPACING[2], // 8
    paddingVertical: 2,
    borderRadius: RADIUS.badge,
  } as ViewStyle,

  filteredBadge: {
    ...TYPOGRAPHY.micro,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,

  // ── Listings ───────────────────────────────────────────
  listingsContainer: {
    paddingHorizontal: SPACING[4], // 16
  } as ViewStyle,

  // ── Empty State ────────────────────────────────────────
  emptyState: {
    width: '100%',
    minHeight: 350,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // ── Tab Bar Spacer ─────────────────────────────────────
  tabBarSpacer: {
    height: 80,
  } as ViewStyle,
});
