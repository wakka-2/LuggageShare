import { View, Image, Text, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  source?: string | null;
  avatarUrl?: string | null;
  name?: string;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | number;
  verified?: boolean;
  isVerified?: boolean;
}

const SIZES: Record<string, number> = {
  tiny: 24,
  small: 32,
  medium: 40,
  large: 56,
  xlarge: 80,
};

const FONT_RATIOS: Record<string, number> = {
  tiny: 9,
  small: 12,
  medium: 14,
  large: 20,
  xlarge: 28,
};

export function Avatar({
  source,
  avatarUrl,
  name,
  size = 'medium',
  verified,
  isVerified,
}: AvatarProps) {
  const { colors } = useTheme();
  const dimension = typeof size === 'number' ? size : SIZES[size];
  const fontSize = typeof size === 'number' ? Math.round(size * 0.35) : FONT_RATIOS[size];
  const imageSource = source || avatarUrl;
  const isVerifiedUser = verified || isVerified;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View
      style={styles.container}
      accessibilityLabel={
        name ? `${name}'s avatar${isVerifiedUser ? ', verified' : ''}` : 'User avatar'
      }
      accessibilityRole="image"
    >
      {imageSource ? (
        <Image
          source={{ uri: imageSource }}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
            },
          ]}
          accessibilityLabel={name ? `${name}'s photo` : 'User photo'}
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
          <Text style={[styles.initials, { fontSize, color: '#FFFFFF' }]}>{getInitials(name)}</Text>
        </View>
      )}
      {isVerifiedUser && (
        <View
          style={[
            styles.verifiedBadge,
            {
              backgroundColor: colors.success,
              end: dimension <= 32 ? -2 : 0,
              bottom: dimension <= 32 ? -2 : 0,
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
