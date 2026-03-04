import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const { t } = useTranslation();

  if (isConnected) return null;

  return (
    <Animated.View
      entering={SlideInUp.duration(300).springify()}
      exiting={SlideOutUp.duration(200)}
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
      <Text style={styles.text}>{t('common.offline', 'You are offline')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
