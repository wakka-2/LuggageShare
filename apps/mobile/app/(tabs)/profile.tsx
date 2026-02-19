import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar } from '@/components/common';

export default function ProfileScreen() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: profile, isLoading, refetch } = useProfile();

  const menuItems = [
    { icon: 'person-outline' as const, label: isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile', route: '/profile/edit' },
    { icon: 'shield-checkmark-outline' as const, label: isRTL ? 'التحقق' : 'Verification', route: '/profile/verification' },
    { icon: 'wallet-outline' as const, label: isRTL ? 'المحفظة' : 'Wallet', route: '/profile/wallet' },
    { icon: 'notifications-outline' as const, label: isRTL ? 'الإشعارات' : 'Notifications', route: '/notifications' },
    { icon: 'settings-outline' as const, label: isRTL ? 'الإعدادات' : 'Settings', route: '/profile/settings' },
    { icon: 'help-circle-outline' as const, label: isRTL ? 'المساعدة' : 'Help & Support', route: '/profile/help' },
  ];

  const stats = profile?.stats;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {isRTL ? 'الملف الشخصي' : 'Profile'}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : (
          <>
            {/* User Card */}
            <Animated.View entering={FadeInDown.duration(300)} style={[styles.userCard, { backgroundColor: colors.card }]}>
              <Avatar
                name={profile?.name || '?'}
                avatarUrl={profile?.avatarUrl}
                size={72}
                isVerified={profile?.isVerified}
              />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {profile?.name || (isRTL ? 'زائر' : 'Guest')}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                  {profile?.email || ''}
                </Text>
                {profile?.city && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.locationText, { color: colors.textSecondary }]}>{profile.city}</Text>
                  </View>
                )}
                {profile?.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                    <Text style={[styles.verifiedText, { color: colors.primary }]}>
                      {isRTL ? 'موثق' : 'Verified'}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => router.push('/profile/edit')}
                style={[styles.editBtn, { borderColor: colors.border }]}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.text} />
              </TouchableOpacity>
            </Animated.View>

            {/* Stats Row */}
            {stats && (
              <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalTrips}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isRTL ? 'رحلات' : 'Trips'}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statValue, { color: colors.success || '#10B981' }]}>{stats.totalDeliveries}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isRTL ? 'توصيلات' : 'Deliveries'}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statValue, { color: colors.warning || '#F59E0B' }]}>
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {isRTL ? 'التقييم' : 'Rating'}
                    {stats.totalReviews > 0 ? ` (${stats.totalReviews})` : ''}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Bio */}
            {profile?.bio && (
              <Animated.View entering={FadeIn.delay(150).duration(300)} style={[styles.bioCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.bioText, { color: colors.text }]}>{profile.bio}</Text>
              </Animated.View>
            )}

            {/* Member Since */}
            {profile?.createdAt && (
              <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.memberSince}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.memberSinceText, { color: colors.textSecondary }]}>
                  {isRTL ? 'عضو منذ ' : 'Member since '}
                  {new Date(profile.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
                </Text>
              </Animated.View>
            )}
          </>
        )}

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: colors.primary + '12' }]}>
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemLabel, { color: colors.text }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#EF444410' }]}
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.signOutText}>{isRTL ? 'تسجيل الخروج' : 'Sign Out'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  loading: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  header: { padding: 16, paddingBottom: 8 } as ViewStyle,
  title: { fontSize: 24, fontWeight: '700' } as TextStyle,

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    gap: 16,
  } as ViewStyle,
  userInfo: { flex: 1 } as ViewStyle,
  userName: { fontSize: 20, fontWeight: '700' } as TextStyle,
  userEmail: { fontSize: 14, marginTop: 2 } as TextStyle,
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 } as ViewStyle,
  locationText: { fontSize: 13 } as TextStyle,
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 } as ViewStyle,
  verifiedText: { fontSize: 12, fontWeight: '600' } as TextStyle,
  editBtn: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  } as ViewStyle,

  statsRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, marginTop: 16,
  } as ViewStyle,
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 14,
  } as ViewStyle,
  statValue: { fontSize: 22, fontWeight: '700' } as TextStyle,
  statLabel: { fontSize: 12, marginTop: 4 } as TextStyle,

  bioCard: {
    marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 14,
  } as ViewStyle,
  bioText: { fontSize: 14, lineHeight: 21 } as TextStyle,

  memberSince: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, marginTop: 12,
  } as ViewStyle,
  memberSinceText: { fontSize: 13 } as TextStyle,

  menu: { marginTop: 24, marginHorizontal: 16 } as ViewStyle,
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1,
  } as ViewStyle,
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 } as ViewStyle,
  menuIconBox: {
    width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  } as ViewStyle,
  menuItemLabel: { fontSize: 15, fontWeight: '500' } as TextStyle,

  signOutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 24, marginBottom: 40,
    padding: 16, borderRadius: 12, gap: 8,
  } as ViewStyle,
  signOutText: { fontSize: 16, fontWeight: '600', color: '#EF4444' } as TextStyle,
});
