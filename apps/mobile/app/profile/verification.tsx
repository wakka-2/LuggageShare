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
import { LinearGradient } from 'expo-linear-gradient';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, GRADIENTS } from '@/providers/ThemeProvider';
import { BackgroundBlobs } from '@/components/common';
import { apiClient } from '@/lib/api';
import { showAlert } from '@/lib/alert';
import { SkeletonLoader } from '@/components/animations';

const DOCUMENT_TYPES = [
  {
    key: 'national_id',
    icon: 'card-outline',
    labelKey: 'verification.nationalId',
    color: V2_COLORS.primary,
  },
  {
    key: 'passport',
    icon: 'document-outline',
    labelKey: 'verification.passport',
    color: V2_COLORS.accent3,
  },
  {
    key: 'driving_license',
    icon: 'car-outline',
    labelKey: 'verification.drivingLicense',
    color: V2_COLORS.accent2,
  },
] as const;

export default function VerificationScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.backBtn} />
          <SkeletonLoader width={140} height={18} borderRadius={6} />
          <View style={styles.backBtn} />
        </View>
        <View style={{ padding: 16, gap: 16 }}>
          <SkeletonLoader width="100%" height={60} borderRadius={RADIUS.card} />
          <SkeletonLoader width="60%" height={16} borderRadius={4} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SkeletonLoader width="31%" height={80} borderRadius={RADIUS.card} />
            <SkeletonLoader width="31%" height={80} borderRadius={RADIUS.card} />
            <SkeletonLoader width="31%" height={80} borderRadius={RADIUS.card} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Already verified
  if (status?.isVerified) {
    return (
      <SafeAreaView style={styles.container}>
        <BackgroundBlobs />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons
              name={isRTL ? 'arrow-forward' : 'arrow-back'}
              size={20}
              color={V2_COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.verification')}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.verifiedContent}>
          <Animated.View entering={ZoomIn.delay(100).springify()} style={styles.verifiedIcon}>
            <Ionicons name="shield-checkmark" size={64} color={V2_COLORS.accent1} />
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(200).duration(400)} style={styles.verifiedTitle}>
            {t('verification.identityVerified')}
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(300).duration(400)} style={styles.verifiedDesc}>
            {t('verification.verifiedDescription')}
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={20}
            color={V2_COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.verification')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        {/* Info Card */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle-outline" size={22} color={V2_COLORS.primary} />
          </View>
          <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('verification.infoMessage')}
          </Text>
        </Animated.View>

        {/* Document Type Selection */}
        <Animated.Text
          entering={FadeInUp.delay(100).duration(300)}
          style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}
        >
          {t('verification.documentType')}
        </Animated.Text>
        <Animated.View entering={FadeInUp.delay(150).duration(300)} style={styles.typeGrid}>
          {DOCUMENT_TYPES.map((doc) => (
            <TouchableOpacity
              key={doc.key}
              style={[styles.typeCard, selectedType === doc.key && styles.typeCardSelected]}
              onPress={() => setSelectedType(doc.key)}
            >
              <View
                style={[
                  styles.typeIcon,
                  {
                    backgroundColor:
                      (selectedType === doc.key ? doc.color : V2_COLORS.textMuted) + '15',
                  },
                ]}
              >
                <Ionicons
                  name={doc.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={selectedType === doc.key ? doc.color : V2_COLORS.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.typeLabel,
                  { color: selectedType === doc.key ? V2_COLORS.primary : V2_COLORS.textSoft },
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
          style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}
        >
          {t('verification.documentNumber')}
        </Animated.Text>
        <TextInput
          style={styles.input}
          placeholder={t('verification.enterDocumentNumber')}
          placeholderTextColor={V2_COLORS.textMuted}
          value={documentNumber}
          onChangeText={setDocumentNumber}
          autoCapitalize="characters"
          textAlign={isRTL ? 'right' : 'left'}
        />

        {/* Full Name (Optional) */}
        <Animated.Text
          entering={FadeInUp.delay(250).duration(300)}
          style={[styles.fieldLabel, { textAlign: isRTL ? 'right' : 'left' }]}
        >
          {t('verification.fullNameOptional')}
        </Animated.Text>
        <TextInput
          style={styles.input}
          placeholder={t('verification.fullNamePlaceholder')}
          placeholderTextColor={V2_COLORS.textMuted}
          value={fullName}
          onChangeText={setFullName}
          textAlign={isRTL ? 'right' : 'left'}
        />

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitMutation.isPending}
          style={{ opacity: submitMutation.isPending ? 0.7 : 1 }}
        >
          <LinearGradient
            colors={[...GRADIENTS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>{t('verification.submitRequest')}</Text>
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
  scrollContent: { flex: 1 } as ViewStyle,
  scrollInner: { padding: 16, paddingBottom: 40 } as ViewStyle,
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: RADIUS.card,
    marginBottom: 24,
    backgroundColor: V2_COLORS.primary + '10',
  } as ViewStyle,
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: V2_COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: V2_COLORS.text,
  } as TextStyle,
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: V2_COLORS.text,
  } as TextStyle,
  typeGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 } as ViewStyle,
  typeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: RADIUS.card,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  typeCardSelected: {
    backgroundColor: V2_COLORS.primary + '08',
    borderWidth: 2,
    borderColor: V2_COLORS.primary,
  } as ViewStyle,
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  input: {
    height: 48,
    borderRadius: RADIUS.input,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    color: V2_COLORS.text,
    ...BUBBLE_SHADOWS.xs,
  } as TextStyle,
  submitBtn: {
    height: 52,
    borderRadius: RADIUS.pill,
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
    backgroundColor: V2_COLORS.accent1 + '15',
  } as ViewStyle,
  verifiedTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: V2_COLORS.text,
  } as TextStyle,
  verifiedDesc: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: V2_COLORS.textSoft,
  } as TextStyle,
});
