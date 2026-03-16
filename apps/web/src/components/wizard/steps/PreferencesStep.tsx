'use client';

import { ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import type { StepProps } from '../WizardContainer';

interface Category {
  id: string;
  emoji: string;
  labelKey: string;
}

const CATEGORIES: Category[] = [
  { id: 'documents', emoji: '📄', labelKey: 'wizard.catDocuments' },
  { id: 'clothing', emoji: '👗', labelKey: 'wizard.catClothing' },
  { id: 'electronics', emoji: '📱', labelKey: 'wizard.catElectronics' },
  { id: 'gifts', emoji: '🎁', labelKey: 'wizard.catGifts' },
  { id: 'medicine', emoji: '💊', labelKey: 'wizard.catMedicine' },
  { id: 'food', emoji: '🍫', labelKey: 'wizard.catFood' },
];

export default function PreferencesStep({ data, updateData, goNext }: StepProps) {
  const { t } = useLanguage();
  const selected = (data.acceptedCategories as string[]) || [];
  const notes = (data.notes as string) || '';

  function toggleCategory(id: string) {
    const next = selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id];
    updateData({ acceptedCategories: next });
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="wizard-fade-in wizard-fade-in-1">
        <span className="text-4xl mb-3 block">📦</span>
        <h2 className="text-2xl font-extrabold text-v2-text mb-1">
          {t('wizard.preferencesTitle')}
        </h2>
        <p className="text-v2-text-soft text-sm">{t('wizard.preferencesSubtitle')}</p>
      </div>

      {/* Category Grid */}
      <div className="wizard-fade-in wizard-fade-in-2">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selected.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`relative flex items-center gap-3 p-4 rounded-2xl text-start transition-all ${
                  isSelected
                    ? 'bg-v2-primary/10 border-[1.5px] border-v2-primary shadow-bubble-xs'
                    : 'bg-white border border-v2-primary/10 shadow-bubble-xs hover:shadow-bubble-sm hover:border-v2-primary/20'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span
                  className={`text-sm font-semibold ${isSelected ? 'text-v2-primary' : 'text-v2-text'}`}
                >
                  {t(cat.labelKey)}
                </span>
                {isSelected && (
                  <span className="absolute top-2 end-2 w-5 h-5 rounded-full v2-gradient-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="wizard-fade-in wizard-fade-in-3">
        <label className="block text-sm font-semibold text-v2-text mb-2">
          {t('wizard.notesLabel')}
          <span className="text-v2-text-muted font-normal text-xs ms-1">
            {t('listing.optional')}
          </span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => updateData({ notes: e.target.value })}
          rows={3}
          placeholder={t('wizard.notesPlaceholder')}
          className="w-full px-5 py-3.5 rounded-2xl bg-white border border-v2-primary/10 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary/30 focus:border-v2-primary/30 focus:outline-none transition-all shadow-bubble-xs text-sm resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="wizard-fade-in wizard-fade-in-4 space-y-2 pt-2">
        <button
          type="button"
          onClick={goNext}
          className="w-full v2-gradient-primary text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-bubble-sm text-base"
        >
          {t('wizard.next')}
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="w-full text-v2-text-muted py-2.5 rounded-full font-medium text-sm hover:text-v2-text transition-all"
        >
          {t('wizard.skip')}
        </button>
      </div>
    </div>
  );
}
