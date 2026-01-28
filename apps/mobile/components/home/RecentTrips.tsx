import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';

interface Trip {
  id: string;
  from: string;
  fromAr: string;
  to: string;
  toAr: string;
  date: string;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered';
  itemCount: number;
}

const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    from: 'Riyadh',
    fromAr: 'الرياض',
    to: 'Cairo',
    toAr: 'القاهرة',
    date: '2026-02-15',
    status: 'confirmed',
    itemCount: 2,
  },
  {
    id: '2',
    from: 'Jeddah',
    fromAr: 'جدة',
    to: 'Dubai',
    toAr: 'دبي',
    date: '2026-02-20',
    status: 'pending',
    itemCount: 1,
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  confirmed: { bg: '#D1FAE5', text: '#059669' },
  in_transit: { bg: '#DBEAFE', text: '#2563EB' },
  delivered: { bg: '#E5E7EB', text: '#6B7280' },
};

export function RecentTrips() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  if (MOCK_TRIPS.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.recentTrips')}
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            {t('common.seeAll')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tripsList}>
        {MOCK_TRIPS.map((trip) => {
          const statusColor = statusColors[trip.status];
          return (
            <TouchableOpacity
              key={trip.id}
              style={[
                styles.tripCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.tripRoute}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.routeText, { color: colors.text }]}>
                    {isRTL ? trip.fromAr : trip.from}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
                  <Text style={[styles.routeText, { color: colors.text }]}>
                    {isRTL ? trip.toAr : trip.to}
                  </Text>
                </View>
              </View>

              <View style={styles.tripDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {trip.date}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {trip.itemCount} {t('home.items')}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor.bg },
                ]}
              >
                <Text style={[styles.statusText, { color: statusColor.text }]}>
                  {t(`status.${trip.status}`)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  tripsList: {
    gap: 12,
  },
  tripCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tripDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
