import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useSubmitPaymentProof } from '@/hooks/useBookings';

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    bookingId: string;
    amount: string;
    currency: string;
    carrierName: string;
    carrierIban: string;
    carrierBankName: string;
  }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { pickAndUpload, isUploading, uploadedUrl } = useImageUpload();
  const submitProof = useSubmitPaymentProof();
  const [ibanCopied, setIbanCopied] = useState(false);

  const handleCopyIban = async () => {
    if (params.carrierIban) {
      await Clipboard.setStringAsync(params.carrierIban);
      setIbanCopied(true);
      setTimeout(() => setIbanCopied(false), 2000);
    }
  };

  const handleUploadProof = async () => {
    await pickAndUpload({ folder: 'proof', source: 'library' });
  };

  const handleConfirm = () => {
    if (!uploadedUrl) {
      Alert.alert(t('common.errorTitle'), t('payment.uploadFirst'));
      return;
    }

    submitProof.mutate(
      { bookingId: params.bookingId, proofImageUrl: uploadedUrl },
      {
        onSuccess: () => {
          Alert.alert(t('payment.successTitle'), t('payment.successMessage'), [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: () => {
          Alert.alert(
            t('common.errorTitle'),
            isRTL ? 'فشل تقديم إثبات الدفع' : 'Failed to submit payment proof'
          );
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('payment.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Amount Card */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.amountCard, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.amountLabel}>{t('payment.amount')}</Text>
          <Text style={styles.amountValue}>
            {params.amount} <Text style={styles.amountCurrency}>{params.currency || 'SAR'}</Text>
          </Text>
        </Animated.View>

        {/* Bank Details Card */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(100)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('payment.bankDetails')}</Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('payment.accountHolder')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{params.carrierName}</Text>
          </View>

          {params.carrierBankName && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('payment.bankName')}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {params.carrierBankName}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('payment.iban')}
            </Text>
            <Text style={[styles.ibanText, { color: colors.text }]} selectable>
              {params.carrierIban}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCopyIban}
            style={[styles.copyBtn, { borderColor: colors.primary }]}
          >
            <Ionicons
              name={ibanCopied ? 'checkmark-circle' : 'copy-outline'}
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.copyBtnText, { color: colors.primary }]}>
              {ibanCopied ? t('payment.ibanCopied') : t('payment.copyIban')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Open Bank App */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://www.alrajhibank.com.sa')}
            style={[
              styles.bankAppBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons name="open-outline" size={20} color={colors.primary} />
            <Text style={[styles.bankAppText, { color: colors.primary }]}>
              {t('payment.openBankApp')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Upload Proof */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(300)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('payment.uploadProof')}</Text>

          {uploadedUrl ? (
            <View style={styles.proofPreview}>
              <Image source={{ uri: uploadedUrl }} style={styles.proofImage} contentFit="cover" />
              <TouchableOpacity
                onPress={handleUploadProof}
                style={[styles.changeImageBtn, { borderColor: colors.primary }]}
              >
                <Text style={[styles.changeImageText, { color: colors.primary }]}>
                  {t('payment.changeImage')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleUploadProof}
              disabled={isUploading}
              style={[styles.uploadBtn, { borderColor: colors.primary + '40' }]}
            >
              {isUploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color={colors.primary} />
                  <Text style={[styles.uploadBtnText, { color: colors.primary }]}>
                    {t('payment.uploadProof')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!uploadedUrl || submitProof.isPending}
          style={[
            styles.confirmBtn,
            {
              backgroundColor: colors.primary,
              opacity: uploadedUrl && !submitProof.isPending ? 1 : 0.5,
            },
          ]}
        >
          {submitProof.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.confirmBtnText}>{t('payment.confirmPayment')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
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
  scrollContent: { padding: 16, paddingBottom: 40 } as ViewStyle,

  amountCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
  amountLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' } as TextStyle,
  amountValue: { color: '#FFF', fontSize: 36, fontWeight: '700', marginTop: 4 } as TextStyle,
  amountCurrency: { fontSize: 18, fontWeight: '500' } as TextStyle,

  card: { borderRadius: 16, padding: 20, marginBottom: 16 } as ViewStyle,
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 } as TextStyle,

  detailRow: { marginBottom: 14 } as ViewStyle,
  detailLabel: { fontSize: 13, fontWeight: '500', marginBottom: 4 } as TextStyle,
  detailValue: { fontSize: 16, fontWeight: '600' } as TextStyle,
  ibanText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 1,
  } as TextStyle,

  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
  } as ViewStyle,
  copyBtnText: { fontSize: 15, fontWeight: '600' } as TextStyle,

  bankAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  } as ViewStyle,
  bankAppText: { fontSize: 15, fontWeight: '600' } as TextStyle,

  divider: { height: 1, marginBottom: 16 } as ViewStyle,

  uploadBtn: {
    height: 140,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  } as ViewStyle,
  uploadBtnText: { fontSize: 15, fontWeight: '600' } as TextStyle,

  proofPreview: { gap: 12 } as ViewStyle,
  proofImage: { width: '100%', height: 200, borderRadius: 12 } as ImageStyle,
  changeImageBtn: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  changeImageText: { fontSize: 14, fontWeight: '600' } as TextStyle,

  confirmBtn: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  } as ViewStyle,
  confirmBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' } as TextStyle,
});
