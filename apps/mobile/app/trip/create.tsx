import { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { useCreateTrip } from '@/hooks/useTrips';
import { WizardContainer, WizardStepConfig } from '@/components/wizard/WizardContainer';
import { SuccessCelebration } from '@/components/animations';
import { RouteStep } from '@/components/wizard/listing/RouteStep';
import { TransportStep } from '@/components/wizard/trip/TransportStep';
import { TripDateStep } from '@/components/wizard/trip/TripDateStep';
import { WeightStep } from '@/components/wizard/listing/WeightStep';
import { TripPricingStep } from '@/components/wizard/trip/TripPricingStep';
import { PreferencesStep } from '@/components/wizard/listing/PreferencesStep';
import { TripReviewStep } from '@/components/wizard/trip/TripReviewStep';
import { showAlert } from '@/lib/alert';

const TRIP_STEPS: WizardStepConfig[] = [
  {
    component: RouteStep,
    validate: (data) => !!data.departureCity?.trim() && !!data.arrivalCity?.trim(),
  },
  {
    component: TransportStep,
    validate: (data) => !!data.transportType,
  },
  {
    component: TripDateStep,
    validate: (data) => !!data.departureDate,
  },
  {
    component: WeightStep,
    validate: (data) => !!data.availableWeight && parseFloat(data.availableWeight) > 0,
  },
  {
    component: TripPricingStep,
    canSkip: true,
  },
  {
    component: PreferencesStep,
    canSkip: true,
  },
  {
    component: TripReviewStep,
  },
];

export default function CreateTripScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const createTrip = useCreateTrip();

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = useCallback(
    async (data: Record<string, any>) => {
      const departureDate =
        data.departureDate instanceof Date ? data.departureDate : new Date(data.departureDate);

      if (isNaN(departureDate.getTime())) {
        showAlert(t('common.errorTitle'), t('listing.departureDateRequired'));
        return;
      }

      setIsSubmitting(true);
      try {
        const preferences: Record<string, unknown> = {};
        if (data.acceptedCategories?.length) {
          preferences.acceptedCategories = data.acceptedCategories;
        }

        await createTrip.mutateAsync({
          departureCity: data.departureCity,
          departureCode: data.departureCode || undefined,
          arrivalCity: data.arrivalCity,
          arrivalCode: data.arrivalCode || undefined,
          departureDate: departureDate.toISOString(),
          transportType: data.transportType || 'flight',
          flightNumber: data.flightNumber || undefined,
          availableWeight: parseFloat(data.availableWeight),
          suggestedPrice: data.suggestedPrice ? parseFloat(String(data.suggestedPrice)) : undefined,
          currency: data.currency || undefined,
          notes: data.notes || undefined,
          preferences: Object.keys(preferences).length > 0 ? preferences : undefined,
        });

        setShowSuccess(true);
      } catch (error: any) {
        const apiMsg = error?.response?.data?.message;
        showAlert(t('common.errorTitle'), apiMsg || t('tripWizard.failedCreate'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [createTrip, t]
  );

  const handleSuccessDone = useCallback(() => {
    setShowSuccess(false);
    router.back();
  }, [router]);

  if (isSubmitting) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <WizardContainer
        steps={TRIP_STEPS}
        onComplete={handleComplete}
        title={t('tripWizard.title', { defaultValue: 'Post a Trip' })}
        initialData={{
          transportType: 'flight',
          availableWeight: '5',
        }}
      />

      <SuccessCelebration
        visible={showSuccess}
        message={t('tripWizard.createdSuccess', { defaultValue: 'Your trip is live!' })}
        onComplete={handleSuccessDone}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
