'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface StepProps {
  data: Record<string, unknown>;
  updateData: (partial: Record<string, unknown>) => void;
  goNext: () => void;
  goBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export interface WizardStepConfig {
  component: React.ComponentType<StepProps>;
  canSkip?: boolean;
  validate?: (data: Record<string, unknown>) => boolean;
}

interface WizardContainerProps {
  steps: WizardStepConfig[];
  onComplete: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  initialData?: Record<string, unknown>;
  title?: string;
}

/* ------------------------------------------------------------------ */
/*  WizardContainer                                                    */
/* ------------------------------------------------------------------ */
export default function WizardContainer({
  steps,
  onComplete,
  onCancel,
  initialData = {},
  title,
}: WizardContainerProps) {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';

  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Record<string, unknown>>(initialData);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [animating, setAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateData = useCallback((partial: Record<string, unknown>) => {
    setWizardData((prev) => ({ ...prev, ...partial }));
  }, []);

  const goNext = useCallback(() => {
    if (animating) return;
    const config = steps[currentStep];

    // Validate if validator exists
    if (config.validate && !config.validate(wizardData)) return;

    if (currentStep === totalSteps - 1) {
      onComplete(wizardData);
      return;
    }

    setDirection('forward');
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep((s) => s + 1);
      setAnimating(false);
    }, 250);
  }, [animating, currentStep, steps, wizardData, totalSteps, onComplete]);

  const goBack = useCallback(() => {
    if (animating) return;
    if (currentStep === 0) {
      onCancel();
      return;
    }
    setDirection('backward');
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep((s) => s - 1);
      setAnimating(false);
    }, 250);
  }, [animating, currentStep, onCancel]);

  // Scroll to top on step change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const StepComponent = steps[currentStep].component;

  // Determine slide direction accounting for RTL
  const slideForward = direction === 'forward';
  const slideClass = animating
    ? slideForward
      ? isRTL
        ? 'wizard-slide-out-right'
        : 'wizard-slide-out-left'
      : isRTL
        ? 'wizard-slide-out-left'
        : 'wizard-slide-out-right'
    : slideForward
      ? isRTL
        ? 'wizard-slide-in-left'
        : 'wizard-slide-in-right'
      : isRTL
        ? 'wizard-slide-in-right'
        : 'wizard-slide-in-left';

  return (
    <div className="min-h-screen flex flex-col bg-v2-bg">
      {/* ---- Header ---- */}
      <div className="bg-white shadow-bubble-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full bg-v2-bg flex items-center justify-center text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/10 transition-all flex-shrink-0"
          aria-label={currentStep === 0 ? t('common.cancel') : t('wp.back')}
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0 text-center">
          <h1 className="text-sm font-bold text-v2-text truncate">
            {title || t('listing.create')}
          </h1>
        </div>

        <button
          onClick={onCancel}
          className="w-9 h-9 rounded-full bg-v2-bg flex items-center justify-center text-v2-text-soft hover:text-v2-secondary hover:bg-v2-secondary/10 transition-all flex-shrink-0"
          aria-label={t('common.cancel')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ---- Progress Bar ---- */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-v2-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full v2-gradient-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-v2-primary bg-v2-primary/10 px-2.5 py-1 rounded-full flex-shrink-0">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>
      </div>

      {/* ---- Step Content ---- */}
      <div ref={contentRef} className="flex-1">
        <div className="max-w-2xl mx-auto w-full px-4 py-6">
          <div key={currentStep} className={`wizard-step ${slideClass}`}>
            <StepComponent
              data={wizardData}
              updateData={updateData}
              goNext={goNext}
              goBack={goBack}
              isFirst={currentStep === 0}
              isLast={currentStep === totalSteps - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
