import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { RADIUS, TYPOGRAPHY, SPACING } from '@/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common';
import { changeLanguage } from '@/i18n';
import { showAlert } from '@/lib/alert';

interface HomeHeaderProps {
  notificationCount?: number;
}

export function HomeHeader({ notificationCount = 0 }: HomeHeaderProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    await changeLanguage(newLang as 'ar' | 'en');
    // On native, RTL direction change requires an app restart
    if (Platform.OS !== 'web') {
      showAlert(t('settings.restartRequired'), t('settings.restartDescription'));
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <Avatar
          source={user?.avatarUrl}
          name={user?.displayName || t('profile.guest')}
          size="medium"
        />
        {user?.displayName && (
          <Text style={[styles.greeting, { color: colors.text }]} numberOfLines={1}>
            {user.displayName.split(' ')[0]}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.rightActions}>
        {/* Language Toggle — V2: solid white with colored border */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: '#FFFFFF',
              borderColor: colors.primary + '25',
            },
          ]}
          onPress={toggleLanguage}
        >
          <Text style={[styles.langText, { color: colors.primary }]}>
            {i18n.language === 'ar' ? 'EN' : 'ع'}
          </Text>
        </TouchableOpacity>

        {/* Notifications — V2: solid white with colored border */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: '#FFFFFF',
              borderColor: colors.primary + '25',
            },
          ]}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {notificationCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[4], // 16
    paddingVertical: SPACING[3], // 12
    borderBottomWidth: 1,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3], // 12
  },
  greeting: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2], // 8
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    end: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    ...TYPOGRAPHY.micro,
    fontWeight: '800',
  },
});
