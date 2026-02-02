import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';

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
  label: string;
  labelAr: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function PostTypeTabs({ value, onChange, counts }: PostTypeTabsProps) {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const tabs: Tab[] = [
    { key: 'all', label: 'All', labelAr: 'الكل', icon: 'apps-outline', activeIcon: 'apps' },
    { key: 'offer', label: 'Offers', labelAr: 'عروض', icon: 'airplane-outline', activeIcon: 'airplane' },
    { key: 'request', label: 'Requests', labelAr: 'طلبات', icon: 'cube-outline', activeIcon: 'cube' },
  ];

  const getTabIndex = (key: TabValue) => tabs.findIndex(t => t.key === key);
  const activeIndex = useSharedValue(getTabIndex(value));

  const handleTabPress = (tab: Tab, index: number) => {
    activeIndex.value = withSpring(index, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });
    onChange(tab.key);
  };

  // Animated indicator that slides under active tab
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withTiming(activeIndex.value * (100 / 3) + '%' as unknown as number, { duration: 0 }) },
      ],
      left: `${(activeIndex.value * 100) / 3}%`,
    };
  });

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Animated background indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: colors.primary,
              width: `${100 / 3}%`,
              left: `${(getTabIndex(value) * 100) / 3}%`,
            },
          ]}
        />

        {tabs.map((tab, index) => {
          const isActive = value === tab.key;
          const count = counts?.[tab.key];

          // Get color based on tab type
          const getTabColor = () => {
            if (!isActive) return colors.textSecondary;
            if (tab.key === 'offer') return '#FFFFFF';
            if (tab.key === 'request') return '#FFFFFF';
            return '#FFFFFF';
          };

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => handleTabPress(tab, index)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={18}
                  color={getTabColor()}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: getTabColor() },
                    isActive && styles.tabLabelActive,
                  ]}
                >
                  {isRTL ? tab.labelAr : tab.label}
                </Text>
                {count !== undefined && count > 0 && (
                  <View style={[
                    styles.countBadge,
                    {
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : colors.background,
                    }
                  ]}>
                    <Text style={[
                      styles.countText,
                      { color: isActive ? '#FFFFFF' : colors.textTertiary }
                    ]}>
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
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? { transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' as any } : {}),
  },
  tab: {
    flex: 1,
    zIndex: 1,
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
