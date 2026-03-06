import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { useGoBack } from '@/hooks/useGoBack';
import { StepIndicator } from './StepIndicator';
import { WizardStep } from './WizardStep';

export interface StepProps {
  data: Record<string, any>;
  updateData: (partial: Record<string, any>) => void;
  goNext: () => void;
  goBack: () => void;
}

export interface WizardStepConfig {
  component: React.ComponentType<StepProps>;
  canSkip?: boolean;
  validate?: (data: Record<string, any>) => boolean | string;
  /** Ionicons icon name shown in the step indicator circle */
  icon?: string;
}

interface WizardContainerProps {
  steps: WizardStepConfig[];
  onComplete: (data: Record<string, any>) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  title?: string;
}

export function WizardContainer({
  steps,
  onComplete,
  onCancel,
  initialData = {},
  title,
}: WizardContainerProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const goBackFallback = useGoBack();
  const isRTL = i18n.language === 'ar';

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [wizardData, setWizardData] = useState<Record<string, any>>(initialData);
  const [maxVisited, setMaxVisited] = useState(0);

  const updateData = useCallback((partial: Record<string, any>) => {
    setWizardData((prev) => ({ ...prev, ...partial }));
  }, []);

  /* ── Compute validation errors for all visited steps ── */
  const stepErrors = useMemo(() => {
    return steps.map((step, i) => {
      if (i > maxVisited || i === currentStep) return null;
      if (!step.validate) return null;
      const result = step.validate(wizardData);
      if (result === true) return null;
      if (typeof result === 'string') return result;
      if (result === false) return 'Invalid';
      return null;
    });
  }, [steps, wizardData, maxVisited, currentStep]);

  const stepIcons = useMemo(() => steps.map((s) => s.icon || 'ellipse'), [steps]);

  const goNext = useCallback(() => {
    const config = steps[currentStep];

    // Validate current step
    if (config.validate) {
      const result = config.validate(wizardData);
      if (result !== true && typeof result === 'string') return;
      if (result === false) return;
    }

    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setDirection('forward');
      setCurrentStep(next);
      setMaxVisited((prev) => Math.max(prev, next));
    } else {
      onComplete(wizardData);
    }
  }, [currentStep, steps, wizardData, onComplete]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep((s) => s - 1);
    } else {
      if (onCancel) onCancel();
      else goBackFallback();
    }
  }, [currentStep, onCancel, goBackFallback]);

  const goToStep = useCallback(
    (index: number) => {
      if (index === currentStep) return;
      if (index > maxVisited) return;
      setDirection(index > currentStep ? 'forward' : 'backward');
      setCurrentStep(index);
    },
    [currentStep, maxVisited]
  );

  const stepProps: StepProps = useMemo(
    () => ({
      data: wizardData,
      updateData,
      goNext,
      goBack,
    }),
    [wizardData, updateData, goNext, goBack]
  );

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={goBack} style={styles.headerButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title || ''}</Text>
        <Pressable onPress={onCancel ?? goBackFallback} style={styles.headerButton} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Step Indicator */}
      <StepIndicator
        totalSteps={steps.length}
        currentStep={currentStep}
        stepIcons={stepIcons}
        stepErrors={stepErrors}
        onStepPress={goToStep}
        maxVisited={maxVisited}
      />

      {/* Step Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <WizardStep key={currentStep} direction={direction} isRTL={isRTL}>
            <CurrentStepComponent {...stepProps} />
          </WizardStep>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    ...({ cursor: 'pointer' } as any),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
});
