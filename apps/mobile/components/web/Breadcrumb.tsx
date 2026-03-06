import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { V2_COLORS, RADIUS } from '@/providers/ThemeProvider';

const ROUTE_LABELS: Record<string, string> = {
  '(tabs)': 'web.breadcrumb.home',
  index: 'web.breadcrumb.home',
  trips: 'web.breadcrumb.trips',
  messages: 'web.breadcrumb.messages',
  profile: 'web.breadcrumb.profile',
  listing: 'web.breadcrumb.listing',
  booking: 'web.breadcrumb.booking',
  chat: 'web.breadcrumb.chat',
  notifications: 'web.breadcrumb.notifications',
  create: 'web.breadcrumb.create',
  edit: 'web.breadcrumb.edit',
  wallet: 'web.breadcrumb.wallet',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumb items with accumulated paths
  const crumbs: { label: string; path: string }[] = [
    { label: t('web.breadcrumb.home'), path: '/' },
  ];

  let accumulated = '';
  for (const seg of segments) {
    accumulated += `/${seg}`;
    // Skip (tabs) group segment and dynamic ID segments
    if (seg === '(tabs)') continue;
    const key = ROUTE_LABELS[seg] ? seg : null;
    if (key) {
      crumbs.push({ label: t(ROUTE_LABELS[key]), path: accumulated });
    } else if (/^\[.*\]$/.test(seg)) {
      // Dynamic segment like [id] — skip label
      continue;
    } else {
      // Unknown segment — show as-is (likely a dynamic param value)
      crumbs.push({ label: `#${seg.slice(0, 8)}`, path: accumulated });
    }
  }

  // Don't render if we're on home
  if (crumbs.length <= 1) return null;

  return (
    <View style={styles.container}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <View key={crumb.path} style={styles.crumbRow}>
            {index > 0 && (
              <Ionicons
                name="chevron-forward"
                size={14}
                color={V2_COLORS.textMuted}
                style={styles.separator}
              />
            )}
            {isLast ? (
              <View style={styles.activeCrumb}>
                <Text style={styles.activeLabel} numberOfLines={1}>
                  {crumb.label}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => router.push(crumb.path as any)}
                style={styles.crumbButton}
              >
                <Text style={styles.clickableLabel} numberOfLines={1}>
                  {crumb.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  crumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: 6,
  },
  crumbButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    ...({ cursor: 'pointer' } as any),
  },
  clickableLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: V2_COLORS.primary,
  },
  activeCrumb: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: V2_COLORS.primary + '10',
  },
  activeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: V2_COLORS.text,
  },
});
