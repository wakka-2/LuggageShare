import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { ThemeColors } from '@/providers/ThemeProvider';
import { useBookings, ApiBooking } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState, Avatar } from '@/components/common';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  picked_up: '#8B5CF6',
  in_transit: '#6366F1',
  delivered: '#10B981',
  rejected: '#EF4444',
  cancelled: '#6B7280',
};

const STATUS_LABELS: Record<string, { en: string; ar: string }> = {
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  accepted: { en: 'Accepted', ar: 'مقبول' },
  picked_up: { en: 'Picked Up', ar: 'تم الاستلام' },
  in_transit: { en: 'In Transit', ar: 'قيد الشحن' },
  delivered: { en: 'Delivered', ar: 'تم التوصيل' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
};

function BookingCard({ booking, isRTL, colors, onPress }: {
  booking: ApiBooking;
  isRTL: boolean;
  colors: ThemeColors;
  onPress: () => void;
}) {
  const statusColor = STATUS_COLORS[booking.status] || colors.textSecondary;
  const date = new Date(booking.listing.departureDate);
  const statusLabel = STATUS_LABELS[booking.status] || { en: booking.status, ar: booking.status };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.bookingCard, { backgroundColor: colors.card }]}>
        <View style={styles.bookingRoute}>
          <Text style={[styles.bookingCity, { color: colors.text }]}>{booking.listing.departureCity}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} style={{ marginHorizontal: 8 }} />
          <Text style={[styles.bookingCity, { color: colors.text }]}>{booking.listing.arrivalCity}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{isRTL ? statusLabel.ar : statusLabel.en}</Text>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="scale-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{Number(booking.totalWeight)} kg</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{Number(booking.totalPrice)} {booking.currency}</Text>
          </View>
        </View>

        <View style={[styles.bookingUser, { borderTopColor: colors.border }]}>
          <Avatar name={booking.carrier.name} avatarUrl={booking.carrier.avatarUrl} size={32} />
          <Text style={[styles.userName, { color: colors.text }]}>{booking.carrier.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TripsScreen() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const { data: bookings, isLoading, refetch } = useBookings();

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (activeFilter === 'all') return bookings;
    if (activeFilter === 'active') return bookings.filter(b => ['pending', 'accepted', 'picked_up', 'in_transit'].includes(b.status));
    if (activeFilter === 'completed') return bookings.filter(b => b.status === 'delivered');
    return bookings.filter(b => ['rejected', 'cancelled'].includes(b.status));
  }, [bookings, activeFilter]);

  const filters: { key: FilterTab; label: string; labelAr: string }[] = [
    { key: 'all', label: 'All', labelAr: 'الكل' },
    { key: 'active', label: 'Active', labelAr: 'نشط' },
    { key: 'completed', label: 'Done', labelAr: 'مكتمل' },
    { key: 'cancelled', label: 'Cancelled', labelAr: 'ملغي' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{isRTL ? 'رحلاتي' : 'My Trips'}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterBarContent}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            style={[styles.filterChip, { backgroundColor: activeFilter === f.key ? colors.primary : colors.card }]}
          >
            <Text style={[styles.filterChipText, { color: activeFilter === f.key ? '#FFF' : colors.textSecondary }]}>
              {isRTL ? f.labelAr : f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor={colors.primary} />}
      >
        {isLoading && (
          <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
        )}

        {!isLoading && filteredBookings.length === 0 && (
          <EmptyState
            lottieAnimation="search"
            title={isRTL ? 'لا توجد رحلات' : 'No trips yet'}
            description={isRTL ? 'ابدأ بإرسال أغراضك أو نشر إعلان كناقل' : 'Start by sending items or posting a listing as a carrier'}
            actionLabel={isRTL ? 'تصفح الإعلانات' : 'Browse Listings'}
            onAction={() => router.push('/(tabs)')}
            style={styles.emptyState}
          />
        )}

        {!isLoading && filteredBookings.map((booking, index) => (
          <Animated.View key={booking.id} entering={FadeInDown.delay(index * 50).duration(300)}>
            <BookingCard booking={booking} isRTL={isRTL} colors={colors} onPress={() => router.push(`/booking/${booking.id}`)} />
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  header: { padding: 16, borderBottomWidth: 1 } as ViewStyle,
  title: { fontSize: 24, fontWeight: 'bold' } as TextStyle,
  filterBar: { maxHeight: 56 } as ViewStyle,
  filterBarContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 } as ViewStyle,
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 } as ViewStyle,
  filterChipText: { fontSize: 14, fontWeight: '600' } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 32 } as ViewStyle,
  loading: { paddingVertical: 60, alignItems: 'center' } as ViewStyle,
  emptyState: { marginTop: 40 } as ViewStyle,
  bookingCard: { borderRadius: 16, padding: 16, marginBottom: 12 } as ViewStyle,
  bookingRoute: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 } as ViewStyle,
  bookingCity: { fontSize: 16, fontWeight: '700' } as TextStyle,
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6, marginBottom: 12 } as ViewStyle,
  statusDot: { width: 6, height: 6, borderRadius: 3 } as ViewStyle,
  statusText: { fontSize: 12, fontWeight: '600' } as TextStyle,
  bookingDetails: { flexDirection: 'row', gap: 16, marginBottom: 12 } as ViewStyle,
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 } as ViewStyle,
  detailText: { fontSize: 13 } as TextStyle,
  bookingUser: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1 } as ViewStyle,
  userName: { fontSize: 14, fontWeight: '500' } as TextStyle,
});
