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
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, GRADIENTS } from '@/providers/ThemeProvider';
import { BackgroundBlobs } from '@/components/common';
import { apiClient } from '@/lib/api';
import { showAlert } from '@/lib/alert';

export default function TermsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await apiClient.post('/users/me/accept-tos');
      showAlert(t('common.success'), t('profile.tosAccepted'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } catch {
      showAlert(t('common.errorTitle'), t('profile.tosAcceptFailed'));
    } finally {
      setAccepting(false);
    }
  };

  const TERMS_SECTIONS = [
    {
      icon: 'shield-checkmark-outline' as const,
      textKey: 'profile.tosUserResponsibilities',
      color: V2_COLORS.accent1,
    },
    {
      icon: 'cube-outline' as const,
      textKey: 'profile.tosProhibitedItems',
      color: V2_COLORS.accent2,
    },
    { icon: 'cash-outline' as const, textKey: 'profile.tosPaymentTerms', color: V2_COLORS.primary },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={20}
            color={V2_COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.termsOfService')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>{t('profile.tosTitle')}</Text>
        <Text style={styles.body}>{t('profile.tosBody')}</Text>

        {TERMS_SECTIONS.map((section, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.cardIcon, { backgroundColor: section.color + '15' }]}>
              <Ionicons name={section.icon} size={22} color={section.color} />
            </View>
            <Text style={styles.cardText}>{t(section.textKey)}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Accept Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleAccept}
          disabled={accepting}
          style={{ opacity: accepting ? 0.7 : 1 }}
        >
          <LinearGradient
            colors={[...GRADIENTS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.acceptBtn}
          >
            {accepting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.acceptText}>{t('profile.acceptTos')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  } as ViewStyle,
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: V2_COLORS.text,
  } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: V2_COLORS.text,
  } as TextStyle,
  body: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
    color: V2_COLORS.textSoft,
  } as TextStyle,
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: RADIUS.card,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  cardText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: V2_COLORS.text,
  } as TextStyle,
  bottomBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  acceptBtn: {
    height: 52,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  acceptText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
