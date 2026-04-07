import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { BackgroundBlobs } from '@/components/common';

const FAQ_KEYS = [
  { question: 'help.howItWorks', answer: 'help.howItWorksAnswer' },
  { question: 'help.isInsured', answer: 'help.isInsuredAnswer' },
  { question: 'help.howGetPaid', answer: 'help.howGetPaidAnswer' },
] as const;

export default function HelpScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

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
        <Text style={styles.headerTitle}>{t('profile.help')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FAQ */}
        <Animated.Text entering={FadeIn.delay(100).duration(300)} style={styles.sectionTitle}>
          {t('help.faq')}
        </Animated.Text>

        {FAQ_KEYS.map((item, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(150 + index * 80)
              .duration(300)
              .springify()}
            style={styles.faqCard}
          >
            <Text style={styles.faqQuestion}>{t(item.question)}</Text>
            <Text style={styles.faqAnswer}>{t(item.answer)}</Text>
          </Animated.View>
        ))}

        {/* Contact */}
        <Animated.Text
          entering={FadeIn.delay(450).duration(300)}
          style={[styles.sectionTitle, { marginTop: 24 }]}
        >
          {t('help.contactUs')}
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(530).duration(300).springify()}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL('mailto:help@luggageshare.com')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="mail-outline" size={22} color={V2_COLORS.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('help.emailSupport')}</Text>
              <Text style={styles.contactValue}>help@luggageshare.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={V2_COLORS.textMuted} />
          </TouchableOpacity>
        </Animated.View>
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
  scrollContent: { padding: 16 } as ViewStyle,
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    color: V2_COLORS.textMuted,
  } as TextStyle,
  faqCard: {
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: V2_COLORS.text,
  } as TextStyle,
  faqAnswer: {
    fontSize: 14,
    lineHeight: 21,
    color: V2_COLORS.textSoft,
  } as TextStyle,
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.card,
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: V2_COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  contactInfo: { flex: 1 } as ViewStyle,
  contactLabel: { fontSize: 15, fontWeight: '600', color: V2_COLORS.text } as TextStyle,
  contactValue: { fontSize: 13, marginTop: 2, color: V2_COLORS.textMuted } as TextStyle,
});
