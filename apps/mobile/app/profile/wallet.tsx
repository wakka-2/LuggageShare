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
import { LinearGradient } from 'expo-linear-gradient';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, GRADIENTS } from '@/providers/ThemeProvider';
import { SkeletonLoader } from '@/components/animations';
import { BackgroundBlobs } from '@/components/common';
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
  commission: {
    icon: 'trending-up-outline',
    color: V2_COLORS.accent1,
    labelKey: 'wallet.commission',
  },
  top_up: { icon: 'add-circle-outline', color: V2_COLORS.accent3, labelKey: 'wallet.topUpType' },
  refund: { icon: 'refresh-outline', color: V2_COLORS.accent2, labelKey: 'wallet.refund' },
  withdrawal: {
    icon: 'arrow-down-circle-outline',
    color: V2_COLORS.secondary,
    labelKey: 'wallet.withdrawal',
  },
};

export default function WalletScreen() {
  const { t, i18n } = useTranslation();
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
        color: V2_COLORS.textMuted,
        labelKey: '',
      };
      const isPositive = Number(item.amount) > 0;

      return (
        <Animated.View
          entering={FadeInUp.delay(index * 50)
            .duration(300)
            .springify()}
        >
          <View style={styles.txItem}>
            <View style={[styles.txIcon, { backgroundColor: config.color + '15' }]}>
              <Ionicons name={config.icon} size={20} color={config.color} />
            </View>
            <View style={styles.txContent}>
              <Text style={styles.txType}>{config.labelKey ? t(config.labelKey) : item.type}</Text>
              {item.description && (
                <Text style={styles.txDesc} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
              <Text style={styles.txDate}>
                {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                { color: isPositive ? V2_COLORS.accent1 : V2_COLORS.secondary },
              ]}
            >
              {isPositive ? '+' : ''}
              {Number(item.amount).toFixed(2)} {balance?.currency || 'SAR'}
            </Text>
          </View>
        </Animated.View>
      );
    },
    [t, isRTL, balance?.currency]
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={20}
            color={V2_COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('wallet.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <SkeletonLoader
            width="100%"
            height={160}
            borderRadius={RADIUS.heroCard}
            style={{ margin: 16 }}
          />
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
            <SkeletonLoader width={140} height={20} borderRadius={8} />
          </View>
          {[0, 1, 2, 3].map((i) => (
            <Animated.View
              key={`skel-${i}`}
              entering={FadeIn.delay(i * 60).duration(200)}
              style={styles.skeletonTx}
            >
              <SkeletonLoader width={44} height={44} borderRadius={22} />
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
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={V2_COLORS.primary}
            />
          }
          ListHeaderComponent={
            <>
              {/* Gradient Balance Card */}
              <Animated.View entering={FadeInDown.duration(300)}>
                <LinearGradient
                  colors={[...GRADIENTS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.balanceCard}
                >
                  {/* Decorative circles */}
                  <View style={[styles.decoCircle, styles.decoCircle1]} />
                  <View style={[styles.decoCircle, styles.decoCircle2]} />

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
                </LinearGradient>
              </Animated.View>

              {/* History Header */}
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>{t('wallet.transactions')}</Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color={V2_COLORS.textMuted} />
              <Text style={styles.emptyTitle}>{t('wallet.noTransactions')}</Text>
              <Text style={styles.emptyDesc}>{t('wallet.noTransactionsDescription')}</Text>
            </Animated.View>
          }
        />
      )}

      {/* Withdrawal Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('wallet.withdraw')}</Text>
              <TouchableOpacity
                onPress={() => setShowWithdrawModal(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={20} color={V2_COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('wallet.amountSar')}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t('wallet.minAmountPlaceholder')}
              placeholderTextColor={V2_COLORS.textMuted}
              keyboardType="decimal-pad"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              textAlign={isRTL ? 'right' : 'left'}
            />

            <Text style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('wallet.ibanNumber')}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="SA0380000000608010167519"
              placeholderTextColor={V2_COLORS.textMuted}
              autoCapitalize="characters"
              value={iban}
              onChangeText={setIban}
              textAlign={isRTL ? 'right' : 'left'}
            />

            <Text style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('wallet.accountHolderName')}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t('wallet.accountHolderPlaceholder')}
              placeholderTextColor={V2_COLORS.textMuted}
              value={accountName}
              onChangeText={setAccountName}
              textAlign={isRTL ? 'right' : 'left'}
            />

            <TouchableOpacity
              onPress={handleWithdraw}
              disabled={withdrawalMutation.isPending}
              style={{ opacity: withdrawalMutation.isPending ? 0.7 : 1 }}
            >
              <LinearGradient
                colors={[...GRADIENTS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitWithdrawBtn}
              >
                {withdrawalMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitWithdrawText}>{t('wallet.confirmWithdrawal')}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
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
    paddingVertical: 10,
  } as ViewStyle,
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: V2_COLORS.text,
  } as TextStyle,

  listContent: { padding: 16, gap: 10 } as ViewStyle,

  balanceCard: {
    borderRadius: RADIUS.heroCard,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  } as ViewStyle,
  decoCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  } as ViewStyle,
  decoCircle1: {
    width: 120,
    height: 120,
    top: -30,
    right: -20,
  } as ViewStyle,
  decoCircle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -10,
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
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
  } as ViewStyle,
  withdrawBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' } as TextStyle,

  historyHeader: { paddingTop: 8, paddingBottom: 4 } as ViewStyle,
  historyTitle: { fontSize: 18, fontWeight: '700', color: V2_COLORS.text } as TextStyle,

  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  txContent: { flex: 1 } as ViewStyle,
  txType: { fontSize: 15, fontWeight: '600', color: V2_COLORS.text } as TextStyle,
  txDesc: { fontSize: 13, marginTop: 2, color: V2_COLORS.textSoft } as TextStyle,
  txDate: { fontSize: 12, marginTop: 2, color: V2_COLORS.textMuted } as TextStyle,
  txAmount: { fontSize: 16, fontWeight: '700' } as TextStyle,

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 } as ViewStyle,
  emptyTitle: { fontSize: 16, fontWeight: '600', color: V2_COLORS.text } as TextStyle,
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    color: V2_COLORS.textMuted,
  } as TextStyle,

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  } as ViewStyle,
  modalContent: {
    borderTopLeftRadius: RADIUS.heroCard,
    borderTopRightRadius: RADIUS.heroCard,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: V2_COLORS.bg,
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,
  modalTitle: { fontSize: 20, fontWeight: '700', color: V2_COLORS.text } as TextStyle,
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: V2_COLORS.text,
    marginBottom: 6,
  } as TextStyle,
  modalInput: {
    height: 48,
    borderRadius: RADIUS.input,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: V2_COLORS.text,
    marginBottom: 16,
    ...BUBBLE_SHADOWS.xs,
  } as TextStyle,
  submitWithdrawBtn: {
    height: 52,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  } as ViewStyle,
  submitWithdrawText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
