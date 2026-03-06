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
import { useTrip } from '@/hooks/useTrips';
import { useCreateTripOffer } from '@/hooks/useOffers';
import { ScreenHeader } from '@/components/common';
import { showAlert } from '@/lib/alert';

export default function TripOfferScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const goBack = useGoBack();
  const isRTL = i18n.language === 'ar';

  const { data: trip } = useTrip(id ?? null);
  const createOffer = useCreateTripOffer(id ?? '');

  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!id) return;

    const w = parseFloat(weight);
    const p = parseFloat(price);

    if (!w || w <= 0) {
      showAlert(
        t('common.errorTitle'),
        t('offers.weightRequired', { defaultValue: 'Please enter weight' })
      );
      return;
    }
    if (!p || p <= 0) {
      showAlert(
        t('common.errorTitle'),
        t('offers.priceRequired', { defaultValue: 'Please enter your offered price' })
      );
      return;
    }

    if (trip && w > Number(trip.remainingWeight)) {
      showAlert(
        t('common.errorTitle'),
        t('offers.weightExceeds', {
          defaultValue: `Weight exceeds available (${Number(trip.remainingWeight)} kg)`,
        })
      );
      return;
    }

    setSubmitting(true);
    try {
      await createOffer.mutateAsync({
        offeredWeight: w,
        offeredPrice: p,
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
        title={t('offers.makeOffer', { defaultValue: 'Make an Offer' })}
        onBack={goBack}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Trip Summary */}
          {trip && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={[
                styles.summaryCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.routeRow}>
                <Text style={[styles.cityCode, { color: colors.primary }]}>
                  {trip.departureCode || trip.departureCity.slice(0, 3).toUpperCase()}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
                <Text style={[styles.cityCode, { color: colors.primary }]}>
                  {trip.arrivalCode || trip.arrivalCity.slice(0, 3).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.summaryDetail, { color: colors.textSecondary }]}>
                {Number(trip.remainingWeight)} kg{' '}
                {t('offers.available', { defaultValue: 'available' })}
                {trip.suggestedPrice
                  ? ` • ${Number(trip.suggestedPrice)} ${trip.currency} ${t('offers.suggested', { defaultValue: 'suggested' })}`
                  : ''}
              </Text>
            </Animated.View>
          )}

          {/* Weight */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t('offers.weight', { defaultValue: 'Weight (kg)' })}
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
              ]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="3"
              placeholderTextColor={colors.textSecondary}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </Animated.View>

          {/* Price */}
          <Animated.View entering={FadeInDown.delay(150)} style={styles.field}>
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
              placeholder={trip?.suggestedPrice ? String(Number(trip.suggestedPrice)) : '25'}
              placeholderTextColor={colors.textSecondary}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </Animated.View>

          {/* Message */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.field}>
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
              placeholder={t('offers.messagePlaceholder', {
                defaultValue: 'Tell the carrier about your items...',
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
                <Ionicons name="send" size={18} color="#fff" />
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
