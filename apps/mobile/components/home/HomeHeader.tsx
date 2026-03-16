import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';
import { IconButton } from '@/components/common';
import { changeLanguage } from '@/i18n';
import { showAlert } from '@/lib/alert';
import { V2_COLORS, TYPOGRAPHY } from '@/providers/ThemeProvider';

interface HomeHeaderProps {
  notificationCount?: number;
}

export function HomeHeader({ notificationCount = 0 }: HomeHeaderProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    await changeLanguage(newLang as 'ar' | 'en');
    if (Platform.OS !== 'web') {
      showAlert(t('settings.restartRequired'), t('settings.restartDescription'));
    }
  };

  const firstName = user?.displayName?.split(' ')[0] || t('profile.guest');

  return (
    <View style={styles.container}>
      <View style={styles.greetingBlock}>
        <Text style={styles.greeting}>{t('home.greeting')}</Text>
        <Text style={styles.name}>{firstName}</Text>
      </View>

      <View style={styles.actions}>
        <IconButton icon="language-outline" onPress={toggleLanguage} />
        <IconButton
          icon="notifications-outline"
          onPress={() => router.push('/notifications')}
          badge={notificationCount > 0 ? notificationCount : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greetingBlock: {
    flex: 1,
  },
  greeting: {
    ...TYPOGRAPHY.caption,
    color: V2_COLORS.textSoft,
    marginBottom: 2,
  },
  name: {
    ...TYPOGRAPHY.h1,
    color: V2_COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
