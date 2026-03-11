import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import {
  V2_COLORS,
  RADIUS,
  BUBBLE_SHADOWS,
  TYPOGRAPHY,
  GRADIENTS,
} from '@/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  Avatar,
  BackgroundBlobs,
  StatBubble,
  SectionHeader,
  IconButton,
} from '@/components/common';
import { SkeletonLoader } from '@/components/animations';
import { VerificationBadge, BadgeRow } from '@/components/trust';
import { ReviewCard } from '@/components/trust';
import { useUserReviews, ReviewWithBooking } from '@/hooks/useReviews';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: profile, isLoading, refetch } = useProfile();
  const { data: reviews } = useUserReviews(profile?.id ?? null);

  const menuItems = [
    {
      icon: 'person-outline' as const,
      label: t('profile.editProfile'),
      route: '/profile/edit',
      color: V2_COLORS.primary,
    },
    {
      icon: 'shield-checkmark-outline' as const,
      label: t('profile.verification'),
      route: '/profile/verification',
      color: V2_COLORS.accent1,
    },
    {
      icon: 'star-outline' as const,
      label: t('profile.myReviews', { defaultValue: 'My Reviews' }),
      route: '/profile/reviews',
      color: V2_COLORS.accent2,
    },
    {
      icon: 'wallet-outline' as const,
      label: t('profile.wallet'),
      route: '/profile/wallet',
      color: V2_COLORS.accent2,
    },
    {
      icon: 'notifications-outline' as const,
      label: t('profile.notifications'),
      route: '/notifications',
      color: V2_COLORS.accent3,
    },
    {
      icon: 'settings-outline' as const,
      label: t('profile.settings'),
      route: '/profile/settings',
      color: V2_COLORS.textSoft,
    },
    {
      icon: 'help-circle-outline' as const,
      label: t('profile.help'),
      route: '/profile/help',
      color: V2_COLORS.primary,
    },
  ];

  const stats = profile?.stats;

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs variant="subtle" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor={V2_COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.title')}</Text>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <View style={styles.userCard}>
              <SkeletonLoader width={72} height={72} borderRadius={36} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonLoader width="60%" height={20} borderRadius={RADIUS.pill} />
                <SkeletonLoader width="80%" height={14} borderRadius={RADIUS.pill} />
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Gradient Banner */}
            <View style={styles.bannerWrapper}>
              <LinearGradient
                colors={[...GRADIENTS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
              >
                <View style={styles.bannerCircle1} />
                <View style={styles.bannerCircle2} />
              </LinearGradient>
            </View>

            {/* Profile Card overlapping banner */}
            <Animated.View entering={FadeInDown.duration(300)} style={styles.userCard}>
              <Avatar
                name={profile?.name || '?'}
                avatarUrl={profile?.avatarUrl}
                size={72}
                isVerified={profile?.isVerified}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{profile?.name || t('profile.guest')}</Text>
                <Text style={styles.userEmail}>{profile?.email || ''}</Text>
                {profile?.city && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={V2_COLORS.textMuted} />
                    <Text style={styles.locationText}>{profile.city}</Text>
                  </View>
                )}
                {profile?.isVerified && (
                  <View style={{ marginTop: 6 }}>
                    <BadgeRow badges={['verified']} size="small" />
                  </View>
                )}
              </View>
              <IconButton
                icon="pencil-outline"
                onPress={() => router.push('/profile/edit')}
                accessibilityLabel={t('profile.editProfile')}
              />
            </Animated.View>

            {/* Stats Row */}
            {stats && (
              <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.statsRow}>
                <StatBubble
                  value={String(stats.totalTrips)}
                  label={t('profile.trips')}
                  icon="airplane"
                  color={V2_COLORS.primary}
                />
                <StatBubble
                  value={String(stats.totalDeliveries)}
                  label={t('profile.deliveries')}
                  icon="checkmark-done"
                  color={V2_COLORS.accent1}
                />
                <StatBubble
                  value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                  label={t('profile.rating')}
                  icon="star"
                  color={V2_COLORS.accent2}
                />
              </Animated.View>
            )}

            {/* Bio */}
            {profile?.bio && (
              <Animated.View entering={FadeIn.delay(150).duration(300)} style={styles.bioCard}>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </Animated.View>
            )}

            {/* Member Since */}
            {profile?.createdAt && (
              <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.memberSince}>
                <Ionicons name="calendar-outline" size={14} color={V2_COLORS.textMuted} />
                <Text style={styles.memberSinceText}>
                  {t('profile.memberSince')}
                  {new Date(profile.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </Animated.View>
            )}
          </>
        )}

        {/* Reviews Section */}
        {reviews && reviews.length > 0 && (
          <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.reviewsSection}>
            <SectionHeader title={t('profile.recentReviews')} />
            {reviews.slice(0, 3).map((review, index) => (
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

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={18}
                color={V2_COLORS.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={signOut}
          accessibilityRole="button"
          accessibilityLabel={t('profile.signOut')}
        >
          <Ionicons name="log-out-outline" size={20} color={V2_COLORS.secondary} />
          <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  loading: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  header: { padding: 16, paddingBottom: 8 } as ViewStyle,
  title: { ...TYPOGRAPHY.h1, color: V2_COLORS.text } as TextStyle,

  bannerWrapper: { marginHorizontal: 16, marginBottom: -30 } as ViewStyle,
  banner: {
    height: 100,
    borderRadius: RADIUS.heroCard,
    overflow: 'hidden',
  } as ViewStyle,
  bannerCircle1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -20,
    right: 20,
  } as ViewStyle,
  bannerCircle2: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -10,
    left: 30,
  } as ViewStyle,

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: RADIUS.card,
    gap: 14,
    ...BUBBLE_SHADOWS.lg,
  } as ViewStyle,
  userInfo: { flex: 1 } as ViewStyle,
  userName: { ...TYPOGRAPHY.h2, color: V2_COLORS.text } as TextStyle,
  userEmail: { fontSize: 13, color: V2_COLORS.textSoft, marginTop: 2 } as TextStyle,
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 } as ViewStyle,
  locationText: { fontSize: 12, color: V2_COLORS.textMuted } as TextStyle,

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  } as ViewStyle,

  bioCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: V2_COLORS.accent2 + '12',
    borderRadius: RADIUS.card,
  } as ViewStyle,
  bioText: { fontSize: 14, lineHeight: 21, color: V2_COLORS.text } as TextStyle,

  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginTop: 12,
  } as ViewStyle,
  memberSinceText: { fontSize: 12, color: V2_COLORS.textMuted } as TextStyle,

  reviewsSection: { marginTop: 24, marginHorizontal: 16 } as ViewStyle,

  menu: { marginTop: 24, marginHorizontal: 16, gap: 8 } as ViewStyle,
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS.card,
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 } as ViewStyle,
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  menuItemLabel: { ...TYPOGRAPHY.caption, fontWeight: '600', color: V2_COLORS.text } as TextStyle,

  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 40,
    padding: 16,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.secondary + '40',
    gap: 8,
  } as ViewStyle,
  signOutText: { fontSize: 15, fontWeight: '600', color: V2_COLORS.secondary } as TextStyle,
});
