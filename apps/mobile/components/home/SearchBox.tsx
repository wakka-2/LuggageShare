import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';

export function SearchBox() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* From / To */}
      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <View style={styles.routeIconContainer}>
            <View style={[styles.routeIcon, { backgroundColor: colors.success }]} />
          </View>
          <TouchableOpacity style={styles.routeInput}>
            <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>
              {t('home.from')}
            </Text>
            <Text style={[styles.routeValue, { color: colors.text }]}>
              الرياض - Riyadh
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.swapButton}>
          <Ionicons name="swap-vertical" size={20} color={colors.primary} />
        </View>

        <View style={styles.routeRow}>
          <View style={styles.routeIconContainer}>
            <View style={[styles.routeIcon, { backgroundColor: colors.error }]} />
          </View>
          <TouchableOpacity style={styles.routeInput}>
            <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>
              {t('home.to')}
            </Text>
            <Text style={[styles.routeValue, { color: colors.text }]}>
              القاهرة - Cairo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Date / Weight */}
      <View style={styles.detailsContainer}>
        <TouchableOpacity style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <View style={styles.detailText}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('home.date')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              15 Feb 2026
            </Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.detailItem}>
          <Ionicons name="scale-outline" size={20} color={colors.primary} />
          <View style={styles.detailText}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('home.weight')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              5 {t('home.kg')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Button */}
      <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.primary }]}>
        <Ionicons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.searchButtonText}>{t('home.searchButton')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  routeContainer: {
    padding: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  routeIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeInput: {
    flex: 1,
    paddingVertical: 8,
  },
  routeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  routeValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  swapButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
