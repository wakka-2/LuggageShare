import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common';

interface HomeHeaderProps {
  notificationCount?: number;
}

export function HomeHeader({ notificationCount = 0 }: HomeHeaderProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <Avatar
          source={user?.avatarUrl}
          name={user?.displayName || t('profile.guest')}
          size="medium"
        />
      </TouchableOpacity>

      <View style={styles.rightActions}>
        {/* Language Toggle */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card }]}
          onPress={toggleLanguage}
        >
          <Text style={[styles.langText, { color: colors.text }]}>
            {i18n.language === 'ar' ? 'EN' : 'ع'}
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card }]}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
