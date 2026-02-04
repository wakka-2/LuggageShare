import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common';
import { WebNavigation } from './WebNavigation';

interface AppHeaderProps {
  notificationCount?: number;
  showNavigation?: boolean;
}

export function AppHeader({ notificationCount = 0, showNavigation = true }: AppHeaderProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isRTL = i18n.language === 'ar';
  const [menuOpen, setMenuOpen] = useState(false);

  const isWideScreen = width > 768;
  const showWebNav = isWideScreen && showNavigation;

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
      },
      isWideScreen && styles.containerWide,
    ]}>
      <View style={[styles.inner, isWideScreen && styles.innerWide]}>
        {/* Logo / Brand */}
        <TouchableOpacity
          style={[styles.brand, isRTL && styles.brandRTL]}
          onPress={() => router.push('/(tabs)')}
        >
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="airplane" size={18} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandText, { color: colors.text }]}>
            Luggage<Text style={{ color: colors.primary }}>Share</Text>
          </Text>
        </TouchableOpacity>

        {/* Web Navigation - wide screens: inline nav */}
        {showWebNav && (
          <View style={styles.navContainer}>
            <WebNavigation />
          </View>
        )}

        {/* Right Actions */}
        <View style={[styles.rightActions, isRTL && styles.rightActionsRTL]}>
          {/* Create Listing Button - wide screens only */}
          {showWebNav && (
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/listing/create')}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.createButtonText}>
                {t('listing.create')}
              </Text>
            </TouchableOpacity>
          )}

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
            onPress={() => router.push('/notifications' as any)}
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

          {/* Profile Avatar - wide screens */}
          {isWideScreen && (
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Avatar
                source={user?.avatarUrl}
                name={user?.displayName || t('profile.guest')}
                size="small"
              />
            </TouchableOpacity>
          )}

          {/* Hamburger Menu - narrow web screens */}
          {!isWideScreen && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.card }]}
              onPress={() => setMenuOpen(!menuOpen)}
            >
              <Ionicons
                name={menuOpen ? 'close' : 'menu'}
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile Web Dropdown Menu */}
      {!isWideScreen && menuOpen && (
        <View style={[styles.mobileMenu, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <WebNavigation layout="vertical" onNavigate={() => setMenuOpen(false)} />
          <View style={[styles.mobileMenuDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={[styles.mobileMenuItem, isRTL && styles.mobileMenuItemRTL]}
            onPress={() => { router.push('/listing/create'); setMenuOpen(false); }}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.mobileMenuLabel, { color: colors.primary }]}>
              {t('listing.create')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mobileMenuItem, isRTL && styles.mobileMenuItemRTL]}
            onPress={() => { router.push('/(tabs)/profile'); setMenuOpen(false); }}
          >
            <Ionicons name="person-outline" size={20} color={colors.text} />
            <Text style={[styles.mobileMenuLabel, { color: colors.text }]}>
              {t('tabs.profile')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  containerWide: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  innerWide: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandRTL: {
    flexDirection: 'row-reverse',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  navContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 32,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightActionsRTL: {
    flexDirection: 'row-reverse',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'opacity 0.2s ease',
      },
    }),
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  avatarButton: {
    marginLeft: 4,
  },
  mobileMenu: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  mobileMenuDivider: {
    height: 1,
    marginVertical: 8,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  mobileMenuItemRTL: {
    flexDirection: 'row-reverse',
  },
  mobileMenuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
