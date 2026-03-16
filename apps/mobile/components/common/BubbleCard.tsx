import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';

interface BubbleCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tint?: string;
  noPadding?: boolean;
  shadow?: 'xs' | 'sm' | 'md' | 'lg';
}

export function BubbleCard({
  children,
  style,
  tint = '#FFFFFF',
  noPadding = false,
  shadow = 'lg',
}: BubbleCardProps) {
  return (
    <View
      style={[
        styles.card,
        BUBBLE_SHADOWS[shadow],
        { backgroundColor: tint },
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    padding: 18,
  },
  noPadding: {
    padding: 0,
  },
});
