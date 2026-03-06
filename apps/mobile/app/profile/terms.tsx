import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useGoBack } from '@/hooks/useGoBack';
import { ScreenHeader } from '@/components/common';
import { apiClient } from '@/lib/api';
import { showAlert } from '@/lib/alert';

export default function TermsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const goBack = useGoBack();
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await apiClient.post('/users/me/accept-tos');
      showAlert(t('common.success'), t('profile.tosAccepted'), [
        { text: t('common.ok'), onPress: goBack },
      ]);
    } catch {
      showAlert(t('common.errorTitle'), t('profile.tosAcceptFailed'));
    } finally {
      setAccepting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('profile.termsOfService')} onBack={goBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.tosTitle')}</Text>

        <Text style={[styles.body, { color: colors.textSecondary }]}>{t('profile.tosBody')}</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
          <Text style={[styles.cardText, { color: colors.text }]}>
            {t('profile.tosUserResponsibilities')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Ionicons name="cube-outline" size={24} color={colors.primary} />
          <Text style={[styles.cardText, { color: colors.text }]}>
            {t('profile.tosProhibitedItems')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Ionicons name="cash-outline" size={24} color={colors.primary} />
          <Text style={[styles.cardText, { color: colors.text }]}>
            {t('profile.tosPaymentTerms')}
          </Text>
        </View>
      </ScrollView>

      <View
        style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}
      >
        <TouchableOpacity
          onPress={handleAccept}
          disabled={accepting}
          style={[
            styles.acceptBtn,
            { backgroundColor: colors.primary, opacity: accepting ? 0.7 : 1 },
          ]}
        >
          {accepting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.acceptText}>{t('profile.acceptTos')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  } as ViewStyle,
  headerBtn: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 } as TextStyle,
  body: { fontSize: 14, lineHeight: 22, marginBottom: 24 } as TextStyle,
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  } as ViewStyle,
  cardText: { flex: 1, fontSize: 14, lineHeight: 20 } as TextStyle,
  bottomBar: { padding: 16, borderTopWidth: 1 } as ViewStyle,
  acceptBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  acceptText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
