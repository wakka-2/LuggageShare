import { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { useCreateListing } from '@/hooks/useListings';
import { WizardContainer, WizardStepConfig } from '@/components/wizard/WizardContainer';
import { SuccessCelebration } from '@/components/animations';
import { RouteStep } from '@/components/wizard/listing/RouteStep';
import { DateFlightStep } from '@/components/wizard/listing/DateFlightStep';
import { WeightStep } from '@/components/wizard/listing/WeightStep';
import { PricingStep } from '@/components/wizard/listing/PricingStep';
import { PreferencesStep } from '@/components/wizard/listing/PreferencesStep';
import { ReviewStep } from '@/components/wizard/listing/ReviewStep';
import { validateListing } from '@luggageshare/shared';
import { showAlert } from '@/lib/alert';

const LISTING_STEPS: WizardStepConfig[] = [
  {
    component: RouteStep,
    validate: (data) => !!data.departureCity?.trim() && !!data.arrivalCity?.trim(),
    icon: 'airplane',
  },
  {
    component: DateFlightStep,
    validate: (data) => {
      if (!data.departureDate) return false;
      const d = new Date(data.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) return 'Past date';
      return true;
    },
    icon: 'calendar',
  },
  {
    component: WeightStep,
    validate: (data) => !!data.availableWeight && parseFloat(data.availableWeight) > 0,
    icon: 'scale',
  },
  {
    component: PricingStep,
    validate: (data) => !!data.price && parseFloat(data.price) > 0,
    icon: 'cash',
  },
  {
    component: PreferencesStep,
    canSkip: true,
    icon: 'options',
  },
  {
    component: ReviewStep,
    icon: 'checkmark-done',
  },
];

export default function CreateListingScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const createListing = useCreateListing();

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = useCallback(
    async (data: Record<string, any>) => {
      // Build departure date
      const departureDate =
        data.departureDate instanceof Date ? data.departureDate : new Date(data.departureDate);

      const validation = validateListing({
        departureCity: data.departureCity,
        arrivalCity: data.arrivalCity,
        departureDate,
        availableWeight: parseFloat(data.availableWeight) || 0,
        price: parseFloat(data.price) || 0,
      });

      if (!validation.valid) {
        showAlert(t('common.errorTitle'), validation.errors.join('\n'));
        return;
      }

      setIsSubmitting(true);
      try {
        // Build preferences from selected categories
        const preferences: Record<string, unknown> = {};
        if (data.acceptedCategories?.length) {
          preferences.acceptedCategories = data.acceptedCategories;
        }

        await createListing.mutateAsync({
          departureCity: data.departureCity,
          departureCode: data.departureCode || undefined,
          arrivalCity: data.arrivalCity,
          arrivalCode: data.arrivalCode || undefined,
          departureDate: departureDate.toISOString(),
          flightNumber: data.flightNumber || undefined,
          availableWeight: parseFloat(data.availableWeight),
          price: parseFloat(data.price),
          notes: data.notes || undefined,
          preferences: Object.keys(preferences).length > 0 ? preferences : undefined,
        });

        setShowSuccess(true);
      } catch (error) {
        showAlert(t('common.errorTitle'), t('listing.failedCreate'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [createListing, t]
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
        steps={LISTING_STEPS}
        onComplete={handleComplete}
        title={t('listing.create', { defaultValue: 'Create Listing' })}
        initialData={{
          price: '25',
          availableWeight: '5',
        }}
      />

      <SuccessCelebration
        visible={showSuccess}
        message={t('listing.createdSuccess', { defaultValue: 'Your listing is live!' })}
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
