import { Platform, useWindowDimensions } from 'react-native';
import { Tabs, Slot } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useConversations } from '@/hooks/useMessages';
import { useUnreadCount } from '@/hooks/useNotifications';

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

  const unreadMessages = conversations?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) ?? 0;

  // On wide web screens the sidebar handles navigation — render child route only
  if (Platform.OS === 'web' && width >= WEB_DESKTOP_BREAKPOINT) {
    return <Slot />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7C6AFF',
        tabBarInactiveTintColor: '#A8A5C0',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
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
