import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { changeLanguage } from '@/i18n';
import {
  TOPBAR_HEIGHT,
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
  glassBackground,
  glassBorder,
  webTransition,
} from './styles';
import { Breadcrumb } from './Breadcrumb';
import { NotificationDropdown } from './NotificationDropdown';
import { UserDropdown } from './UserDropdown';

interface TopBarProps {
  sidebarCollapsed: boolean;
}

export function TopBar({ sidebarCollapsed }: TopBarProps) {
  const { i18n } = useTranslation();
  const { colors, isDark } = useTheme();

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    await changeLanguage(newLang as 'ar' | 'en');
  };

  return (
    <View
      style={[
        styles.container,
        glassBackground(colors, isDark),
        glassBorder(isDark),
        webTransition('margin-inline-start'),
        {
          height: TOPBAR_HEIGHT,
          marginStart: sidebarWidth,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        } as any,
      ]}
    >
      {/* Left: Breadcrumb */}
      <View style={styles.leftSection}>
        <Breadcrumb />
      </View>

      {/* Right: Actions */}
      <View style={styles.rightSection}>
        {/* Language toggle */}
        <TouchableOpacity
          style={[
            styles.langButton,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
          ]}
          onPress={toggleLanguage}
        >
          <Text style={[styles.langText, { color: colors.text }]}>
            {i18n.language === 'ar' ? 'EN' : 'ع'}
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User menu */}
        <UserDropdown />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed' as any,
    top: 0,
    end: 0,
    start: 0,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...({ cursor: 'pointer' } as any),
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
