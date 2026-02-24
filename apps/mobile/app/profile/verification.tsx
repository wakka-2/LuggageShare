import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export default function VerificationScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

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

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="shield-checkmark-outline" size={64} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {isRTL ? 'التحقق من الهوية' : 'Identity Verification'}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {isRTL
            ? 'سيتم إطلاق خدمة التحقق من الهوية قريباً. سنقوم بإشعارك عند توفرها.'
            : 'Identity verification is coming soon. We\'ll notify you when it\'s available.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  } as ViewStyle,
  headerBtn: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  } as ViewStyle,
  iconContainer: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  } as ViewStyle,
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' } as TextStyle,
  description: { fontSize: 15, lineHeight: 22, textAlign: 'center' } as TextStyle,
});
