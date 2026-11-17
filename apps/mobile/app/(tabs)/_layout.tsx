import { Platform, useWindowDimensions } from 'react-native';
import { Tabs, Slot, Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useConversations } from '@/hooks/useMessages';
import { useUnreadCount } from '@/hooks/useNotifications';
import { V2_COLORS } from '@/providers/ThemeProvider';

const WEB_DESKTOP_BREAKPOINT = 768;

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
};

function TabIcon({ name, color, size }: TabIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { data: conversations } = useConversations();
  const notificationCount = useUnreadCount();
  const { user, isLoading: isAuthLoading } = useAuth();

  const unreadMessages = conversations?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) ?? 0;

  // Auth guard: never mount the tab screens until the session is known.
  // Mounting Home (12 Reanimated `entering` animations) and then redirecting to
  // login a frame later unmounts views whose layout animations are still queued,
  // which crashes Reanimated 3.16 natively (null config in startLayoutAnimation).
  if (isAuthLoading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  // On wide web screens the sidebar handles navigation — render child route only
  if (Platform.OS === 'web' && width >= WEB_DESKTOP_BREAKPOINT) {
    return <Slot />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: V2_COLORS.primary,
        tabBarInactiveTintColor: V2_COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: V2_COLORS.surface,
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          shadowColor: 'rgba(124,106,255,0.12)',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home-outline" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: t('tabs.home'),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: t('tabs.trips'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="airplane-outline" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: t('tabs.trips'),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabs.messages'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="chatbubbles-outline" color={color} size={size} />
          ),
          tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, fontSize: 10 },
          tabBarAccessibilityLabel:
            unreadMessages > 0
              ? `${t('tabs.messages')}, ${unreadMessages} unread`
              : t('tabs.messages'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="person-outline" color={color} size={size} />
          ),
          tabBarBadge: notificationCount > 0 ? notificationCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#EF4444', fontSize: 10 },
          tabBarAccessibilityLabel:
            notificationCount > 0
              ? `${t('tabs.profile')}, ${notificationCount} notifications`
              : t('tabs.profile'),
        }}
      />
    </Tabs>
  );
}
