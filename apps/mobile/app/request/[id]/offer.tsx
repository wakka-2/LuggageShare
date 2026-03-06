import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useGoBack } from '@/hooks/useGoBack';
import { useRequest } from '@/hooks/useRequests';
import { useCreateRequestOffer } from '@/hooks/useOffers';
import { ScreenHeader } from '@/components/common';
import { showAlert } from '@/lib/alert';

export default function RequestOfferScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const goBack = useGoBack();
  const isRTL = i18n.language === 'ar';

  const { data: request } = useRequest(id ?? null);
  const createOffer = useCreateRequestOffer(id ?? '');

  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!id) return;

    const p = parseFloat(price);
    if (!p || p <= 0) {
      showAlert(
        t('common.errorTitle'),
        t('offers.priceRequired', { defaultValue: 'Please enter your offered price' })
      );
      return;
    }

    setSubmitting(true);
    try {
      await createOffer.mutateAsync({
        offeredPrice: p,
        offeredWeight: request?.weight ?? 0,
        message: message.trim() || undefined,
      });
      showAlert(
        t('common.success'),
        t('offers.offerSent', { defaultValue: 'Your offer has been sent!' })
      );
      goBack();
    } catch (error: any) {
      const apiMsg = error?.response?.data?.message;
      showAlert(
        t('common.errorTitle'),
        apiMsg || t('offers.failedSend', { defaultValue: 'Failed to send offer' })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('offers.offerToCarry', { defaultValue: 'Offer to Carry' })}
        onBack={goBack}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Request Summary */}
          {request && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={[
                styles.summaryCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.routeRow}>
                <Text style={[styles.cityCode, { color: colors.primary }]}>
                  {request.departureCode || request.departureCity.slice(0, 3).toUpperCase()}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
                <Text style={[styles.cityCode, { color: colors.primary }]}>
                  {request.arrivalCode || request.arrivalCity.slice(0, 3).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.summaryDetail, { color: colors.textSecondary }]}>
                {request.weight} kg
                {request.budget
                  ? ` • ${t('offers.budgetLabel', { defaultValue: 'Budget' })}: ${request.budget} ${request.currency}`
                  : ''}
              </Text>
              {request.description && (
                <Text style={[styles.descriptionText, { color: colors.text }]} numberOfLines={2}>
                  {request.description}
                </Text>
              )}
            </Animated.View>
          )}

          {/* Price */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t('offers.price', { defaultValue: 'Your Price (SAR)' })}
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
              ]}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder={request?.budget ? String(request.budget) : '25'}
              placeholderTextColor={colors.textSecondary}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </Animated.View>

          {/* Message */}
          <Animated.View entering={FadeInDown.delay(150)} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t('offers.message', { defaultValue: 'Message (optional)' })}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
              ]}
              value={message}
              onChangeText={setMessage}
              placeholder={t('offers.carrierMessagePlaceholder', {
                defaultValue: 'Tell the sender about your trip details...',
              })}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </Animated.View>
        </ScrollView>

        {/* Submit Button */}
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={[
              styles.submitBtn,
              { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="hand-left-outline" size={18} color="#fff" />
                <Text style={styles.submitText}>
                  {t('offers.sendOffer', { defaultValue: 'Send Offer' })}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  content: { padding: 16 } as ViewStyle,
  summaryCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  } as ViewStyle,
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  } as ViewStyle,
  cityCode: { fontSize: 18, fontWeight: '700' } as TextStyle,
  summaryDetail: { fontSize: 13 } as TextStyle,
  descriptionText: { fontSize: 13, marginTop: 6 } as TextStyle,
  field: { marginBottom: 20 } as ViewStyle,
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 } as TextStyle,
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  } as TextStyle,
  textArea: { height: 80, paddingVertical: 12 } as TextStyle,
  bottomBar: { padding: 16, borderTopWidth: 1 } as ViewStyle,
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  } as ViewStyle,
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' } as TextStyle,
});
