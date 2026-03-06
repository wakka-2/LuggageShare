import { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { useCreateRequest } from '@/hooks/useRequests';
import { WizardContainer, WizardStepConfig } from '@/components/wizard/WizardContainer';
import { SuccessCelebration } from '@/components/animations';
import { RouteStep } from '@/components/wizard/listing/RouteStep';
import { DateFlightStep } from '@/components/wizard/listing/DateFlightStep';
import { WeightDescriptionStep } from '@/components/wizard/request/WeightDescriptionStep';
import { BudgetStep } from '@/components/wizard/request/BudgetStep';
import { ProhibitedItemsStep } from '@/components/wizard/request/ProhibitedItemsStep';
import { RequestReviewStep } from '@/components/wizard/request/RequestReviewStep';
import { showAlert } from '@/lib/alert';

const REQUEST_STEPS: WizardStepConfig[] = [
  {
    component: RouteStep,
    validate: (data) => !!data.departureCity?.trim() && !!data.arrivalCity?.trim(),
  },
  {
    component: DateFlightStep,
    validate: (data) => !!data.departureDate,
  },
  {
    component: WeightDescriptionStep,
    validate: (data) => !!data.weight && parseFloat(data.weight) > 0,
  },
  {
    component: BudgetStep,
    canSkip: true,
  },
  {
    component: ProhibitedItemsStep,
    validate: (data) => data.prohibitedItemsDeclared === true,
  },
  {
    component: RequestReviewStep,
  },
];

export default function CreateRequestScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const createRequest = useCreateRequest();

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = useCallback(
    async (data: Record<string, any>) => {
      const neededByDate =
        data.departureDate instanceof Date ? data.departureDate : new Date(data.departureDate);

      if (isNaN(neededByDate.getTime())) {
        showAlert(t('common.errorTitle'), t('listing.departureDateRequired'));
        return;
      }

      if (data.prohibitedItemsDeclared !== true) {
        showAlert(
          t('common.errorTitle'),
          t('requestWizard.prohibited.mustDeclare', {
            defaultValue: 'You must declare that your items are not prohibited',
          })
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const itemTypes = data.itemTypesText
          ? data.itemTypesText
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : undefined;

        await createRequest.mutateAsync({
          departureCity: data.departureCity,
          departureCode: data.departureCode || undefined,
          arrivalCity: data.arrivalCity,
          arrivalCode: data.arrivalCode || undefined,
          neededByDate: neededByDate.toISOString(),
          weight: parseFloat(data.weight),
          budget: data.budget ? parseFloat(data.budget) : undefined,
          currency: data.currency || undefined,
          description: data.description || undefined,
          itemTypes: itemTypes,
          prohibitedItemsDeclared: true,
        });

        setShowSuccess(true);
      } catch (error: any) {
        const apiMsg = error?.response?.data?.message;
        showAlert(t('common.errorTitle'), apiMsg || t('requestWizard.failedCreate'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [createRequest, t]
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
        steps={REQUEST_STEPS}
        onComplete={handleComplete}
        title={t('requestWizard.title', { defaultValue: 'Post a Request' })}
        initialData={{
          weight: '5',
          currency: 'SAR',
          neededByDate: undefined,
        }}
      />

      <SuccessCelebration
        visible={showSuccess}
        message={t('requestWizard.createdSuccess', {
          defaultValue: 'Your request is live!',
        })}
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
