import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, useWindowDimensions, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { HomeHeader } from '@/components/home';
import { EmptyState } from '@/components/common';
import {
  ListingCard,
  ViewToggle,
  PostTypeTabs,
  SearchBar,
  MOCK_LISTINGS,
  ViewMode,
  ListingType,
} from '@/components/listings';

type TabValue = ListingType | 'all';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;
  const isRTL = i18n.language === 'ar';

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // Filter listings based on current filters
  const filteredListings = useMemo(() => {
    return MOCK_LISTINGS.filter((listing) => {
      // Filter by type
      if (activeTab !== 'all' && listing.type !== activeTab) {
        return false;
      }
      // Filter by from
      if (searchFrom && !listing.from.code.toLowerCase().includes(searchFrom.toLowerCase()) &&
          !listing.from.city.toLowerCase().includes(searchFrom.toLowerCase())) {
        return false;
      }
      // Filter by to
      if (searchTo && !listing.to.code.toLowerCase().includes(searchTo.toLowerCase()) &&
          !listing.to.city.toLowerCase().includes(searchTo.toLowerCase())) {
        return false;
      }
      // Filter by date
      if (searchDate) {
        const listingDate = listing.travelDate.split('T')[0];
        if (listingDate !== searchDate) {
          return false;
        }
      }
      return true;
    });
  }, [activeTab, searchFrom, searchTo, searchDate]);

  // Calculate counts for tabs
  const tabCounts = useMemo(() => ({
    all: MOCK_LISTINGS.length,
    offer: MOCK_LISTINGS.filter(l => l.type === 'offer').length,
    request: MOCK_LISTINGS.filter(l => l.type === 'request').length,
  }), []);

  const handleSwap = useCallback(() => {
    const temp = searchFrom;
    setSearchFrom(searchTo);
    setSearchTo(temp);
  }, [searchFrom, searchTo]);

  const notificationCount = 3;

  // Gradient colors for hero
  const heroGradient = isDark
    ? ['#1E293B', '#0F172A'] as const
    : ['#F0F9FF', '#E0F2FE'] as const;

  // Web Layout
  if (isWeb) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <HomeHeader notificationCount={notificationCount} />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, isWideScreen && styles.scrollContentWide]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section with Gradient */}
          <LinearGradient
            colors={heroGradient}
            style={styles.heroGradient}
          >
            <Animated.View
              entering={FadeInDown.duration(500).springify()}
              style={[styles.hero, isWideScreen && styles.heroWide]}
            >
              <View style={[styles.heroTextContainer, isRTL && styles.heroTextContainerRTL]}>
                <Text style={[styles.heroLabel, { color: colors.primary }, isRTL && styles.textRTL]}>
                  {isRTL ? 'مرحباً بك في' : 'Welcome to'}
                </Text>
                <Text style={[styles.heroTitle, { color: colors.text }, isRTL && styles.textRTL]}>
                  {isRTL ? 'سوق الشحن' : 'Luggage'}
                  {!isRTL && <Text style={{ color: colors.primary }}>Share</Text>}
                </Text>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }, isRTL && styles.textRTL]}>
                  {isRTL
                    ? 'أرسل أغراضك مع مسافرين موثوقين أو اكسب المال من المساحة الإضافية في حقيبتك'
                    : 'Send your items with trusted travelers or earn money from your extra luggage space'}
                </Text>
              </View>

              {/* Stats */}
              <Animated.View
                entering={FadeInUp.delay(200).duration(400)}
                style={[styles.statsRow, isRTL && styles.statsRowRTL]}
              >
                <View style={[styles.statItem, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>2.5K+</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }, isRTL && styles.textRTL]}>
                    {isRTL ? 'مسافر' : 'Travelers'}
                  </Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statValue, { color: colors.success }]}>15K+</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }, isRTL && styles.textRTL]}>
                    {isRTL ? 'شحنة' : 'Deliveries'}
                  </Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statValue, { color: colors.warning }]}>4.8</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }, isRTL && styles.textRTL]}>
                    {isRTL ? 'تقييم' : 'Rating'}
                  </Text>
                </View>
              </Animated.View>
            </Animated.View>
          </LinearGradient>

          {/* Search Bar */}
          <Animated.View
            entering={FadeIn.delay(100).duration(400)}
            style={[styles.searchContainer, isWideScreen && styles.searchContainerWide]}
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

          {/* Controls Row: Tabs + View Toggle */}
          <Animated.View
            entering={FadeIn.delay(150).duration(400)}
            style={[styles.controlsRow, isWideScreen && styles.controlsRowWide]}
          >
            <View style={styles.tabsWrapper}>
              <PostTypeTabs
                value={activeTab}
                onChange={setActiveTab}
                counts={tabCounts}
              />
            </View>
            <View style={styles.toggleWrapper}>
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </View>
          </Animated.View>

          {/* Results Header */}
          <Animated.View
            entering={FadeIn.delay(200).duration(400)}
            style={[
              styles.resultsHeader,
              isWideScreen && styles.resultsHeaderWide,
              isRTL && styles.resultsHeaderRTL,
            ]}
          >
            <Text style={[
              styles.resultsTitle,
              { color: colors.text },
              isRTL && styles.textRTL,
            ]}>
              {isRTL ? 'الإعلانات المتاحة' : 'Available Listings'}
            </Text>
            <Text style={[
              styles.resultsCount,
              { color: colors.textSecondary },
              isRTL && styles.textRTL,
            ]}>
              {filteredListings.length} {isRTL ? 'إعلان' : 'listings'}
              {(searchFrom || searchTo || searchDate) && (
                <Text style={{ color: colors.primary }}> • {isRTL ? 'مفلتر' : 'Filtered'}</Text>
              )}
            </Text>
          </Animated.View>

          {/* Listings Grid/List */}
          <Animated.View
            layout={Layout.springify()}
            style={[
              styles.listingsContainer,
              isWideScreen && styles.listingsContainerWide,
              viewMode === 'grid' && isWideScreen && styles.listingsGrid,
            ]}
          >
            {filteredListings.map((listing, index) => (
              <Animated.View
                key={listing.id}
                layout={Layout.springify()}
                style={viewMode === 'grid' && isWideScreen ? styles.gridItem : undefined}
              >
                <ListingCard
                  listing={listing}
                  index={index}
                  viewMode={viewMode}
                  onPress={() => console.log('Listing pressed:', listing.id)}
                />
              </Animated.View>
            ))}

            {filteredListings.length === 0 && (
              <EmptyState
                lottieAnimation="search"
                title={isRTL ? 'لا توجد نتائج' : 'No listings found'}
                description={isRTL
                  ? 'جرب تغيير معايير البحث أو تصفح جميع الإعلانات'
                  : 'Try adjusting your search filters or browse all listings'}
                actionLabel={isRTL ? 'مسح الفلاتر' : 'Clear filters'}
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
      </SafeAreaView>
    );
  }

  // Mobile Layout
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HomeHeader notificationCount={notificationCount} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mobile Hero */}
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.mobileHero, isRTL && styles.mobileHeroRTL]}>
          <Text style={[styles.greeting, { color: colors.textSecondary }, isRTL && styles.textRTL]}>
            {t('home.greeting')}
          </Text>
          <Text style={[styles.title, { color: colors.text }, isRTL && styles.textRTL]}>
            {isRTL ? 'سوق الشحن' : 'Marketplace'}
          </Text>
        </Animated.View>

        {/* Search */}
        <Animated.View entering={FadeIn.delay(100).duration(400)}>
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
        <Animated.View entering={FadeIn.delay(150).duration(400)}>
          <PostTypeTabs
            value={activeTab}
            onChange={setActiveTab}
            counts={tabCounts}
          />
        </Animated.View>

        {/* View Toggle + Results */}
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={[styles.mobileControlsRow, isRTL && styles.mobileControlsRowRTL]}>
          <Text style={[styles.resultsCount, { color: colors.textSecondary }, isRTL && styles.textRTL]}>
            {filteredListings.length} {isRTL ? 'إعلان' : 'listings'}
          </Text>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </Animated.View>

        {/* Listings */}
        <Animated.View layout={Layout.springify()} style={styles.mobileListings}>
          {filteredListings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              index={index}
              viewMode={viewMode}
              onPress={() => console.log('Listing pressed:', listing.id)}
            />
          ))}

          {filteredListings.length === 0 && (
            <EmptyState
              lottieAnimation="search"
              title={isRTL ? 'لا توجد نتائج' : 'No listings found'}
              description={isRTL
                ? 'جرب تغيير معايير البحث'
                : 'Try adjusting your search filters'}
              actionLabel={isRTL ? 'مسح الفلاتر' : 'Clear filters'}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    paddingBottom: 32,
  } as ViewStyle,
  scrollContentWide: {
    paddingBottom: 48,
  } as ViewStyle,

  // Hero Section
  heroGradient: {
    marginBottom: 24,
  } as ViewStyle,
  hero: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  } as ViewStyle,
  heroWide: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 48,
  } as ViewStyle,
  heroTextContainer: {
    marginBottom: 28,
  } as ViewStyle,
  heroTextContainerRTL: {
    alignItems: 'flex-end',
  } as ViewStyle,
  heroLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  } as TextStyle,
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -1,
  } as TextStyle,
  heroSubtitle: {
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 500,
  } as TextStyle,
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  } as ViewStyle,
  statsRowRTL: {
    flexDirection: 'row-reverse',
  } as ViewStyle,
  statItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 100,
  } as ViewStyle,
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  } as TextStyle,
  statLabel: {
    fontSize: 13,
  } as TextStyle,

  // Search styles
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  } as ViewStyle,
  searchContainerWide: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
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
    marginLeft: 16,
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
  resultsHeaderRTL: {
    flexDirection: 'row-reverse',
  } as ViewStyle,
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
  } as TextStyle,
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
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

  // Mobile styles
  mobileHero: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 20,
  } as ViewStyle,
  mobileHeroRTL: {
    alignItems: 'flex-end',
  } as ViewStyle,
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  } as TextStyle,
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  } as TextStyle,
  mobileControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  } as ViewStyle,
  mobileControlsRowRTL: {
    flexDirection: 'row-reverse',
  } as ViewStyle,
  mobileListings: {
    paddingHorizontal: 16,
  } as ViewStyle,
});
