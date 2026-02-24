import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTheme } from '@/hooks/useTheme';
import { apiClient } from '@/lib/api';

const DOCUMENT_TYPES = [
  { key: 'national_id', iconEn: 'card-outline', labelEn: 'National ID', labelAr: 'الهوية الوطنية' },
  { key: 'passport', iconEn: 'document-outline', labelEn: 'Passport', labelAr: 'جواز السفر' },
  {
    key: 'driving_license',
    iconEn: 'car-outline',
    labelEn: 'Driving License',
    labelAr: 'رخصة القيادة',
  },
] as const;

export default function VerificationScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
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
      Alert.alert(
        t('common.success'),
        isRTL ? 'تم تقديم طلب التحقق بنجاح' : 'Verification request submitted successfully'
      );
    },
    onError: () => {
      Alert.alert(
        t('common.errorTitle'),
        isRTL ? 'فشل تقديم طلب التحقق' : 'Failed to submit verification request'
      );
    },
  });

  const handleSubmit = () => {
    if (!selectedType || !documentNumber.trim()) {
      Alert.alert(t('common.errorTitle'), t('common.requiredFieldsError'));
      return;
    }
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Already verified
  if (status?.isVerified) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('profile.verification')}
          </Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.verifiedContent}>
          <View style={[styles.verifiedIcon, { backgroundColor: '#10B98115' }]}>
            <Ionicons name="shield-checkmark" size={64} color="#10B981" />
          </View>
          <Text style={[styles.verifiedTitle, { color: colors.text }]}>
            {isRTL ? 'تم التحقق من هويتك' : 'Identity Verified'}
          </Text>
          <Text style={[styles.verifiedDesc, { color: colors.textSecondary }]}>
            {isRTL
              ? 'حسابك موثق. يمكنك الآن الاستمتاع بجميع ميزات المنصة.'
              : 'Your account is verified. You can now enjoy all platform features.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('profile.verification')}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          <Text
            style={[styles.infoText, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
          >
            {isRTL
              ? 'التحقق من الهوية يساعد في بناء الثقة مع المستخدمين الآخرين ويفتح ميزات إضافية.'
              : 'Identity verification helps build trust with other users and unlocks additional features.'}
          </Text>
        </View>

        {/* Document Type Selection */}
        <Text
          style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
        >
          {isRTL ? 'نوع المستند' : 'Document Type'}
        </Text>
        <View style={styles.typeGrid}>
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
                name={doc.iconEn as keyof typeof Ionicons.glyphMap}
                size={28}
                color={selectedType === doc.key ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeLabel,
                  { color: selectedType === doc.key ? colors.primary : colors.text },
                ]}
              >
                {isRTL ? doc.labelAr : doc.labelEn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Document Number */}
        <Text
          style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
        >
          {isRTL ? 'رقم المستند' : 'Document Number'}
        </Text>
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
          placeholder={isRTL ? 'أدخل رقم المستند' : 'Enter document number'}
          placeholderTextColor={colors.textSecondary}
          value={documentNumber}
          onChangeText={setDocumentNumber}
          autoCapitalize="characters"
        />

        {/* Full Name (Optional) */}
        <Text
          style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
        >
          {isRTL ? 'الاسم الكامل (اختياري)' : 'Full Name (Optional)'}
        </Text>
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
          placeholder={isRTL ? 'كما يظهر في المستند' : 'As it appears on document'}
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
            <Text style={styles.submitText}>
              {isRTL ? 'تقديم طلب التحقق' : 'Submit Verification Request'}
            </Text>
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
