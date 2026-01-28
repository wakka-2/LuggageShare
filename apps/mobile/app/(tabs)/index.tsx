import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { SearchBox, PopularRoutes, RecentTrips } from '@/components/home';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {t('home.greeting')}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('home.title')}
          </Text>
        </View>

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <SearchBox />
        </View>

        {/* Popular Routes */}
        <PopularRoutes />

        {/* Recent Trips */}
        <RecentTrips />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
});
