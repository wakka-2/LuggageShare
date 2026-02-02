import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/common';

interface EarningsData {
  thisMonth: number;
  pending: number;
  totalTrips: number;
}

interface BookingRequest {
  id: string;
  senderName: string;
  senderNameAr: string;
  itemDescription: string;
  weight: number;
  price: number;
  createdAt: string;
}

// Mock data - replace with API data
const EARNINGS: EarningsData = {
  thisMonth: 2450,
  pending: 580,
  totalTrips: 12,
};

const PENDING_REQUESTS: BookingRequest[] = [
  {
    id: '1',
    senderName: 'Sara Ahmed',
    senderNameAr: 'سارة أحمد',
    itemDescription: 'Electronics package',
    weight: 3,
    price: 150,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    senderName: 'Mohammed Ali',
    senderNameAr: 'محمد علي',
    itemDescription: 'Documents',
    weight: 0.5,
    price: 50,
    createdAt: '2024-01-15T09:15:00Z',
  },
];

export function CarrierDashboard() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      {/* Earnings Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('carrier.earnings')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/wallet')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              {t('common.seeAll')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.earningsCards}
        >
          {/* This Month */}
          <View style={[styles.earningsCard, { backgroundColor: colors.primary }]}>
            <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
            <Text style={styles.earningsLabel}>{t('carrier.thisMonth')}</Text>
            <Text style={styles.earningsValue}>
              {EARNINGS.thisMonth} {t('common.sar')}
            </Text>
          </View>

          {/* Pending */}
          <View style={[styles.earningsCard, { backgroundColor: colors.warning }]}>
            <Ionicons name="time-outline" size={24} color="#FFFFFF" />
            <Text style={styles.earningsLabel}>{t('carrier.pending')}</Text>
            <Text style={styles.earningsValue}>
              {EARNINGS.pending} {t('common.sar')}
            </Text>
          </View>

          {/* Total Trips */}
          <View style={[styles.earningsCard, { backgroundColor: colors.success }]}>
            <Ionicons name="airplane-outline" size={24} color="#FFFFFF" />
            <Text style={styles.earningsLabel}>{t('carrier.totalTrips')}</Text>
            <Text style={styles.earningsValue}>{EARNINGS.totalTrips}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('carrier.quickActions')}
        </Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/listing/create')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>{t('carrier.createListing')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => router.push('/(tabs)/trips')}
          >
            <Ionicons name="list-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              {t('carrier.myListings')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('carrier.pendingRequests')}
          </Text>
          {PENDING_REQUESTS.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeText}>{PENDING_REQUESTS.length}</Text>
            </View>
          )}
        </View>

        {PENDING_REQUESTS.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="file-tray-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('carrier.noRequests')}
            </Text>
          </Card>
        ) : (
          <View style={styles.requestsList}>
            {PENDING_REQUESTS.map((request) => (
              <TouchableOpacity
                key={request.id}
                style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/booking/${request.id}`)}
              >
                <View style={styles.requestHeader}>
                  <Text style={[styles.requestSender, { color: colors.text }]}>
                    {isRTL ? request.senderNameAr : request.senderName}
                  </Text>
                  <Text style={[styles.requestPrice, { color: colors.primary }]}>
                    {request.price} {t('common.sar')}
                  </Text>
                </View>
                <Text style={[styles.requestItem, { color: colors.textSecondary }]}>
                  {request.itemDescription} • {request.weight} {t('home.kg')}
                </Text>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.requestButton, { backgroundColor: colors.success }]}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.requestButtonText}>{t('carrier.accept')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.requestButton, { backgroundColor: colors.error }]}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                    <Text style={styles.requestButtonText}>{t('carrier.decline')}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  earningsCards: {
    gap: 12,
  },
  earningsCard: {
    width: 140,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  earningsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  earningsValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestSender: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  requestItem: {
    fontSize: 14,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  requestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
