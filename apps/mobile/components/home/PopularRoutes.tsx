import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { SectionHeader } from '@/components/common';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, TYPOGRAPHY } from '@/providers/ThemeProvider';

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
  const isRTL = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionHeader title={t('home.popularRoutes')} />
        <TouchableOpacity>
          <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {POPULAR_ROUTES.map((route) => (
          <TouchableOpacity key={route.id} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View style={[styles.routeDot, { backgroundColor: V2_COLORS.accent1 }]} />
              <Text style={styles.routeFrom}>{isRTL ? route.fromAr : route.from}</Text>
              <Ionicons name="airplane" size={14} color={V2_COLORS.textMuted} />
              <Text style={styles.routeTo}>{isRTL ? route.toAr : route.to}</Text>
              <View style={[styles.routeDot, { backgroundColor: V2_COLORS.secondary }]} />
            </View>

            <View style={styles.routeInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t('home.startingFrom')}</Text>
                <Text style={styles.infoValue}>
                  {route.price} {t('common.sar')}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t('home.availableCarriers')}</Text>
                <Text style={styles.carriersValue}>{route.carriers}</Text>
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
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: V2_COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  routeCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: RADIUS.card,
    ...BUBBLE_SHADOWS.md,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeFrom: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: V2_COLORS.text,
  },
  routeTo: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: V2_COLORS.text,
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
    color: V2_COLORS.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: V2_COLORS.primary,
  },
  carriersValue: {
    fontSize: 14,
    fontWeight: '700',
    color: V2_COLORS.text,
  },
});
