import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useWalletBalance, useTransactionHistory, Transaction } from '@/hooks/useWallet';

const TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; labelKey: string }> = {
  commission: { icon: 'trending-up-outline', color: '#10B981', labelKey: 'wallet.commission' },
  top_up: { icon: 'add-circle-outline', color: '#3B82F6', labelKey: 'wallet.topUpType' },
  refund: { icon: 'refresh-outline', color: '#F59E0B', labelKey: 'wallet.refund' },
};

export default function WalletScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance();
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useTransactionHistory();

  const isLoading = balanceLoading || historyLoading;
  const handleRefresh = () => { refetchBalance(); refetchHistory(); };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const config = TYPE_CONFIG[item.type] || { icon: 'ellipsis-horizontal', color: colors.textSecondary, labelKey: '' };
    const isPositive = Number(item.amount) > 0;

    return (
      <View style={[styles.txItem, { borderBottomColor: colors.border }]}>
        <View style={[styles.txIcon, { backgroundColor: config.color + '15' }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.txContent}>
          <Text style={[styles.txType, { color: colors.text }]}>{config.labelKey ? t(config.labelKey) : item.type}</Text>
          {item.description && (
            <Text style={[styles.txDesc, { color: colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>
          )}
          <Text style={[styles.txDate, { color: colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <Text style={[styles.txAmount, { color: isPositive ? '#10B981' : '#EF4444' }]}>
          {isPositive ? '+' : ''}{Number(item.amount).toFixed(2)} {balance?.currency || 'SAR'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('wallet.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={history || []}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            <>
              {/* Balance Card */}
              <Animated.View entering={FadeInDown.duration(300)} style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                <Text style={styles.balanceLabel}>{t('wallet.balance')}</Text>
                <Text style={styles.balanceValue}>
                  {balance?.balance?.toFixed(2) || '0.00'} <Text style={styles.balanceCurrency}>{balance?.currency || 'SAR'}</Text>
                </Text>
              </Animated.View>

              {/* History Header */}
              <View style={styles.historyHeader}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>
                  {t('wallet.transactions')}
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('wallet.noTransactions')}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                {t('wallet.noTransactionsDescription')}
              </Text>
            </Animated.View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  } as ViewStyle,
  headerBtn: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,

  balanceCard: {
    margin: 16, borderRadius: 20, padding: 28, alignItems: 'center',
  } as ViewStyle,
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500', marginBottom: 8 } as TextStyle,
  balanceValue: { color: '#FFF', fontSize: 36, fontWeight: '700' } as TextStyle,
  balanceCurrency: { fontSize: 18, fontWeight: '500' } as TextStyle,

  historyHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 } as ViewStyle,
  historyTitle: { fontSize: 18, fontWeight: '700' } as TextStyle,

  txItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1,
  } as ViewStyle,
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  txContent: { flex: 1 } as ViewStyle,
  txType: { fontSize: 15, fontWeight: '600' } as TextStyle,
  txDesc: { fontSize: 13, marginTop: 2 } as TextStyle,
  txDate: { fontSize: 12, marginTop: 2 } as TextStyle,
  txAmount: { fontSize: 16, fontWeight: '700' } as TextStyle,

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 } as ViewStyle,
  emptyTitle: { fontSize: 16, fontWeight: '600' } as TextStyle,
  emptyDesc: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 } as TextStyle,
});
