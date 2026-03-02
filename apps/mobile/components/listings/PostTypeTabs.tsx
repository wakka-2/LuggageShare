import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { ListingType } from './types';

type TabValue = ListingType | 'all';

interface PostTypeTabsProps {
  value: TabValue;
  onChange: (type: TabValue) => void;
  counts?: {
    all: number;
    offer: number;
    request: number;
  };
}

interface Tab {
  key: TabValue;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

export function PostTypeTabs({ value, onChange, counts }: PostTypeTabsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const tabs: Tab[] = [
    { key: 'all', labelKey: 'home.allTab', icon: 'apps-outline', activeIcon: 'apps' },
    { key: 'offer', labelKey: 'home.offersTab', icon: 'airplane-outline', activeIcon: 'airplane' },
    { key: 'request', labelKey: 'home.requestsTab', icon: 'cube-outline', activeIcon: 'cube' },
  ];

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrapper}>
      <View
        style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {tabs.map((tab) => {
          const isActive = value === tab.key;
          const count = counts?.[tab.key];
          const textColor = isActive ? '#FFFFFF' : colors.textSecondary;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && [styles.tabActive, { backgroundColor: colors.primary }],
              ]}
              onPress={() => onChange(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons name={isActive ? tab.activeIcon : tab.icon} size={18} color={textColor} />
                <Text
                  style={[styles.tabLabel, { color: textColor }, isActive && styles.tabLabelActive]}
                >
                  {t(tab.labelKey)}
                </Text>
                {count !== undefined && count > 0 && (
                  <View
                    style={[
                      styles.countBadge,
                      {
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : colors.background,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        { color: isActive ? '#FFFFFF' : colors.textTertiary },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
  },
  tabActive: {
    borderRadius: 12,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
