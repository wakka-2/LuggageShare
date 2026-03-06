import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTheme } from '@/hooks/useTheme';
import { useGoBack } from '@/hooks/useGoBack';
import { ScreenHeader } from '@/components/common';
import { apiClient } from '@/lib/api';
import { showAlert } from '@/lib/alert';
import { SkeletonLoader } from '@/components/animations';

const DOCUMENT_TYPES = [
  { key: 'national_id', icon: 'card-outline', labelKey: 'verification.nationalId' },
  { key: 'passport', icon: 'document-outline', labelKey: 'verification.passport' },
  { key: 'driving_license', icon: 'car-outline', labelKey: 'verification.drivingLicense' },
] as const;

export default function VerificationScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const goBack = useGoBack();
  const queryClient = useQueryClient();
  const isRTL = i18n.language === 'ar';

  const [selectedType, setSelectedType] = useState<string>('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [fullName, setFullName] = useState('');

  const { data: status, isLoading } = useQuery({
    queryKey: ['verification-status'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/me/verification');
      return data.data ?? data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/users/me/verify', {
        documentType: selectedType,
        documentNumber,
        ...(fullName && { fullName }),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showAlert(t('common.success'), t('verification.submitSuccess'));
    },
    onError: () => {
      showAlert(t('common.errorTitle'), t('verification.submitFailed'));
    },
  });

  const handleSubmit = () => {
    if (!selectedType || !documentNumber.trim()) {
      showAlert(t('common.errorTitle'), t('common.requiredFieldsError'));
      return;
    }
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerBtn} />
          <SkeletonLoader width={140} height={18} borderRadius={6} />
          <View style={styles.headerBtn} />
        </View>
        <View style={{ padding: 16, gap: 16 }}>
          <SkeletonLoader width="100%" height={60} borderRadius={12} />
          <SkeletonLoader width="60%" height={16} borderRadius={4} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SkeletonLoader width="31%" height={80} borderRadius={12} />
            <SkeletonLoader width="31%" height={80} borderRadius={12} />
            <SkeletonLoader width="31%" height={80} borderRadius={12} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Already verified
  if (status?.isVerified) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('profile.verification')} onBack={goBack} />
        <View style={styles.verifiedContent}>
          <Animated.View
            entering={ZoomIn.delay(100).springify()}
            style={[styles.verifiedIcon, { backgroundColor: '#10B98115' }]}
          >
            <Ionicons name="shield-checkmark" size={64} color="#10B981" />
          </Animated.View>
          <Animated.Text
            entering={FadeInUp.delay(200).duration(400)}
            style={[styles.verifiedTitle, { color: colors.text }]}
          >
            {t('verification.identityVerified')}
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(300).duration(400)}
            style={[styles.verifiedDesc, { color: colors.textSecondary }]}
          >
            {t('verification.verifiedDescription')}
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('profile.verification')} onBack={goBack} />

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        {/* Info Card */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          <Text
            style={[styles.infoText, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
          >
            {t('verification.infoMessage')}
          </Text>
        </Animated.View>

        {/* Document Type Selection */}
        <Animated.Text
          entering={FadeInUp.delay(100).duration(300)}
          style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
        >
          {t('verification.documentType')}
        </Animated.Text>
        <Animated.View entering={FadeInUp.delay(150).duration(300)} style={styles.typeGrid}>
          {DOCUMENT_TYPES.map((doc) => (
            <TouchableOpacity
              key={doc.key}
              style={[
                styles.typeCard,
                { borderColor: selectedType === doc.key ? colors.primary : colors.border },
                selectedType === doc.key && { backgroundColor: colors.primary + '10' },
              ]}
              onPress={() => setSelectedType(doc.key)}
            >
              <Ionicons
                name={doc.icon as keyof typeof Ionicons.glyphMap}
                size={28}
                color={selectedType === doc.key ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeLabel,
                  { color: selectedType === doc.key ? colors.primary : colors.text },
                ]}
              >
                {t(doc.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Document Number */}
        <Animated.Text
          entering={FadeInUp.delay(200).duration(300)}
          style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
        >
          {t('verification.documentNumber')}
        </Animated.Text>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.card,
              borderColor: colors.border,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          placeholder={t('verification.enterDocumentNumber')}
          placeholderTextColor={colors.textSecondary}
          value={documentNumber}
          onChangeText={setDocumentNumber}
          autoCapitalize="characters"
        />

        {/* Full Name (Optional) */}
        <Animated.Text
          entering={FadeInUp.delay(250).duration(300)}
          style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
        >
          {t('verification.fullNameOptional')}
        </Animated.Text>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.card,
              borderColor: colors.border,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          placeholder={t('verification.fullNamePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: colors.primary, opacity: submitMutation.isPending ? 0.7 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>{t('verification.submitRequest')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
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
  scrollContent: { flex: 1 } as ViewStyle,
  scrollInner: { padding: 16, paddingBottom: 40 } as ViewStyle,
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  } as ViewStyle,
  infoText: { flex: 1, fontSize: 14, lineHeight: 20 } as TextStyle,
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 10 } as TextStyle,
  typeGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 } as ViewStyle,
  typeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  } as ViewStyle,
  typeLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' } as TextStyle,
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 20,
  } as TextStyle,
  submitBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  } as ViewStyle,
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
  verifiedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  } as ViewStyle,
  verifiedIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  } as ViewStyle,
  verifiedTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  } as TextStyle,
  verifiedDesc: { fontSize: 15, lineHeight: 22, textAlign: 'center' } as TextStyle,
});
