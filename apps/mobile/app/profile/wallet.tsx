import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { SkeletonLoader } from '@/components/animations';
import { showAlert } from '@/lib/alert';
import {
  useWalletBalance,
  useTransactionHistory,
  useWithdrawal,
  Transaction,
} from '@/hooks/useWallet';

const TYPE_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string; labelKey: string }
> = {
  commission: { icon: 'trending-up-outline', color: '#10B981', labelKey: 'wallet.commission' },
  top_up: { icon: 'add-circle-outline', color: '#3B82F6', labelKey: 'wallet.topUpType' },
  refund: { icon: 'refresh-outline', color: '#F59E0B', labelKey: 'wallet.refund' },
  withdrawal: {
    icon: 'arrow-down-circle-outline',
    color: '#EF4444',
    labelKey: 'wallet.withdrawal',
  },
};

export default function WalletScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance();
  const {
    data: history,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useTransactionHistory();
  const withdrawalMutation = useWithdrawal();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [iban, setIban] = useState('');
  const [accountName, setAccountName] = useState('');

  const isLoading = balanceLoading || historyLoading;
  const handleRefresh = () => {
    refetchBalance();
    refetchHistory();
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 10) {
      showAlert(t('common.errorTitle'), t('wallet.minWithdrawal'));
      return;
    }
    if (!iban.trim() || !iban.startsWith('SA') || iban.length !== 24) {
      showAlert(t('common.errorTitle'), t('wallet.invalidIban'));
      return;
    }
    if (!accountName.trim()) {
      showAlert(t('common.errorTitle'), t('common.requiredFieldsError'));
      return;
    }

    withdrawalMutation.mutate(
      { amount, iban: iban.trim(), bankAccountName: accountName.trim() },
      {
        onSuccess: () => {
          setShowWithdrawModal(false);
          setWithdrawAmount('');
          setIban('');
          setAccountName('');
          showAlert(t('common.success'), t('wallet.withdrawalSubmitted'));
        },
        onError: () => {
          showAlert(t('common.errorTitle'), t('wallet.withdrawalFailed'));
        },
      }
    );
  };

  const renderTransaction = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => {
      const config = TYPE_CONFIG[item.type] || {
        icon: 'ellipsis-horizontal' as keyof typeof Ionicons.glyphMap,
        color: colors.textSecondary,
        labelKey: '',
      };
      const isPositive = Number(item.amount) > 0;

      return (
        <Animated.View
          entering={FadeInUp.delay(index * 50)
            .duration(300)
            .springify()}
        >
          <View style={[styles.txItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.txIcon, { backgroundColor: config.color + '15' }]}>
              <Ionicons name={config.icon} size={20} color={config.color} />
            </View>
            <View style={styles.txContent}>
              <Text style={[styles.txType, { color: colors.text }]}>
                {config.labelKey ? t(config.labelKey) : item.type}
              </Text>
              {item.description && (
                <Text style={[styles.txDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
              <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Text style={[styles.txAmount, { color: isPositive ? '#10B981' : '#EF4444' }]}>
              {isPositive ? '+' : ''}
              {Number(item.amount).toFixed(2)} {balance?.currency || 'SAR'}
            </Text>
          </View>
        </Animated.View>
      );
    },
    [colors, t, isRTL, balance?.currency]
  );

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
        <View style={styles.skeletonContainer}>
          <SkeletonLoader width="100%" height={160} borderRadius={20} style={{ margin: 16 }} />
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
            <SkeletonLoader width={140} height={20} borderRadius={8} />
          </View>
          {[0, 1, 2, 3].map((i) => (
            <Animated.View
              key={`skel-${i}`}
              entering={FadeIn.delay(i * 60).duration(200)}
              style={styles.skeletonTx}
            >
              <SkeletonLoader width={40} height={40} borderRadius={12} />
              <View style={{ flex: 1, gap: 6 }}>
                <SkeletonLoader width="60%" height={14} borderRadius={6} />
                <SkeletonLoader width="40%" height={12} borderRadius={6} />
              </View>
              <SkeletonLoader width={70} height={16} borderRadius={6} />
            </Animated.View>
          ))}
        </View>
      ) : (
        <FlatList
          data={history || []}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <>
              {/* Balance Card */}
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={[styles.balanceCard, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.balanceLabel}>{t('wallet.balance')}</Text>
                <Text style={styles.balanceValue}>
                  {balance?.balance?.toFixed(2) || '0.00'}{' '}
                  <Text style={styles.balanceCurrency}>{balance?.currency || 'SAR'}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.withdrawBtn}
                  onPress={() => setShowWithdrawModal(true)}
                >
                  <Ionicons name="arrow-down-circle-outline" size={18} color="#FFF" />
                  <Text style={styles.withdrawBtnText}>{t('wallet.withdraw')}</Text>
                </TouchableOpacity>
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

      {/* Withdrawal Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('wallet.withdraw')}
              </Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.fieldLabel,
                { color: colors.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('wallet.amountSar')}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              placeholder={t('wallet.minAmountPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />

            <Text
              style={[
                styles.fieldLabel,
                { color: colors.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('wallet.ibanNumber')}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              placeholder="SA0380000000608010167519"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              value={iban}
              onChangeText={setIban}
            />

            <Text
              style={[
                styles.fieldLabel,
                { color: colors.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('wallet.accountHolderName')}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              placeholder={t('wallet.accountHolderPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={accountName}
              onChangeText={setAccountName}
            />

            <TouchableOpacity
              style={[
                styles.submitWithdrawBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: withdrawalMutation.isPending ? 0.7 : 1,
                },
              ]}
              onPress={handleWithdraw}
              disabled={withdrawalMutation.isPending}
            >
              {withdrawalMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitWithdrawText}>{t('wallet.confirmWithdrawal')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  skeletonContainer: { flex: 1 } as ViewStyle,
  skeletonTx: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  } as ViewStyle,
  headerBtn: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,

  balanceCard: {
    margin: 16,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  } as ViewStyle,
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  } as TextStyle,
  balanceValue: { color: '#FFF', fontSize: 36, fontWeight: '700' } as TextStyle,
  balanceCurrency: { fontSize: 18, fontWeight: '500' } as TextStyle,
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  } as ViewStyle,
  withdrawBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' } as TextStyle,

  historyHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 } as ViewStyle,
  historyTitle: { fontSize: 18, fontWeight: '700' } as TextStyle,

  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  } as ViewStyle,
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  txContent: { flex: 1 } as ViewStyle,
  txType: { fontSize: 15, fontWeight: '600' } as TextStyle,
  txDesc: { fontSize: 13, marginTop: 2 } as TextStyle,
  txDate: { fontSize: 12, marginTop: 2 } as TextStyle,
  txAmount: { fontSize: 16, fontWeight: '700' } as TextStyle,

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 } as ViewStyle,
  emptyTitle: { fontSize: 16, fontWeight: '600' } as TextStyle,
  emptyDesc: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 } as TextStyle,

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,
  modalTitle: { fontSize: 20, fontWeight: '700' } as TextStyle,
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 } as TextStyle,
  modalInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
  } as TextStyle,
  submitWithdrawBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  } as ViewStyle,
  submitWithdrawText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
