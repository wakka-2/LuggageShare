'use client';

import { ArrowRight, Minus, Plus } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import type { StepProps } from '../WizardContainer';

export default function PricingStep({ data, updateData, goNext }: StepProps) {
  const { t } = useLanguage();
  const price = (data.price as number) || 25;
  const weight = (data.availableWeight as number) || 5;
  const total = price * weight;

  function adjustPrice(delta: number) {
    const next = Math.max(1, Math.min(100, price + delta));
    updateData({ price: next });
  }

  // Slider percentage (1-100 range)
  const sliderPct = ((price - 1) / 99) * 100;

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="wizard-fade-in wizard-fade-in-1 text-center">
        <span className="text-4xl mb-3 block">💰</span>
        <h2 className="text-2xl font-extrabold text-v2-text mb-1">{t('wizard.pricingTitle')}</h2>
        <p className="text-v2-text-soft text-sm">{t('wizard.pricingSubtitle')}</p>
      </div>

      {/* Large Price Display */}
      <div className="wizard-fade-in wizard-fade-in-2">
        <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm font-bold text-v2-text-muted">{t('common.sar')}</span>
            <input
              type="number"
              value={price}
              onChange={(e) => {
                const v = Math.max(1, Math.min(100, Number(e.target.value)));
                updateData({ price: v });
              }}
              className="text-5xl font-extrabold text-v2-text w-28 text-center bg-transparent border-none focus:outline-none focus:ring-0"
              dir="ltr"
              min={1}
              max={100}
            />
            <span className="text-sm font-bold text-v2-text-muted">/ kg</span>
          </div>

          {/* +/- Controls with slider */}
          <div className="flex items-center gap-3 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => adjustPrice(-1)}
              className="w-10 h-10 rounded-full bg-v2-bg flex items-center justify-center text-v2-text-soft hover:bg-v2-primary/10 hover:text-v2-primary transition-all flex-shrink-0"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1 h-2.5 bg-v2-primary/10 rounded-full relative overflow-hidden">
              <div
                className="h-full v2-gradient-primary rounded-full transition-all duration-200"
                style={{ width: `${sliderPct}%` }}
              />
            </div>

            <button
              type="button"
              onClick={() => adjustPrice(1)}
              className="w-10 h-10 rounded-full bg-v2-bg flex items-center justify-center text-v2-text-soft hover:bg-v2-primary/10 hover:text-v2-primary transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-v2-text-muted mt-3">📊 {t('wizard.avgRange')}</p>
        </div>
      </div>

      {/* Estimated Total */}
      <div className="wizard-fade-in wizard-fade-in-3">
        <div className="bg-v2-primary/10 rounded-[22px] p-5 text-center">
          <p className="text-sm font-semibold text-v2-primary mb-1">
            💡 {t('wizard.estimatedTotal')}
          </p>
          <p className="text-3xl font-extrabold text-v2-text" dir="ltr">
            {total.toFixed(0)}{' '}
            <span className="text-base font-bold text-v2-text-muted">{t('common.sar')}</span>
          </p>
          <p className="text-xs text-v2-text-muted mt-1">
            ({t('wizard.forWeight', { weight: String(weight) })})
          </p>
        </div>
      </div>

      {/* Next Button */}
      {price > 0 && (
        <div className="wizard-fade-in wizard-fade-in-4 pt-2">
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
