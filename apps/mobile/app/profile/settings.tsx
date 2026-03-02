import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { changeLanguage } from '@/i18n';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const toggleLanguage = () => {
    changeLanguage(isRTL ? 'en' : 'ar');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.settings')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Language */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('settings.language')}
          </Text>
          <TouchableOpacity style={styles.row} onPress={toggleLanguage}>
            <View style={styles.rowLeft}>
              <Ionicons name="language-outline" size={20} color={colors.text} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {isRTL ? 'العربية' : 'English'}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                {isRTL ? 'EN ←' : '→ AR'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('settings.appearance')}
          </Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name={isDark ? 'moon-outline' : 'sunny-outline'}
                size={20}
                color={colors.text}
              />
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {isDark ? t('settings.darkMode') : t('settings.lightMode')}
              </Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              {t('settings.followsSystem')}
            </Text>
          </View>
        </View>
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
  scrollContent: { padding: 16, gap: 16 } as ViewStyle,
  section: { borderRadius: 14, padding: 16 } as ViewStyle,
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  } as TextStyle,
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  } as ViewStyle,
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 } as ViewStyle,
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 } as ViewStyle,
  rowLabel: { fontSize: 15 } as TextStyle,
  rowValue: { fontSize: 14 } as TextStyle,
});
