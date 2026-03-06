import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, TYPOGRAPHY } from '@/providers/ThemeProvider';

interface ScreenHeaderProps {
  title: string;
  /** Custom back handler — defaults to useGoBack (with home-tab fallback) */
  onBack?: () => void;
  /** Element rendered on the right side (e.g. action button) */
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  const { i18n } = useTranslation();
  const router = useRouter();
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };
  const isRTL = i18n.language === 'ar';

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack ?? goBack}
        style={styles.headerBtn}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={V2_COLORS.text} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {right ?? <View style={styles.headerBtn} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  } as ViewStyle,
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.xs,
    ...({ cursor: 'pointer' } as any),
  } as ViewStyle,
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: V2_COLORS.text,
    flex: 1,
    textAlign: 'center',
  } as TextStyle,
});
