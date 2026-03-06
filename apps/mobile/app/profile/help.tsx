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
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { ScreenHeader } from '@/components/common';

const FAQ_KEYS = [
  { question: 'help.howItWorks', answer: 'help.howItWorksAnswer' },
  { question: 'help.isInsured', answer: 'help.isInsuredAnswer' },
  { question: 'help.howGetPaid', answer: 'help.howGetPaidAnswer' },
] as const;

export default function HelpScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('profile.help')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FAQ */}
        <Animated.Text
          entering={FadeIn.delay(100).duration(300)}
          style={[styles.sectionTitle, { color: colors.textSecondary }]}
        >
          {t('help.faq')}
        </Animated.Text>

        {FAQ_KEYS.map((item, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(150 + index * 80)
              .duration(300)
              .springify()}
            style={[styles.faqCard, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.faqQuestion, { color: colors.text }]}>{t(item.question)}</Text>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
              {t(item.answer)}
            </Text>
          </Animated.View>
        ))}

        {/* Contact */}
        <Animated.Text
          entering={FadeIn.delay(450).duration(300)}
          style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}
        >
          {t('help.contactUs')}
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(530).duration(300).springify()}>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: colors.card }]}
            onPress={() => Linking.openURL('mailto:support@luggageshare.app')}
          >
            <View style={[styles.contactIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="mail-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.text }]}>
                {t('help.emailSupport')}
              </Text>
              <Text style={[styles.contactValue, { color: colors.textSecondary }]}>
                support@luggageshare.app
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  scrollContent: { padding: 16 } as ViewStyle,
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  } as TextStyle,
  faqCard: { borderRadius: 14, padding: 16, marginBottom: 12 } as ViewStyle,
  faqQuestion: { fontSize: 15, fontWeight: '600', marginBottom: 8 } as TextStyle,
  faqAnswer: { fontSize: 14, lineHeight: 21 } as TextStyle,
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  } as ViewStyle,
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  contactInfo: { flex: 1 } as ViewStyle,
  contactLabel: { fontSize: 15, fontWeight: '600' } as TextStyle,
  contactValue: { fontSize: 13, marginTop: 2 } as TextStyle,
});
