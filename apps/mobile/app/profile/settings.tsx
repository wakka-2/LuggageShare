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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { dirIcon } from '@/lib/rtl';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, themed } from '@/providers/ThemeProvider';
import { BackgroundBlobs } from '@/components/common';
import { changeLanguage } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateSettings } from '@/hooks/useProfile';
import { apiClient } from '@/lib/api';
import { showAlert } from '@/lib/alert';
import { getApiErrorMessage } from '@/lib/mappers';
import { openLegalPage } from '@/lib/links';
import { setThemePreference, useThemePreference, type ThemePreference } from '@/lib/colorScheme';

const THEME_OPTIONS: {
  value: ThemePreference;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'system', labelKey: 'settings.themeSystem', icon: 'phone-portrait-outline' },
  { value: 'light', labelKey: 'settings.lightMode', icon: 'sunny-outline' },
  { value: 'dark', labelKey: 'settings.darkMode', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const { data: profile } = useProfile();
  const updateSettings = useUpdateSettings();
  // Optimistic local value while saving; otherwise reflect the saved preference.
  const [pendingPush, setPendingPush] = useState<boolean | null>(null);
  const pushEnabled = pendingPush ?? profile?.settings?.notifications ?? true;
  const setPushEnabled = (value: boolean) => {
    setPendingPush(value);
    updateSettings.mutate(
      { notifications: value },
      {
        onError: (err) =>
          showAlert(t('common.errorTitle'), getApiErrorMessage(err, t('common.error'))),
        onSettled: () => setPendingPush(null),
      }
    );
  };
  const [isDeleting, setIsDeleting] = useState(false);
  const themePreference = useThemePreference();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const toggleLanguage = () => {
    changeLanguage(isRTL ? 'en' : 'ar');
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const deleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete('/users/me');
      queryClient.clear();
      await signOut();
      router.replace('/(auth)/login');
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      showAlert(
        t('common.errorTitle'),
        status === 409
          ? t('settings.deleteAccountBlocked')
          : getApiErrorMessage(err, t('common.error'))
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteAccount = () => {
    showAlert(t('settings.deleteAccountTitle'), t('settings.deleteAccountMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.deleteAccountConfirm'), style: 'destructive', onPress: deleteAccount },
    ]);
  };

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
              <Ionicons name={dirIcon('chevron-forward')} size={18} color={V2_COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Appearance */}
        <Animated.View entering={FadeInUp.delay(100).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
          <View style={styles.themeOptions} accessibilityRole="radiogroup">
            {THEME_OPTIONS.map((option) => {
              const selected = themePreference === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.themeOption, selected && styles.themeOptionSelected]}
                  onPress={() => {
                    if (!selected) setThemePreference(option.value);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={selected ? V2_COLORS.onPrimary : V2_COLORS.textSoft}
                  />
                  <Text
                    style={[styles.themeOptionText, selected && styles.themeOptionTextSelected]}
                    numberOfLines={1}
                  >
                    {t(option.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
            <Ionicons name={dirIcon('chevron-forward')} size={18} color={V2_COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => openLegalPage('privacy')}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.accent1 + '15' }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={V2_COLORS.accent1} />
              </View>
              <Text style={styles.rowLabel}>{t('auth.privacyPolicy')}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={V2_COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/profile/help')}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.accent2 + '15' }]}>
                <Ionicons name="help-circle-outline" size={18} color={V2_COLORS.accent2} />
              </View>
              <Text style={styles.rowLabel}>{t('profile.help')}</Text>
            </View>
            <Ionicons name={dirIcon('chevron-forward')} size={18} color={V2_COLORS.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        {/* Account */}
        <Animated.View entering={FadeInUp.delay(250).duration(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={confirmDeleteAccount}
            disabled={isDeleting}
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: V2_COLORS.secondary + '15' }]}>
                <Ionicons name="trash-outline" size={18} color={V2_COLORS.secondary} />
              </View>
              <Text style={[styles.rowLabel, { color: V2_COLORS.secondary }]}>
                {t('settings.deleteAccount')}
              </Text>
            </View>
            {isDeleting ? (
              <ActivityIndicator size="small" color={V2_COLORS.secondary} />
            ) : (
              <Ionicons name={dirIcon('chevron-forward')} size={18} color={V2_COLORS.textMuted} />
            )}
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

const styles = themed(() =>
  StyleSheet.create({
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
      backgroundColor: V2_COLORS.surface,
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
      backgroundColor: V2_COLORS.surface,
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
    themeOptions: {
      flexDirection: 'row',
      gap: 8,
    } as ViewStyle,
    themeOption: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 6,
      borderRadius: RADIUS.card,
      backgroundColor: V2_COLORS.surface,
      borderWidth: 1,
      borderColor: V2_COLORS.border,
    } as ViewStyle,
    themeOptionSelected: {
      backgroundColor: V2_COLORS.primary,
      borderColor: V2_COLORS.primary,
    } as ViewStyle,
    themeOptionText: {
      fontSize: 13,
      fontWeight: '600',
      color: V2_COLORS.textSoft,
    } as TextStyle,
    themeOptionTextSelected: {
      color: V2_COLORS.onPrimary,
    } as TextStyle,
  })
);
