import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideInLeft,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated';

interface WizardStepProps {
  children: React.ReactNode;
  direction: 'forward' | 'backward';
  isRTL?: boolean;
}

export function WizardStep({ children, direction, isRTL = false }: WizardStepProps) {
  // Determine animation direction based on navigation direction and RTL
  const isForward = direction === 'forward';
  const slideFromRight = isForward !== isRTL; // XOR: forward+LTR = right, forward+RTL = left

  const entering = slideFromRight
    ? SlideInRight.duration(300).springify()
    : SlideInLeft.duration(300).springify();

  const exiting = slideFromRight ? SlideOutLeft.duration(250) : SlideOutRight.duration(250);

  return (
    <Animated.View entering={entering} exiting={exiting} style={styles.container}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
