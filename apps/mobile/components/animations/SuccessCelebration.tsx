import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeInUp } from 'react-native-reanimated';
import { LottieAnimation } from '@/components/common/LottieAnimation';
import { useTheme, TYPOGRAPHY } from '@/providers/ThemeProvider';

type CelebrationAnimation = 'listing-created' | 'booking-confirmed' | 'delivery-complete';

// Map celebration types to existing LottieAnimation types
const ANIMATION_MAP: Record<CelebrationAnimation, string> = {
  'listing-created': 'success',
  'booking-confirmed': 'success',
  'delivery-complete': 'success',
};

interface SuccessCelebrationProps {
  visible: boolean;
  animation?: CelebrationAnimation;
  message?: string;
  onComplete?: () => void;
}

export function SuccessCelebration({
  visible,
  animation = 'listing-created',
  message,
  onComplete,
}: SuccessCelebrationProps) {
  const { colors } = useTheme();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowMessage(false);
      const msgTimer = setTimeout(() => setShowMessage(true), 1000);
      const doneTimer = setTimeout(() => onComplete?.(), 2500);
      return () => {
        clearTimeout(msgTimer);
        clearTimeout(doneTimer);
      };
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <LottieAnimation animation={ANIMATION_MAP[animation]} size={200} loop={false} autoPlay />
          {showMessage && message && (
            <Animated.Text
              entering={FadeInUp.duration(300).springify()}
              style={[styles.message, { color: colors.text }]}
            >
              {message}
            </Animated.Text>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...TYPOGRAPHY.h3,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
});
