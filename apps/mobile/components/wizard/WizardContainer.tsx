import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { WizardProgress } from './WizardProgress';
import { WizardStep } from './WizardStep';
import { AnimatedButton } from '@/components/animations/AnimatedButton';

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
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [wizardData, setWizardData] = useState<Record<string, any>>(initialData);

  const updateData = useCallback((partial: Record<string, any>) => {
    setWizardData((prev) => ({ ...prev, ...partial }));
  }, []);

  const goNext = useCallback(() => {
    const config = steps[currentStep];

    // Validate current step
    if (config.validate) {
      const result = config.validate(wizardData);
      if (result !== true && typeof result === 'string') {
        // Validation failed with error message — don't advance
        return;
      }
      if (result === false) return;
    }

    if (currentStep < steps.length - 1) {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
    } else {
      // Final step — complete
      onComplete(wizardData);
    }
  }, [currentStep, steps, wizardData, onComplete]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep((s) => s - 1);
    } else {
      // First step — cancel the wizard
      if (onCancel) {
        onCancel();
      } else {
        router.back();
      }
    }
  }, [currentStep, onCancel, router]);

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
        <TouchableOpacity onPress={goBack} style={styles.headerButton}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title || ''}</Text>
        <TouchableOpacity onPress={onCancel ?? (() => router.back())} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <WizardProgress currentStep={currentStep} totalSteps={steps.length} />

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
