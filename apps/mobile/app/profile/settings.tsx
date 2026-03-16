import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Constants from 'expo-constants';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { BackgroundBlobs } from '@/components/common';
import { changeLanguage } from '@/i18n';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const [pushEnabled, setPushEnabled] = useState(true);

  const toggleLanguage = () => {
    changeLanguage(isRTL ? 'en' : 'ar');
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

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
        <Text style={styles.headerTitle}>{t('profile.settings')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Language */}
        <Animated.View entering={FadeInUp.delay(50).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <TouchableOpacity style={styles.row} onPress={toggleLanguage}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.primary + '15' }]}>
                <Ionicons name="language-outline" size={18} color={V2_COLORS.primary} />
              </View>
              <Text style={styles.rowLabel}>
                {isRTL ? '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' : 'English'}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{isRTL ? 'EN \u2190' : '\u2192 AR'}</Text>
              <Ionicons name="chevron-forward" size={18} color={V2_COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Appearance */}
        <Animated.View entering={FadeInUp.delay(100).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.accent2 + '15' }]}>
                <Ionicons name="sunny-outline" size={18} color={V2_COLORS.accent2} />
              </View>
              <Text style={styles.rowLabel}>{t('settings.lightMode')}</Text>
            </View>
            <Text style={styles.rowValue}>{t('settings.followsSystem')}</Text>
          </View>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInUp.delay(150).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.accent1 + '15' }]}>
                <Ionicons name="notifications-outline" size={18} color={V2_COLORS.accent1} />
              </View>
              <Text style={styles.rowLabel}>{t('settings.pushNotifications')}</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: V2_COLORS.cardShadow, true: V2_COLORS.primary + '60' }}
              thumbColor={pushEnabled ? V2_COLORS.primary : '#f4f3f4'}
            />
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInUp.delay(200).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.accent3 + '15' }]}>
                <Ionicons name="information-circle-outline" size={18} color={V2_COLORS.accent3} />
              </View>
              <Text style={styles.rowLabel}>{t('settings.version')}</Text>
            </View>
            <Text style={styles.rowValue}>{appVersion}</Text>
          </View>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/profile/terms')}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.primary + '15' }]}>
                <Ionicons name="document-text-outline" size={18} color={V2_COLORS.primary} />
              </View>
              <Text style={styles.rowLabel}>{t('profile.termsOfService')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={V2_COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/profile/help')}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.accent2 + '15' }]}>
                <Ionicons name="help-circle-outline" size={18} color={V2_COLORS.accent2} />
              </View>
              <Text style={styles.rowLabel}>{t('profile.help')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={V2_COLORS.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        {/* App branding */}
        <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.footer}>
          <Ionicons name="airplane" size={24} color={V2_COLORS.textMuted + '60'} />
          <Text style={styles.footerText}>LuggageShare v{appVersion}</Text>
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
  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 } as ViewStyle,
  section: {
    borderRadius: RADIUS.card,
    padding: 16,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    color: V2_COLORS.textMuted,
  } as TextStyle,
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  } as ViewStyle,
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 } as ViewStyle,
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 } as ViewStyle,
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  rowLabel: { fontSize: 15, color: V2_COLORS.text } as TextStyle,
  rowValue: { fontSize: 14, color: V2_COLORS.textMuted } as TextStyle,
  footer: { alignItems: 'center', gap: 8, paddingVertical: 24 } as ViewStyle,
  footerText: { fontSize: 13, color: V2_COLORS.textMuted + '80' } as TextStyle,
});
