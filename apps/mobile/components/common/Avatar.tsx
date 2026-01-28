import { View, Image, Text, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  verified?: boolean;
}

const SIZES = {
  small: 32,
  medium: 40,
  large: 56,
  xlarge: 80,
};

const FONT_SIZES = {
  small: 12,
  medium: 14,
  large: 20,
  xlarge: 28,
};

export function Avatar({ source, name, size = 'medium', verified }: AvatarProps) {
  const { colors } = useTheme();
  const dimension = SIZES[size];
  const fontSize = FONT_SIZES[size];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize, color: '#FFFFFF' }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      {verified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              backgroundColor: colors.success,
              right: size === 'small' ? -2 : 0,
              bottom: size === 'small' ? -2 : 0,
            },
          ]}
        >
          <Text style={styles.verifiedIcon}>✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
  },
  verifiedBadge: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
