import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common';
import { webTransition } from './styles';

interface MenuItem {
  key: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  action?: 'logout';
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'edit',
    labelKey: 'web.userMenu.editProfile',
    icon: 'person-outline',
    route: '/profile/edit',
  },
  {
    key: 'wallet',
    labelKey: 'web.userMenu.wallet',
    icon: 'wallet-outline',
    route: '/profile/wallet',
  },
  {
    key: 'settings',
    labelKey: 'web.userMenu.settings',
    icon: 'settings-outline',
    route: '/profile/settings',
  },
  {
    key: 'help',
    labelKey: 'web.userMenu.help',
    icon: 'help-circle-outline',
    route: '/profile/help',
  },
  { key: 'logout', labelKey: 'web.userMenu.logout', icon: 'log-out-outline', action: 'logout' },
];

export function UserDropdown() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Close on outside click (web)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-user-dropdown]')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleItemPress = async (item: MenuItem) => {
    setOpen(false);
    if (item.action === 'logout') {
      await signOut();
      return;
    }
    if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <View {...({ 'data-user-dropdown': true } as any)} style={styles.wrapper}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.avatarButton}>
        <Avatar source={user?.avatarUrl} name={user?.displayName || '?'} size="small" />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {/* User info header */}
          <View style={styles.userInfo}>
            <Avatar source={user?.avatarUrl} name={user?.displayName || '?'} size="medium" />
            <View style={styles.userText}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.displayName || t('profile.guest')}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || ''}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Menu items */}
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                item.action === 'logout' && styles.logoutItem,
                webTransition('background-color', '0.15s'),
              ]}
              onPress={() => handleItemPress(item)}
            >
              <View
                style={[
                  styles.menuIconCircle,
                  item.action === 'logout'
                    ? { backgroundColor: V2_COLORS.secondary + '15' }
                    : { backgroundColor: V2_COLORS.primary + '15' },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={item.action === 'logout' ? V2_COLORS.secondary : V2_COLORS.primary}
                />
              </View>
              <Text
                style={[
                  styles.menuLabel,
                  { color: item.action === 'logout' ? V2_COLORS.secondary : V2_COLORS.text },
                ]}
              >
                {t(item.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  avatarButton: {
    borderRadius: RADIUS.pill,
    padding: 4,
    ...({ cursor: 'pointer' } as any),
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    end: 0,
    width: 260,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: V2_COLORS.text,
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
    color: V2_COLORS.textSoft,
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
    marginVertical: 4,
    backgroundColor: V2_COLORS.cardShadow,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderRadius: RADIUS.pill,
    marginHorizontal: 8,
    ...({ cursor: 'pointer' } as any),
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutItem: {
    marginTop: 4,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});
