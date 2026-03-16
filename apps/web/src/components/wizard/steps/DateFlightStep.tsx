'use client';

import { ArrowRight, Plane } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import type { StepProps } from '../WizardContainer';

export default function DateFlightStep({ data, updateData, goNext }: StepProps) {
  const { t } = useLanguage();
  const departureDate = (data.departureDate as string) || '';
  const flightNumber = (data.flightNumber as string) || '';

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="wizard-fade-in wizard-fade-in-1">
        <span className="text-4xl mb-3 block">📅</span>
        <h2 className="text-2xl font-extrabold text-v2-text mb-1">{t('wizard.dateTitle')}</h2>
        <p className="text-v2-text-soft text-sm">{t('wizard.dateSubtitle')}</p>
      </div>

      {/* Date Input */}
      <div className="wizard-fade-in wizard-fade-in-2 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-v2-text mb-2">
            {t('listing.departureDate')}
          </label>
          <input
            type="date"
            value={departureDate}
            min={today}
            onChange={(e) => updateData({ departureDate: e.target.value })}
            className="w-full px-5 py-3.5 rounded-2xl bg-white border border-v2-primary/10 text-v2-text focus:ring-2 focus:ring-v2-primary/30 focus:border-v2-primary/30 focus:outline-none transition-all shadow-bubble-xs text-base"
            autoFocus
          />
        </div>

        {/* Flight Number */}
        <div>
          <label className="block text-sm font-semibold text-v2-text mb-2">
            <span className="flex items-center gap-2">
              <Plane className="w-3.5 h-3.5 text-v2-primary" />
              {t('listing.flightNumber')}
              <span className="text-v2-text-muted font-normal text-xs">
                {t('listing.optional')}
              </span>
            </span>
          </label>
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => updateData({ flightNumber: e.target.value.toUpperCase() })}
            placeholder="SV 123"
            className="w-full px-5 py-3.5 rounded-2xl bg-white border border-v2-primary/10 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary/30 focus:border-v2-primary/30 focus:outline-none transition-all shadow-bubble-xs text-base"
            dir="ltr"
          />
        </div>
      </div>

      {/* Next Button */}
      {departureDate && (
        <div className="wizard-fade-in wizard-fade-in-3 pt-2">
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
