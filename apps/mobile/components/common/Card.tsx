import { View, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { colors } = useTheme();

  const getStyle = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'elevated':
        return {
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        };
      default:
        return {
          backgroundColor: colors.card,
        };
    }
  };

  return <View style={[styles.card, getStyle(), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
});
