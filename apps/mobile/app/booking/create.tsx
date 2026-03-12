import { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { useListing } from '@/hooks/useListings';
import { useCreateBooking, BookingItemParam } from '@/hooks/useBookings';
import { WizardContainer, WizardStepConfig } from '@/components/wizard/WizardContainer';
import { SuccessCelebration } from '@/components/animations';
import { ItemDetailsStep } from '@/components/wizard/booking/ItemDetailsStep';
import { WeightValueStep } from '@/components/wizard/booking/WeightValueStep';
import { PhotosStep } from '@/components/wizard/booking/PhotosStep';
import { PickupStep } from '@/components/wizard/booking/PickupStep';
import { ReviewBookStep } from '@/components/wizard/booking/ReviewBookStep';
import { MOCK_LISTINGS, adaptMockListing } from '@/components/listings';
import { validateWeight } from '@luggageshare/shared';
import { showAlert } from '@/lib/alert';

const BOOKING_STEPS: WizardStepConfig[] = [
  {
    component: ItemDetailsStep,
    validate: (data) => !!data.itemName?.trim(),
  },
  {
    component: WeightValueStep,
    validate: (data) => !!data.weight && parseFloat(data.weight) > 0,
  },
  {
    component: PhotosStep,
    canSkip: true,
  },
  {
    component: PickupStep,
    validate: (data) => !!data.pickupLocation?.trim(),
  },
  {
    component: ReviewBookStep,
  },
];

export default function CreateBookingScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: apiListing, isLoading: listingLoading } = useListing(listingId ?? null);
  const createBooking = useCreateBooking();

  // Fall back to mock data when API doesn't return a result
  const mockMatch =
    !apiListing && listingId ? MOCK_LISTINGS.find((m) => m.id === listingId) : undefined;
  const listing = apiListing ?? (mockMatch ? adaptMockListing(mockMatch) : undefined);

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const listingPrice = listing ? Number(listing.price) || 0 : 0;

  const handleComplete = useCallback(
    async (data: Record<string, any>) => {
      if (!listingId) {
        showAlert(t('common.errorTitle'), 'Missing listing ID');
        return;
      }

      const weight = parseFloat(data.weight) || 0;

      if (weight <= 0) {
        showAlert(t('common.errorTitle'), t('booking.pleaseEnterWeight'));
        return;
      }

      const weightCheck = validateWeight(weight);
      if (!weightCheck.valid) {
        showAlert(t('common.errorTitle'), weightCheck.error!);
        return;
      }

      const availableWeight = listing ? Number(listing.availableWeight) || 0 : 0;
      if (listing && availableWeight > 0 && weight > availableWeight) {
        showAlert(
          t('common.errorTitle'),
          `Weight (${weight}kg) exceeds available (${availableWeight}kg)`
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const bookingItems: BookingItemParam[] = [
          {
            name: (data.itemName || '').trim(),
            description: (data.description || '').trim() || undefined,
            weight,
            value: parseFloat(data.declaredValue) || 0,
            imageUrls: data.imageUrls?.length > 0 ? data.imageUrls : undefined,
          },
        ];

        await createBooking.mutateAsync({
          listingId,
          totalWeight: weight,
          items: bookingItems,
        });

        setShowSuccess(true);
      } catch (error: any) {
        const apiMsg = error?.response?.data?.message;
        showAlert(t('common.errorTitle'), apiMsg || t('booking.failedToSend'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [listingId, listing, createBooking, t]
  );

  const handleSuccessDone = useCallback(() => {
    setShowSuccess(false);
    router.replace('/(tabs)/trips');
  }, [router]);

  // Loading state
  if (listingLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Not found state
  if (!listing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={{ color: colors.textSecondary }}>{t('listing.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isSubmitting) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <WizardContainer
        steps={BOOKING_STEPS}
        onComplete={handleComplete}
        title={t('booking.bookListing')}
        initialData={{
          // Pass listing context into wizard data for the review step
          carrierName: listing.carrier?.name,
          carrierVerified: listing.carrier?.isVerified,
          departureCity: listing.departureCity,
          arrivalCity: listing.arrivalCity,
          listingPrice,
        }}
      />

      <SuccessCelebration
        visible={showSuccess}
        message={t('booking.bookingSent')}
        onComplete={handleSuccessDone}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
