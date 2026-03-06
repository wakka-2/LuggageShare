import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  ZoomIn,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useListings } from '@/hooks/useListings';
import { mapApiListingToListing } from '@/lib/mappers';
import { HomeHeader } from '@/components/home';
import {
  EmptyState,
  BackgroundBlobs,
  StatBubble,
  SectionHeader,
  BubbleButton,
} from '@/components/common';
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
import {
  V2_COLORS,
  GRADIENTS,
  RADIUS,
  BUBBLE_SHADOWS,
  TYPOGRAPHY,
} from '@/providers/ThemeProvider';

type TabValue = ListingType | 'all';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;
  const isRTL = i18n.language === 'ar';

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real listings from API (server-side filtering for from/to/date)
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

  // Airplane spin for pull-to-refresh
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

  // Map API listings to the UI Listing type, fallback to mock data on error
  const allListings = useMemo(() => {
    if (apiListings && apiListings.length > 0) {
      return apiListings.map(mapApiListingToListing);
    }
    if (isError || (!isLoading && (!apiListings || apiListings.length === 0))) {
      return MOCK_LISTINGS;
    }
    return [];
  }, [apiListings, isLoading, isError]);

  // Client-side filtering by tab type (server doesn't know about offer/request yet)
  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      if (activeTab !== 'all' && listing.type !== activeTab) {
        return false;
      }
      return true;
    });
  }, [allListings, activeTab]);

  // Calculate counts for tabs
  const tabCounts = useMemo(
    () => ({
      all: allListings.length,
      offer: allListings.filter((l) => l.type === 'offer').length,
      request: allListings.filter((l) => l.type === 'request').length,
    }),
    [allListings]
  );

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

  const notificationCount = useUnreadCount();

  // Desktop web layout (sidebar + topbar handle navigation chrome)
  if (isWeb && isWideScreen) {
    return (
      <View style={[styles.container, { backgroundColor: V2_COLORS.bg }]}>
        <BackgroundBlobs variant="subtle" />
        <ScrollView
          contentContainerStyle={[styles.scrollContent, styles.scrollContentWide]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Card */}
          <Animated.View
            entering={FadeInDown.duration(500).springify()}
            style={styles.heroCardWide}
          >
            <LinearGradient
              colors={GRADIENTS.hero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroDecoCircle1} />
              <View style={styles.heroDecoCircle2} />
              <Text style={styles.heroLabel}>{t('home.welcomeTo')}</Text>
              <Text style={styles.heroTitle}>
                {t('home.appName')}
                <Text style={{ color: '#FFE5ED' }}>Share</Text>
              </Text>
              <Text style={styles.heroSubtitle}>{t('home.heroDescription')}</Text>
              <View style={styles.heroCTA}>
                <BubbleButton
                  label={t('home.sendPackage')}
                  icon="cube-outline"
                  variant="filled"
                  color="#FFFFFF"
                  textColor={V2_COLORS.primary}
                  onPress={() => router.push('/listing/create')}
                  size="md"
                />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Stats Row */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.statsRowWide}>
            <StatBubble
              value="2.5K+"
              label={t('home.travelers')}
              icon="people"
              color={V2_COLORS.primary}
            />
            <StatBubble
              value="15K+"
              label={t('home.deliveries')}
              icon="airplane"
              color={V2_COLORS.accent1}
            />
            <StatBubble
              value="4.8"
              label={t('home.rating')}
              icon="star"
              color={V2_COLORS.accent2}
            />
          </Animated.View>

          {/* Search Bar */}
          <Animated.View
            entering={FadeIn.delay(100).duration(400)}
            style={styles.searchContainerWide}
          >
            <SearchBar
              from={searchFrom}
              to={searchTo}
              date={searchDate}
              onFromChange={setSearchFrom}
              onToChange={setSearchTo}
              onDateChange={setSearchDate}
              onSwap={handleSwap}
            />
          </Animated.View>

          {/* Controls Row */}
          <Animated.View
            entering={FadeIn.delay(150).duration(400)}
            style={[styles.controlsRow, styles.controlsRowWide]}
          >
            <View style={styles.tabsWrapper}>
              <PostTypeTabs value={activeTab} onChange={setActiveTab} counts={tabCounts} />
            </View>
            <View style={styles.toggleWrapper}>
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </View>
          </Animated.View>

          {/* Results Header */}
          <Animated.View
            entering={FadeIn.delay(200).duration(400)}
            style={[styles.resultsHeader, styles.resultsHeaderWide]}
          >
            <SectionHeader title={t('home.availableListings')} />
            <Text style={styles.resultsCount}>
              {filteredListings.length} {t('home.listings')}
            </Text>
          </Animated.View>

          {/* Listings */}
          <Animated.View
            layout={Layout.springify()}
            style={[
              styles.listingsContainer,
              styles.listingsContainerWide,
              viewMode === 'grid' && styles.listingsGrid,
            ]}
          >
            {filteredListings.map((listing, index) => (
              <Animated.View
                key={listing.id}
                layout={Layout.springify()}
                style={viewMode === 'grid' ? styles.gridItem : undefined}
              >
                <ListingCard
                  listing={listing}
                  index={index}
                  viewMode={viewMode}
                  onPress={() => handleListingPress(listing.id)}
                />
              </Animated.View>
            ))}
            {filteredListings.length === 0 && (
              <EmptyState
                lottieAnimation="search"
                title={t('home.noListings')}
                description={t('home.noListingsDescription')}
                actionLabel={t('home.clearFilters')}
                onAction={() => {
                  setSearchFrom('');
                  setSearchTo('');
                  setSearchDate('');
                  setActiveTab('all');
                }}
                style={styles.emptyState}
              />
            )}
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // Mobile Layout
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackgroundBlobs variant="full" />
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
        {/* Airplane refresh indicator */}
        {refreshing && (
          <View style={styles.refreshIndicator}>
            <Animated.View style={airplaneAnimatedStyle}>
              <Ionicons name="airplane" size={28} color={V2_COLORS.primary} />
            </Animated.View>
          </View>
        )}

        {/* Hero Gradient Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.heroCardMobile}>
          <LinearGradient
            colors={GRADIENTS.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradientMobile}
          >
            <View style={styles.heroDecoCircle1} />
            <View style={styles.heroDecoCircle2} />
            <Text style={styles.heroTitleMobile}>{t('home.marketplace')}</Text>
            <Text style={styles.heroSubtitleMobile}>{t('home.heroDescription')}</Text>
            <View style={styles.heroCTA}>
              <BubbleButton
                label={t('home.sendPackage')}
                icon="cube-outline"
                variant="filled"
                color="#FFFFFF"
                textColor={V2_COLORS.primary}
                onPress={() => router.push('/listing/create')}
                size="sm"
              />
              <BubbleButton
                label={t('home.carryPackage')}
                icon="airplane-outline"
                variant="outline"
                color="#FFFFFF"
                onPress={() => router.push('/listing/create')}
                size="sm"
              />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.statsRow}>
          <StatBubble
            value="2.5K+"
            label={t('home.travelers')}
            icon="people"
            color={V2_COLORS.primary}
          />
          <StatBubble
            value="15K+"
            label={t('home.deliveries')}
            icon="airplane"
            color={V2_COLORS.accent1}
          />
          <StatBubble value="4.8" label={t('home.rating')} icon="star" color={V2_COLORS.accent2} />
        </Animated.View>

        {/* Search */}
        <Animated.View entering={FadeIn.delay(150).duration(400)} style={styles.sectionPadded}>
          <SectionHeader title={t('searchBar.whereAreYouSending')} />
          <SearchBar
            from={searchFrom}
            to={searchTo}
            date={searchDate}
            onFromChange={setSearchFrom}
            onToChange={setSearchTo}
            onDateChange={setSearchDate}
            onSwap={handleSwap}
          />
        </Animated.View>

        {/* Tabs */}
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.sectionPadded}>
          <PostTypeTabs value={activeTab} onChange={setActiveTab} counts={tabCounts} />
        </Animated.View>

        {/* View Toggle + Results */}
        <Animated.View entering={FadeIn.delay(250).duration(400)} style={styles.mobileControlsRow}>
          <Text style={styles.resultsCount}>
            {isLoading ? t('common.loading') : `${filteredListings.length} ${t('home.listings')}`}
          </Text>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </Animated.View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.mobileListings}>
            {[0, 1, 2].map((i) => (
              <Animated.View key={`skel-${i}`} entering={FadeIn.delay(i * 100).duration(300)}>
                <SkeletonCard />
              </Animated.View>
            ))}
          </View>
        )}

        {/* Listings */}
        {!isLoading && (
          <Animated.View layout={Layout.springify()} style={styles.mobileListings}>
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
            {filteredListings.length === 0 && (
              <EmptyState
                lottieAnimation="search"
                title={t('home.noListings')}
                description={t('home.noListingsDescriptionShort')}
                actionLabel={t('home.clearFilters')}
                onAction={() => {
                  setSearchFrom('');
                  setSearchTo('');
                  setSearchDate('');
                  setActiveTab('all');
                }}
                style={styles.emptyState}
              />
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View entering={ZoomIn.delay(400).springify()}>
        <TouchableOpacity
          onPress={() => router.push('/listing/create')}
          style={styles.fab}
          activeOpacity={0.85}
        >
          <LinearGradient colors={GRADIENTS.primaryHorizontal} style={styles.fabGradient}>
            <Ionicons name="add" size={28} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V2_COLORS.bg,
  } as ViewStyle,
  scrollContent: {
    paddingBottom: 32,
  } as ViewStyle,
  scrollContentWide: {
    paddingBottom: 48,
  } as ViewStyle,

  // Hero Card
  heroCardMobile: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: RADIUS.heroCard,
    overflow: 'hidden',
    ...BUBBLE_SHADOWS.lg,
  } as ViewStyle,
  heroCardWide: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 24,
    borderRadius: RADIUS.heroCard,
    overflow: 'hidden',
  } as ViewStyle,
  heroGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
  } as ViewStyle,
  heroGradientMobile: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'relative',
    overflow: 'hidden',
  } as ViewStyle,
  heroDecoCircle1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  } as ViewStyle,
  heroDecoCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  } as ViewStyle,
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  } as TextStyle,
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  } as TextStyle,
  heroTitleMobile: {
    ...TYPOGRAPHY.hero,
    color: '#FFFFFF',
    marginBottom: 6,
  } as TextStyle,
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
    maxWidth: 500,
    marginBottom: 20,
  } as TextStyle,
  heroSubtitleMobile: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  } as TextStyle,
  heroCTA: {
    flexDirection: 'row',
    gap: 10,
  } as ViewStyle,

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  } as ViewStyle,
  statsRowWide: {
    flexDirection: 'row',
    gap: 16,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 24,
  } as ViewStyle,

  // Search
  sectionPadded: {
    paddingHorizontal: 16,
  } as ViewStyle,
  searchContainerWide: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 20,
  } as ViewStyle,

  // Controls row
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  } as ViewStyle,
  controlsRowWide: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
  } as ViewStyle,
  tabsWrapper: {
    flex: 1,
  } as ViewStyle,
  toggleWrapper: {
    marginStart: 16,
    paddingTop: 4,
  } as ViewStyle,

  // Results header
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  resultsHeaderWide: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
  } as ViewStyle,
  resultsCount: {
    ...TYPOGRAPHY.caption,
    color: V2_COLORS.textSoft,
  } as TextStyle,

  // Listings container
  listingsContainer: {
    paddingHorizontal: 16,
  } as ViewStyle,
  listingsContainerWide: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
  } as ViewStyle,
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  } as ViewStyle,
  gridItem: {
    width: '48%',
    minWidth: 340,
  } as ViewStyle,

  // Empty state
  emptyState: {
    width: '100%',
    minHeight: 350,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  refreshIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  } as ViewStyle,

  // Mobile controls
  mobileControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  } as ViewStyle,
  mobileListings: {
    paddingHorizontal: 16,
  } as ViewStyle,

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    end: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...BUBBLE_SHADOWS.glow,
  } as ViewStyle,
  fabGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
});
