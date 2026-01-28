import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';

interface Route {
  id: string;
  from: string;
  fromAr: string;
  to: string;
  toAr: string;
  price: number;
  carriers: number;
}

const POPULAR_ROUTES: Route[] = [
  {
    id: '1',
    from: 'Riyadh',
    fromAr: 'الرياض',
    to: 'Cairo',
    toAr: 'القاهرة',
    price: 150,
    carriers: 12,
  },
  {
    id: '2',
    from: 'Jeddah',
    fromAr: 'جدة',
    to: 'Dubai',
    toAr: 'دبي',
    price: 100,
    carriers: 8,
  },
  {
    id: '3',
    from: 'Riyadh',
    fromAr: 'الرياض',
    to: 'Amman',
    toAr: 'عمان',
    price: 120,
    carriers: 5,
  },
  {
    id: '4',
    from: 'Dammam',
    fromAr: 'الدمام',
    to: 'Bahrain',
    toAr: 'البحرين',
    price: 80,
    carriers: 15,
  },
];

export function PopularRoutes() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.popularRoutes')}
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
        {POPULAR_ROUTES.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={[
              styles.routeCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.routeHeader}>
              <Text style={[styles.routeFrom, { color: colors.text }]}>
                {isRTL ? route.fromAr : route.from}
              </Text>
              <Ionicons name="airplane" size={16} color={colors.primary} />
              <Text style={[styles.routeTo, { color: colors.text }]}>
                {isRTL ? route.toAr : route.to}
              </Text>
            </View>

            <View style={styles.routeInfo}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('home.startingFrom')}
                </Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>
                  {route.price} {t('common.sar')}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('home.availableCarriers')}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {route.carriers}
                </Text>
              </View>
            </View>
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
  routeCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  routeFrom: {
    fontSize: 14,
    fontWeight: '500',
  },
  routeTo: {
    fontSize: 14,
    fontWeight: '500',
  },
  routeInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
