import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, webTransition } from './styles';

interface NavItem {
  route: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  matchPaths: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    route: '/(tabs)',
    labelKey: 'tabs.home',
    icon: 'home-outline',
    activeIcon: 'home',
    matchPaths: ['/', '/(tabs)', '/(tabs)/index'],
  },
  {
    route: '/(tabs)/trips',
    labelKey: 'tabs.trips',
    icon: 'airplane-outline',
    activeIcon: 'airplane',
    matchPaths: ['/trips', '/(tabs)/trips'],
  },
  {
    route: '/(tabs)/messages',
    labelKey: 'tabs.messages',
    icon: 'chatbubbles-outline',
    activeIcon: 'chatbubbles',
    matchPaths: ['/messages', '/(tabs)/messages'],
  },
  {
    route: '/(tabs)/profile',
    labelKey: 'tabs.profile',
    icon: 'person-outline',
    activeIcon: 'person',
    matchPaths: ['/profile', '/(tabs)/profile'],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const isActive = (item: NavItem) =>
    item.matchPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));

  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <View style={[styles.container, webTransition('width'), { width }]}>
      {/* Logo area */}
      <View style={styles.logoArea}>
        {!collapsed && <Text style={styles.logoText}>LuggageShare</Text>}
        <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
          <Ionicons name={collapsed ? 'menu' : 'close'} size={22} color={V2_COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Navigation items */}
      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.navItem,
                collapsed && styles.navItemCollapsed,
                active && styles.navItemActive,
                !active && webTransition('background-color', '0.15s'),
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={20}
                color={active ? '#FFFFFF' : V2_COLORS.textSoft}
              />
              {!collapsed && (
                <Text
                  style={[
                    styles.navLabel,
                    { color: active ? '#FFFFFF' : V2_COLORS.text },
                    active && styles.navLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {t(item.labelKey)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <View style={styles.divider} />
        {!collapsed && <Text style={styles.versionText}>v1.0.0</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%' as any,
    position: 'fixed' as any,
    top: 0,
    start: 0,
    zIndex: 100,
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: V2_COLORS.primary,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: V2_COLORS.bg,
    ...({ cursor: 'pointer' } as any),
  },
  navList: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    gap: 12,
    ...({ cursor: 'pointer' } as any),
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navItemActive: {
    backgroundColor: V2_COLORS.primary,
    ...BUBBLE_SHADOWS.sm,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  navLabelActive: {
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: V2_COLORS.cardShadow,
  },
  versionText: {
    fontSize: 11,
    textAlign: 'center',
    color: V2_COLORS.textMuted,
  },
});
