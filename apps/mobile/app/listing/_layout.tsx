import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';

export default function ListingLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          title: t('listing.createListing'),
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
