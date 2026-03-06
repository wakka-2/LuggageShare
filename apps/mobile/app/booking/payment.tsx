import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import { LinearGradient } from 'expo-linear-gradient';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, GRADIENTS } from '@/providers/ThemeProvider';
import { BackgroundBlobs } from '@/components/common/BackgroundBlobs';
import { showAlert } from '@/lib/alert';
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
      showAlert(t('common.errorTitle'), t('payment.uploadFirst'));
      return;
    }

    submitProof.mutate(
      { bookingId: params.bookingId, proofImageUrl: uploadedUrl },
      {
        onSuccess: () => {
          showAlert(t('payment.successTitle'), t('payment.successMessage'), [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: () => {
          showAlert(t('common.errorTitle'), t('payment.proofFailed'));
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs variant="subtle" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={20}
            color={V2_COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('payment.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Amount Card */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <LinearGradient
            colors={[...GRADIENTS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.amountCard}
          >
            <Text style={styles.amountLabel}>{t('payment.amount')}</Text>
            <Text style={styles.amountValue}>
              {params.amount} <Text style={styles.amountCurrency}>{params.currency || 'SAR'}</Text>
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Bank Details Card */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)} style={styles.card}>
          <Text style={styles.cardTitle}>{t('payment.bankDetails')}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('payment.accountHolder')}</Text>
            <Text style={styles.detailValue}>{params.carrierName}</Text>
          </View>

          {params.carrierBankName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('payment.bankName')}</Text>
              <Text style={styles.detailValue}>{params.carrierBankName}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('payment.iban')}</Text>
            <Text style={styles.ibanText} selectable>
              {params.carrierIban}
            </Text>
          </View>

          <TouchableOpacity onPress={handleCopyIban} style={styles.copyBtn}>
            <Ionicons
              name={ibanCopied ? 'checkmark-circle' : 'copy-outline'}
              size={18}
              color={V2_COLORS.primary}
            />
            <Text style={styles.copyBtnText}>
              {ibanCopied ? t('payment.ibanCopied') : t('payment.copyIban')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Open Bank App */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://www.alrajhibank.com.sa')}
            style={styles.bankAppBtn}
          >
            <Ionicons name="open-outline" size={20} color={V2_COLORS.primary} />
            <Text style={styles.bankAppText}>{t('payment.openBankApp')}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Upload Proof */}
        <Animated.View entering={FadeInDown.duration(300).delay(300)} style={styles.card}>
          <Text style={styles.cardTitle}>{t('payment.uploadProof')}</Text>

          {uploadedUrl ? (
            <View style={styles.proofPreview}>
              <Image source={{ uri: uploadedUrl }} style={styles.proofImage} contentFit="cover" />
              <TouchableOpacity onPress={handleUploadProof} style={styles.changeImageBtn}>
                <Text style={styles.changeImageText}>{t('payment.changeImage')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleUploadProof}
              disabled={isUploading}
              style={styles.uploadBtn}
            >
              {isUploading ? (
                <ActivityIndicator color={V2_COLORS.primary} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color={V2_COLORS.primary} />
                  <Text style={styles.uploadBtnText}>{t('payment.uploadProof')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!uploadedUrl || submitProof.isPending}
          style={[styles.confirmBtn, { opacity: uploadedUrl && !submitProof.isPending ? 1 : 0.5 }]}
        >
          <LinearGradient
            colors={[...GRADIENTS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmGradient}
          >
            {submitProof.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.confirmBtnText}>{t('payment.confirmPayment')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  } as ViewStyle,
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '700', color: V2_COLORS.text } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 40 } as ViewStyle,

  amountCard: {
    borderRadius: RADIUS.heroCard,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
  amountLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' } as TextStyle,
  amountValue: { color: '#FFF', fontSize: 36, fontWeight: '700', marginTop: 4 } as TextStyle,
  amountCurrency: { fontSize: 18, fontWeight: '500' } as TextStyle,

  card: {
    borderRadius: RADIUS.card,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: V2_COLORS.text,
  } as TextStyle,

  detailRow: { marginBottom: 14 } as ViewStyle,
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    color: V2_COLORS.textSoft,
  } as TextStyle,
  detailValue: { fontSize: 16, fontWeight: '600', color: V2_COLORS.text } as TextStyle,
  ibanText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 1,
    color: V2_COLORS.text,
  } as TextStyle,

  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: RADIUS.pill,
    backgroundColor: V2_COLORS.primary + '10',
    marginTop: 4,
  } as ViewStyle,
  copyBtnText: { fontSize: 15, fontWeight: '600', color: V2_COLORS.primary } as TextStyle,

  bankAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  bankAppText: { fontSize: 15, fontWeight: '600', color: V2_COLORS.primary } as TextStyle,

  divider: { height: 1, marginBottom: 16, backgroundColor: V2_COLORS.cardShadow } as ViewStyle,

  uploadBtn: {
    height: 140,
    borderRadius: RADIUS.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: V2_COLORS.primary + '40',
    backgroundColor: V2_COLORS.primary + '08',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  } as ViewStyle,
  uploadBtnText: { fontSize: 15, fontWeight: '600', color: V2_COLORS.primary } as TextStyle,

  proofPreview: { gap: 12 } as ViewStyle,
  proofImage: { width: '100%', height: 200, borderRadius: RADIUS.card } as ImageStyle,
  changeImageBtn: {
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: V2_COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  changeImageText: { fontSize: 14, fontWeight: '600', color: V2_COLORS.primary } as TextStyle,

  confirmBtn: {
    marginTop: 8,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  } as ViewStyle,
  confirmGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
  } as ViewStyle,
  confirmBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' } as TextStyle,
});
