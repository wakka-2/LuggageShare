'use client';

import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import type { StepProps } from '../WizardContainer';

const QUICK_WEIGHTS = [2, 5, 10, 15, 20, 23];

export default function WeightStep({ data, updateData, goNext }: StepProps) {
  const { t } = useLanguage();
  const weight = (data.availableWeight as number) || 0;

  function setWeight(w: number) {
    updateData({ availableWeight: w });
  }

  // Suitcase scales with weight
  const suitcaseSize = 40 + Math.min(weight, 23) * 2.5;

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="wizard-fade-in wizard-fade-in-1 text-center">
        {/* Animated suitcase */}
        <div
          className="mx-auto mb-3 transition-all duration-300"
          style={{ fontSize: `${suitcaseSize}px`, lineHeight: 1 }}
        >
          🧳
        </div>
        {weight > 0 && (
          <p className="text-lg font-bold text-v2-primary mb-2 transition-opacity duration-300">
            {weight} {t('wizard.kg')}
          </p>
        )}
        <h2 className="text-2xl font-extrabold text-v2-text mb-1">{t('wizard.weightTitle')}</h2>
        <p className="text-v2-text-soft text-sm">{t('wizard.weightSubtitle')}</p>
      </div>

      {/* Quick Select Chips */}
      <div className="wizard-fade-in wizard-fade-in-2">
        <div className="flex flex-wrap justify-center gap-2.5">
          {QUICK_WEIGHTS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeight(w)}
              className={`min-w-[64px] px-5 py-3 rounded-2xl font-bold text-base transition-all ${
                weight === w
                  ? 'v2-gradient-primary text-white shadow-bubble-sm scale-105'
                  : 'bg-white text-v2-text border border-v2-primary/10 shadow-bubble-xs hover:shadow-bubble-sm hover:border-v2-primary/30'
              }`}
            >
              {w} kg
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div className="wizard-fade-in wizard-fade-in-3">
        <label className="block text-sm font-semibold text-v2-text mb-2 text-center">
          {t('wizard.orEnterCustom')}
        </label>
        <input
          type="number"
          value={weight || ''}
          onChange={(e) => setWeight(Number(e.target.value))}
          min={0.1}
          max={30}
          step={0.5}
          placeholder="0"
          className="w-full px-5 py-3.5 rounded-2xl bg-white border border-v2-primary/10 text-v2-text text-center text-lg font-bold placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary/30 focus:border-v2-primary/30 focus:outline-none transition-all shadow-bubble-xs"
          dir="ltr"
        />
        <p className="text-xs text-v2-text-muted mt-2 text-center">💡 {t('wizard.weightHint')}</p>
      </div>

      {/* Next Button */}
      {weight > 0 && (
        <div className="wizard-fade-in pt-2">
          <button
            type="button"
            onClick={goNext}
            className="w-full v2-gradient-primary text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-bubble-sm text-base"
          >
            {t('wizard.next')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}
