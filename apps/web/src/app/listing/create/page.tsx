'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateListing } from '@/hooks/useListings';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import WizardContainer from '@/components/wizard/WizardContainer';
import type { WizardStepConfig } from '@/components/wizard/WizardContainer';
import RouteStep from '@/components/wizard/steps/RouteStep';
import DateFlightStep from '@/components/wizard/steps/DateFlightStep';
import WeightStep from '@/components/wizard/steps/WeightStep';
import PricingStep from '@/components/wizard/steps/PricingStep';
import PreferencesStep from '@/components/wizard/steps/PreferencesStep';
import ReviewStep from '@/components/wizard/steps/ReviewStep';

const LISTING_STEPS: WizardStepConfig[] = [
  {
    component: RouteStep,
    validate: (d) => !!(d.departureCity as string)?.trim() && !!(d.arrivalCity as string)?.trim(),
  },
  {
    component: DateFlightStep,
    validate: (d) => !!(d.departureDate as string),
  },
  {
    component: WeightStep,
    validate: (d) => !!(d.availableWeight as number) && (d.availableWeight as number) > 0,
  },
  {
    component: PricingStep,
    validate: (d) => !!(d.price as number) && (d.price as number) > 0,
  },
  {
    component: PreferencesStep,
    canSkip: true,
  },
  {
    component: ReviewStep,
  },
];

export default function CreateListingPage() {
  const router = useRouter();
  const createListing = useCreateListing();
  const [error, setError] = useState<string | null>(null);

  const handleComplete = useCallback(
    async (data: Record<string, unknown>) => {
      setError(null);
      try {
        await createListing.mutateAsync({
          departureCity: data.departureCity as string,
          arrivalCity: data.arrivalCity as string,
          departureDate: new Date(data.departureDate as string).toISOString(),
          flightNumber: (data.flightNumber as string) || undefined,
          availableWeight: Number(data.availableWeight),
          price: Number(data.price),
          currency: 'SAR',
          notes: (data.notes as string) || undefined,
        });
        router.push('/');
      } catch {
        setError('Failed to create listing');
      }
    },
    [createListing, router]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ProtectedRoute>
      {error && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center">
          <div className="bg-v2-secondary/10 text-v2-secondary px-6 py-3 rounded-full text-sm font-medium shadow-bubble-sm">
            {error}
          </div>
        </div>
      )}
      <WizardContainer
        steps={LISTING_STEPS}
        onComplete={handleComplete}
        onCancel={handleCancel}
        initialData={{ price: 25, availableWeight: 5 }}
        title={undefined}
      />
    </ProtectedRoute>
  );
}
