import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/common';

interface Carrier {
  id: string;
  name: string;
  nameAr: string;
  avatarUrl?: string;
  rating: number;
  tripsCount: number;
  isVerified: boolean;
  nextTrip?: {
    from: string;
    fromAr: string;
    to: string;
    toAr: string;
  };
}

const TOP_CARRIERS: Carrier[] = [
  {
    id: '1',
    name: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الرشيد',
    rating: 4.8,
    tripsCount: 45,
    isVerified: true,
    nextTrip: {
      from: 'Riyadh',
      fromAr: 'الرياض',
      to: 'Cairo',
      toAr: 'القاهرة',
    },
  },
  {
    id: '2',
    name: 'Fatima Mohammed',
    nameAr: 'فاطمة محمد',
    rating: 4.9,
    tripsCount: 32,
    isVerified: true,
    nextTrip: {
      from: 'Jeddah',
      fromAr: 'جدة',
      to: 'Dubai',
      toAr: 'دبي',
    },
  },
  {
    id: '3',
    name: 'Omar Hassan',
    nameAr: 'عمر حسن',
    rating: 4.7,
    tripsCount: 28,
    isVerified: true,
    nextTrip: {
      from: 'Dammam',
      fromAr: 'الدمام',
      to: 'Bahrain',
      toAr: 'البحرين',
    },
  },
];

export function TopCarriers() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.topCarriers')}
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            {t('common.seeAll')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TOP_CARRIERS.map((carrier) => (
          <TouchableOpacity
            key={carrier.id}
            style={[
              styles.carrierCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.carrierHeader}>
              <Avatar
                name={isRTL ? carrier.nameAr : carrier.name}
                source={carrier.avatarUrl}
                size="medium"
                verified={carrier.isVerified}
              />
              <View style={styles.carrierInfo}>
                <Text style={[styles.carrierName, { color: colors.text }]} numberOfLines={1}>
                  {isRTL ? carrier.nameAr : carrier.name}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={[styles.ratingText, { color: colors.text }]}>
                    {carrier.rating}
                  </Text>
                  <Text style={[styles.tripsText, { color: colors.textSecondary }]}>
                    ({carrier.tripsCount} {t('home.trips')})
                  </Text>
                </View>
              </View>
            </View>

            {carrier.isVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <Text style={[styles.verifiedText, { color: colors.success }]}>
                  {t('home.verified')}
                </Text>
              </View>
            )}

            {carrier.nextTrip && (
              <View style={styles.nextTrip}>
                <Text style={[styles.nextTripLabel, { color: colors.textSecondary }]}>
                  {t('home.nextTrip')}:
                </Text>
                <View style={styles.routeRow}>
                  <Text style={[styles.routeText, { color: colors.primary }]}>
                    {isRTL ? carrier.nextTrip.fromAr : carrier.nextTrip.from}
                  </Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.textSecondary} />
                  <Text style={[styles.routeText, { color: colors.primary }]}>
                    {isRTL ? carrier.nextTrip.toAr : carrier.nextTrip.to}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  carrierCard: {
    width: 180,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  carrierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  carrierInfo: {
    flex: 1,
  },
  carrierName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tripsText: {
    fontSize: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  nextTrip: {
    marginTop: 4,
  },
  nextTripLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
