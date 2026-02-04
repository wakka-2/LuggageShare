import { View, Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/navigation';

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
  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Web Header with Navigation - shown on all web screens */}
      {isWeb && <AppHeader notificationCount={3} />}

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: isWeb
            ? { display: 'none' }
            : {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                paddingBottom: 8,
                paddingTop: 8,
                height: 60,
              },
          tabBarLabelStyle: {
            fontSize: 12,
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
          }}
        />
        <Tabs.Screen
          name="trips"
          options={{
            title: t('tabs.trips'),
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="airplane-outline" color={color} size={size} />
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
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="person-outline" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
