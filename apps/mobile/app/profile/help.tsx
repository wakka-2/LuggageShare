import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';

const FAQ_ITEMS = [
  {
    questionEn: 'How does LuggageShare work?',
    questionAr: 'كيف يعمل LuggageShare؟',
    answerEn: 'Carriers list their available luggage space on upcoming trips. Senders browse listings and request to book space for their items.',
    answerAr: 'يقوم الناقلون بعرض المساحة المتاحة في أمتعتهم في الرحلات القادمة. يتصفح المرسلون العروض ويطلبون حجز مساحة لأغراضهم.',
  },
  {
    questionEn: 'Is my item insured?',
    questionAr: 'هل أغراضي مؤمنة؟',
    answerEn: 'Items are covered by the declared value during transport. We recommend accurately declaring item values when creating a booking.',
    answerAr: 'الأغراض مغطاة بالقيمة المعلنة أثناء النقل. ننصح بالإعلان الدقيق عن قيمة الأغراض عند إنشاء الحجز.',
  },
  {
    questionEn: 'How do I get paid as a carrier?',
    questionAr: 'كيف أحصل على أموالي كناقل؟',
    answerEn: 'Payment is released to your wallet after the sender confirms delivery. You can then transfer the balance to your bank account.',
    answerAr: 'يتم تحويل المبلغ إلى محفظتك بعد تأكيد المرسل للتسليم. يمكنك بعدها تحويل الرصيد إلى حسابك البنكي.',
  },
];

export default function HelpScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('profile.help')}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FAQ */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </Text>

        {FAQ_ITEMS.map((item, index) => (
          <View key={index} style={[styles.faqCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>
              {isRTL ? item.questionAr : item.questionEn}
            </Text>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
              {isRTL ? item.answerAr : item.answerEn}
            </Text>
          </View>
        ))}

        {/* Contact */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
          {isRTL ? 'تواصل معنا' : 'Contact Us'}
        </Text>

        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: colors.card }]}
          onPress={() => Linking.openURL('mailto:support@luggageshare.app')}
        >
          <View style={[styles.contactIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="mail-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactLabel, { color: colors.text }]}>
              {isRTL ? 'البريد الإلكتروني' : 'Email Support'}
            </Text>
            <Text style={[styles.contactValue, { color: colors.textSecondary }]}>
              support@luggageshare.app
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: { padding: 16 } as ViewStyle,
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 12 } as TextStyle,
  faqCard: { borderRadius: 14, padding: 16, marginBottom: 12 } as ViewStyle,
  faqQuestion: { fontSize: 15, fontWeight: '600', marginBottom: 8 } as TextStyle,
  faqAnswer: { fontSize: 14, lineHeight: 21 } as TextStyle,
  contactCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, gap: 12,
  } as ViewStyle,
  contactIcon: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  } as ViewStyle,
  contactInfo: { flex: 1 } as ViewStyle,
  contactLabel: { fontSize: 15, fontWeight: '600' } as TextStyle,
  contactValue: { fontSize: 13, marginTop: 2 } as TextStyle,
});
