import { Platform, useWindowDimensions, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Tabs, Slot, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { BLUR, TYPOGRAPHY, SHADOWS, SPACING } from '@/providers/ThemeProvider';
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function GlassTabBarBackground() {
  const { colors, isDark } = useTheme();
  if (Platform.OS === 'web') return null; // Web uses CSS backdrop-filter
  const { BlurView } = require('expo-blur');
  return (
    <BlurView
      intensity={BLUR.tabBar}
      tint={isDark ? 'dark' : 'light'}
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBarBg }]}
    />
  );
}

function CreateTabButton({ onPress, color }: { onPress: () => void; color: string }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[styles.createTab, animStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel="Create listing"
    >
      <View style={[styles.createTabButton, { backgroundColor: color }, SHADOWS.glow]}>
        <Ionicons name="add" size={28} color="#FFF" />
      </View>
    </AnimatedTouchable>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { data: conversations } = useConversations();
  const notificationCount = useUnreadCount();

  const unreadMessages = conversations?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) ?? 0;

  // On wide web screens the sidebar handles navigation — render child route only
  if (Platform.OS === 'web' && width >= WEB_DESKTOP_BREAKPOINT) {
    return <Slot />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarBackground: () => <GlassTabBarBackground />,
          tabBarStyle: {
            position: Platform.OS === 'web' ? undefined : ('absolute' as const),
            backgroundColor: Platform.OS === 'web' ? colors.tabBarBg : 'transparent',
            borderTopColor: colors.glassBorder,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingBottom: SPACING[2],
            paddingTop: SPACING[2],
            height: 64,
            elevation: 0,
            // Web: CSS backdrop-filter
            ...(Platform.OS === 'web'
              ? {
                  // @ts-ignore — web-only CSS property
                  backdropFilter: `blur(${BLUR.tabBar}px)`,
                  WebkitBackdropFilter: `blur(${BLUR.tabBar}px)`,
                }
              : {}),
          },
          tabBarLabelStyle: {
            ...TYPOGRAPHY.micro,
            fontWeight: '500',
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
          name="create"
          options={{
            title: '',
            tabBarIcon: () => null,
            tabBarButton: () => (
              <CreateTabButton
                onPress={() => router.push('/listing/create' as any)}
                color={colors.primary}
              />
            ),
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
    </>
  );
}

const styles = StyleSheet.create({
  // Center "+" tab button
  createTab: {
    top: -14,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  createTabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
