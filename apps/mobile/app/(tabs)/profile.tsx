import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserReviews, ReviewWithBooking } from '@/hooks/useReviews';
import { SolidCard, Avatar } from '@/components/common';
import { SkeletonLoader } from '@/components/animations';
import { BadgeRow, ReviewCard } from '@/components/trust';
import { SPACING, RADIUS, TYPOGRAPHY, SECTION_TINTS } from '@/providers/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

// ---------------------------------------------------------------------------
// Animated pressable menu item (V2 — solid with colored icons)
// ---------------------------------------------------------------------------
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function PressableMenuItem({
  icon,
  label,
  onPress,
  iconBgColor,
  iconColor,
  textColor,
  chevronColor,
  isRTL,
  showBorder,
  borderColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  iconBgColor: string;
  iconColor: string;
  textColor: string;
  chevronColor: string;
  isRTL: boolean;
  showBorder: boolean;
  borderColor: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={[
        animatedStyle,
        styles.menuItem,
        showBorder && { borderBottomWidth: 1, borderBottomColor: borderColor },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconCircle, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon} size={SPACING[5]} color={iconColor} />
        </View>
        <Text style={[styles.menuItemLabel, { color: textColor }]}>{label}</Text>
      </View>
      <Ionicons
        name={isRTL ? 'chevron-back' : 'chevron-forward'}
        size={SPACING[5]}
        color={chevronColor}
      />
    </AnimatedTouchable>
  );
}

// ---------------------------------------------------------------------------
// Stat card (V2 — solid tinted background)
// ---------------------------------------------------------------------------
function StatCard({
  icon,
  value,
  label,
  valueColor,
  tint,
  index,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  valueColor: string;
  tint: string;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(100 + index * 80)
        .duration(400)
        .springify()}
      style={styles.statCardWrapper}
    >
      <SolidCard
        accentColor={valueColor}
        tint={tint}
        style={styles.statCard}
        radius={RADIUS.button}
      >
        <View style={[styles.statIconCircle, { backgroundColor: valueColor + '20' }]}>
          <Ionicons name={icon} size={20} color={valueColor} />
        </View>
        <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: '#4A4A68' }]}>{label}</Text>
      </SolidCard>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Main Profile Screen (V2)
// ---------------------------------------------------------------------------
export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: profile, isLoading, refetch } = useProfile();
  const { data: reviews } = useUserReviews(profile?.id ?? null);

  const stats = profile?.stats;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // ── Menu items (V2 — colored tints per item) ──────────
  const menuItems: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    route: string;
    tint: string;
    color: string;
  }[] = [
    {
      icon: 'person-outline',
      label: t('profile.editProfile'),
      route: '/profile/edit',
      tint: SECTION_TINTS.purple,
      color: '#6C63FF',
    },
    {
      icon: 'shield-checkmark-outline',
      label: t('profile.verification'),
      route: '/profile/verification',
      tint: SECTION_TINTS.blue,
      color: '#3B82F6',
    },
    {
      icon: 'wallet-outline',
      label: t('profile.wallet'),
      route: '/profile/wallet',
      tint: SECTION_TINTS.green,
      color: '#00C48C',
    },
    {
      icon: 'notifications-outline',
      label: t('profile.notifications'),
      route: '/notifications',
      tint: SECTION_TINTS.amber,
      color: '#FFB946',
    },
    {
      icon: 'settings-outline',
      label: t('profile.settings'),
      route: '/profile/settings',
      tint: SECTION_TINTS.neutral,
      color: '#7B7B9E',
    },
    {
      icon: 'help-circle-outline',
      label: t('profile.help'),
      route: '/profile/help',
      tint: SECTION_TINTS.blue,
      color: '#00B4D8',
    },
  ];

  // ── Loading skeleton ────────────────────────────────────
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <Animated.View entering={FadeIn.duration(300)}>
        <SolidCard accentColor={colors.primary} style={styles.profileCard}>
          <View style={styles.profileCardCenter}>
            <SkeletonLoader width={80} height={80} borderRadius={40} />
            <SkeletonLoader
              width={140}
              height={SPACING[6]}
              borderRadius={SPACING[1]}
              style={{ marginTop: SPACING[3] }}
            />
            <SkeletonLoader
              width={180}
              height={SPACING[4]}
              borderRadius={SPACING[1]}
              style={{ marginTop: SPACING[2] }}
            />
          </View>
        </SolidCard>
      </Animated.View>

      <View style={styles.statsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.statCardWrapper}>
            <SolidCard style={styles.statCard}>
              <SkeletonLoader width={SPACING[8]} height={SPACING[8]} borderRadius={SPACING[4]} />
              <SkeletonLoader
                width={SPACING[8]}
                height={SPACING[5]}
                borderRadius={SPACING[1]}
                style={{ marginTop: SPACING[2] }}
              />
            </SolidCard>
          </View>
        ))}
      </View>
    </View>
  );

  // ── Render ──────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* ── Header (V2 — gradient banner) ─────────────── */}
        <LinearGradient
          colors={['#6C63FF', '#4158D0'] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
            <TouchableOpacity
              onPress={() => router.push('/profile/settings')}
              style={styles.settingsButton}
              accessibilityRole="button"
              accessibilityLabel={t('profile.settings')}
            >
              <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {isLoading ? (
          renderSkeleton()
        ) : (
          <>
            {/* ── Profile Card (V2 — floating over gradient) ── */}
            <Animated.View
              entering={FadeInDown.duration(400).springify()}
              style={styles.sectionHorizontal}
            >
              <SolidCard accentColor={colors.primary} style={styles.profileCard}>
                <View style={styles.profileCardCenter}>
                  <Avatar
                    name={profile?.name || '?'}
                    avatarUrl={profile?.avatarUrl}
                    size={80}
                    isVerified={profile?.isVerified}
                  />

                  <Text style={[styles.profileName, { color: colors.text }]}>
                    {profile?.name || t('profile.guest')}
                  </Text>

                  <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                    {profile?.email || ''}
                  </Text>

                  {profile?.city && (
                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-outline"
                        size={SPACING[3]}
                        color={colors.textMuted}
                      />
                      <Text style={[styles.locationText, { color: colors.textMuted }]}>
                        {profile.city}
                      </Text>
                    </View>
                  )}

                  {profile?.isVerified && (
                    <View style={styles.badgeContainer}>
                      <BadgeRow badges={['verified']} size="small" />
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => router.push('/profile/edit')}
                    style={[styles.editProfileButton, { backgroundColor: colors.primary }]}
                    accessibilityRole="button"
                    accessibilityLabel={t('profile.editProfile')}
                  >
                    <Ionicons name="pencil-outline" size={SPACING[3]} color="#FFFFFF" />
                    <Text style={styles.editProfileText}>{t('profile.editProfile')}</Text>
                  </TouchableOpacity>
                </View>
              </SolidCard>
            </Animated.View>

            {/* ── Stats Row (V2 — tinted solid cards) ──────── */}
            {stats && (
              <View style={styles.statsRow}>
                <StatCard
                  icon="airplane"
                  value={String(stats.totalTrips)}
                  label={t('profile.trips')}
                  valueColor="#6C63FF"
                  tint={SECTION_TINTS.purple}
                  index={0}
                />
                <StatCard
                  icon="cube"
                  value={String(stats.totalDeliveries)}
                  label={t('profile.deliveries')}
                  valueColor="#00C48C"
                  tint={SECTION_TINTS.green}
                  index={1}
                />
                <StatCard
                  icon="star"
                  value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '--'}
                  label={
                    t('profile.rating') + (stats.totalReviews > 0 ? ` (${stats.totalReviews})` : '')
                  }
                  valueColor="#FFB946"
                  tint={SECTION_TINTS.amber}
                  index={2}
                />
              </View>
            )}

            {/* ── Bio ──────────────────────────────────────── */}
            {profile?.bio && (
              <Animated.View
                entering={FadeIn.delay(200).duration(350)}
                style={styles.sectionHorizontal}
              >
                <SolidCard accentColor="#6C63FF" tint={SECTION_TINTS.purple}>
                  <View style={styles.bioRow}>
                    <View style={[styles.bioIconCircle, { backgroundColor: '#6C63FF20' }]}>
                      <Ionicons name="chatbubble-ellipses" size={16} color="#6C63FF" />
                    </View>
                    <Text style={[styles.bioText, { color: colors.text }]}>{profile.bio}</Text>
                  </View>
                </SolidCard>
              </Animated.View>
            )}

            {/* ── Member Since ─────────────────────────────── */}
            {profile?.createdAt && (
              <Animated.View entering={FadeIn.delay(200).duration(350)} style={styles.memberSince}>
                <View style={[styles.memberSinceChip, { backgroundColor: SECTION_TINTS.neutral }]}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.memberSinceText, { color: colors.textMuted }]}>
                    {t('profile.memberSince')}{' '}
                    {new Date(profile.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* ── Reviews Section ──────────────────────────── */}
            {reviews && reviews.length > 0 && (
              <Animated.View
                entering={FadeIn.delay(250).duration(350)}
                style={styles.sectionHorizontal}
              >
                <View style={styles.reviewsHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('profile.recentReviews')}
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: SECTION_TINTS.amber }]}>
                    <Text style={[styles.countBadgeText, { color: '#FFB946' }]}>
                      {reviews.length}
                    </Text>
                  </View>
                </View>
                {reviews.slice(0, 3).map((review: ReviewWithBooking, index: number) => (
                  <ReviewCard
                    key={review.id}
                    review={{
                      id: review.id,
                      rating: review.rating,
                      comment: review.comment,
                      createdAt: review.createdAt,
                      reviewer: {
                        name: review.reviewer.name,
                        avatarUrl: review.reviewer.avatarUrl,
                      },
                    }}
                    index={index}
                  />
                ))}
              </Animated.View>
            )}

            {/* ── Menu Items (V2 — solid card, colored icons) ─ */}
            <Animated.View
              entering={FadeIn.delay(300).duration(350)}
              style={styles.sectionHorizontal}
            >
              <SolidCard noPadding>
                {menuItems.map((item, index) => (
                  <PressableMenuItem
                    key={item.route}
                    icon={item.icon}
                    label={item.label}
                    onPress={() => router.push(item.route as any)}
                    iconBgColor={item.tint}
                    iconColor={item.color}
                    textColor={colors.text}
                    chevronColor={colors.textMuted}
                    isRTL={isRTL}
                    showBorder={index < menuItems.length - 1}
                    borderColor={colors.borderSubtle}
                  />
                ))}
              </SolidCard>
            </Animated.View>

            {/* ── Sign Out (V2 — bold red pill) ──────────── */}
            <Animated.View
              entering={FadeIn.delay(350).duration(350)}
              style={styles.sectionHorizontal}
            >
              <TouchableOpacity
                onPress={signOut}
                style={[styles.signOutButton, { backgroundColor: SECTION_TINTS.pink }]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('profile.signOut')}
              >
                <Ionicons name="log-out-outline" size={22} color="#FF647C" />
                <Text style={[styles.signOutText, { color: '#FF647C' }]}>
                  {t('profile.signOut')}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        {/* Bottom spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles (V2 — solid, colorful, no glass)
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────
  container: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    paddingBottom: SPACING[2],
  } as ViewStyle,

  sectionHorizontal: {
    marginHorizontal: SPACING[4],
    marginTop: SPACING[4],
  } as ViewStyle,

  bottomSpacer: {
    height: 80,
  } as ViewStyle,

  // ── Header Gradient ───────────────────────────────────
  headerGradient: {
    paddingTop: SPACING[2],
    paddingBottom: SPACING[7],
    paddingHorizontal: SPACING[5],
  } as ViewStyle,

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,

  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
  } as TextStyle,

  settingsButton: {
    width: SPACING[8],
    height: SPACING[8],
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
  } as ViewStyle,

  // ── Profile Card ────────────────────────────────────────
  profileCard: {
    marginTop: -SPACING[5],
  } as ViewStyle,

  profileCardCenter: {
    alignItems: 'center',
    paddingVertical: SPACING[4],
  } as ViewStyle,

  profileName: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    marginTop: SPACING[3],
  } as TextStyle,

  profileEmail: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING[1],
  } as TextStyle,

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    marginTop: SPACING[2],
  } as ViewStyle,

  locationText: {
    ...TYPOGRAPHY.small,
  } as TextStyle,

  badgeContainer: {
    marginTop: SPACING[3],
  } as ViewStyle,

  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    marginTop: SPACING[4],
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[5],
    borderRadius: RADIUS.pill,
  } as ViewStyle,

  editProfileText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: '#FFFFFF',
  } as TextStyle,

  // ── Stats Row ───────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    paddingHorizontal: SPACING[4],
    marginTop: SPACING[4],
  } as ViewStyle,

  statCardWrapper: {
    flex: 1,
  } as ViewStyle,

  statCard: {
    alignItems: 'center',
    paddingVertical: SPACING[4],
  } as ViewStyle,

  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[2],
  } as ViewStyle,

  statValue: {
    ...TYPOGRAPHY.h3,
    fontWeight: '800',
  } as TextStyle,

  statLabel: {
    ...TYPOGRAPHY.micro,
    marginTop: SPACING[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,

  // ── Bio ─────────────────────────────────────────────────
  bioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[3],
  } as ViewStyle,

  bioIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  } as ViewStyle,

  bioText: {
    ...TYPOGRAPHY.body,
    flex: 1,
  } as TextStyle,

  // ── Member Since ────────────────────────────────────────
  memberSince: {
    paddingHorizontal: SPACING[4],
    marginTop: SPACING[4],
  } as ViewStyle,

  memberSinceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING[2],
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.pill,
  } as ViewStyle,

  memberSinceText: {
    ...TYPOGRAPHY.small,
  } as TextStyle,

  // ── Reviews ─────────────────────────────────────────────
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[3],
  } as ViewStyle,

  sectionTitle: {
    ...TYPOGRAPHY.h3,
  } as TextStyle,

  countBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[0],
    borderRadius: RADIUS.badge,
    minWidth: SPACING[6],
    alignItems: 'center',
  } as ViewStyle,

  countBadgeText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
  } as TextStyle,

  // ── Menu ────────────────────────────────────────────────
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
  } as ViewStyle,

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  } as ViewStyle,

  menuIconCircle: {
    width: SPACING[8],
    height: SPACING[8],
    borderRadius: SPACING[3],
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  menuItemLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  } as TextStyle,

  // ── Sign Out ────────────────────────────────────────────
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[2],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#FF647C30',
    borderBottomWidth: 3,
    borderBottomColor: '#FF647C',
  } as ViewStyle,

  signOutText: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
  } as TextStyle,

  // ── Skeleton ────────────────────────────────────────────
  skeletonContainer: {
    paddingTop: SPACING[2],
  } as ViewStyle,
});
