import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';

interface NavItem {
  key: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  labelKey: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', path: '/(tabs)', icon: 'home-outline', iconActive: 'home', labelKey: 'tabs.home' },
  { key: 'trips', path: '/(tabs)/trips', icon: 'airplane-outline', iconActive: 'airplane', labelKey: 'tabs.trips' },
  { key: 'messages', path: '/(tabs)/messages', icon: 'chatbubbles-outline', iconActive: 'chatbubbles', labelKey: 'tabs.messages' },
  { key: 'profile', path: '/(tabs)/profile', icon: 'person-outline', iconActive: 'person', labelKey: 'tabs.profile' },
];

export function WebNavigation() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = i18n.language === 'ar';

  const isActive = (path: string) => {
    if (path === '/(tabs)') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/index';
    }
    return pathname.includes(path.replace('/(tabs)', ''));
  };

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <Pressable
            key={item.key}
            style={({ pressed, hovered }) => [
              styles.navItem,
              active && styles.navItemActive,
              hovered && styles.navItemHovered,
              pressed && styles.navItemPressed,
              { borderBottomColor: active ? colors.primary : 'transparent' },
            ]}
            onPress={() => router.push(item.path as any)}
          >
            <Ionicons
              name={active ? item.iconActive : item.icon}
              size={20}
              color={active ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.navLabel,
                { color: active ? colors.primary : colors.textSecondary },
                active && styles.navLabelActive,
              ]}
            >
              {t(item.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  navItemActive: {
    // Active state handled by borderBottomColor
  },
  navItemHovered: {
    opacity: 0.8,
  },
  navItemPressed: {
    opacity: 0.6,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  navLabelActive: {
    fontWeight: '600',
  },
});
