'use client';

import { Plane, Calendar, Weight, DollarSign, FileText, Package, Loader2 } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import type { StepProps } from '../WizardContainer';

function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ReviewStep({ data, goNext }: StepProps & { isSubmitting?: boolean }) {
  const { t, lang } = useLanguage();
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';

  const departureCity = (data.departureCity as string) || '';
  const arrivalCity = (data.arrivalCity as string) || '';
  const departureDate = (data.departureDate as string) || '';
  const flightNumber = (data.flightNumber as string) || '';
  const weight = (data.availableWeight as number) || 0;
  const price = (data.price as number) || 0;
  const categories = (data.acceptedCategories as string[]) || [];
  const notes = (data.notes as string) || '';
  const total = price * weight;
  const isSubmitting = (data._isSubmitting as boolean) || false;

  const CATEGORY_LABELS: Record<string, string> = {
    documents: t('wizard.catDocuments'),
    clothing: t('wizard.catClothing'),
    electronics: t('wizard.catElectronics'),
    gifts: t('wizard.catGifts'),
    medicine: t('wizard.catMedicine'),
    food: t('wizard.catFood'),
  };

  const rows = [
    {
      icon: <Plane className="w-4 h-4 text-v2-primary -rotate-90 rtl:rotate-90" />,
      label: t('wizard.reviewRoute'),
      value: `${departureCity} → ${arrivalCity}`,
    },
    {
      icon: <Calendar className="w-4 h-4 text-v2-primary" />,
      label: t('wizard.reviewDate'),
      value: formatDate(departureDate, locale),
    },
    ...(flightNumber
      ? [
          {
            icon: <Plane className="w-4 h-4 text-v2-primary" />,
            label: t('listing.flightNumber'),
            value: flightNumber,
          },
        ]
      : []),
    {
      icon: <Weight className="w-4 h-4 text-v2-primary" />,
      label: t('wizard.reviewWeight'),
      value: `${weight} kg`,
    },
    {
      icon: <DollarSign className="w-4 h-4 text-v2-primary" />,
      label: t('wizard.reviewPrice'),
      value: `${price} ${t('common.sar')} / kg`,
    },
    ...(categories.length > 0
      ? [
          {
            icon: <Package className="w-4 h-4 text-v2-primary" />,
            label: t('wizard.reviewCategories'),
            value: categories.map((c) => CATEGORY_LABELS[c] || c).join(', '),
          },
        ]
      : []),
    ...(notes
      ? [
          {
            icon: <FileText className="w-4 h-4 text-v2-primary" />,
            label: t('wizard.reviewNotes'),
            value: notes,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="wizard-fade-in wizard-fade-in-1 text-center">
        <span className="text-4xl mb-3 block">✨</span>
        <h2 className="text-2xl font-extrabold text-v2-text mb-1">{t('wizard.reviewTitle')}</h2>
        <p className="text-v2-text-soft text-sm">{t('wizard.reviewSubtitle')}</p>
      </div>

      {/* Summary Card */}
      <div className="wizard-fade-in wizard-fade-in-2 bg-white rounded-[22px] p-5 shadow-bubble-sm">
        <div className="divide-y divide-v2-primary/10">
          {rows.map((row, i) => (
            <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-8 h-8 rounded-full bg-v2-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {row.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-v2-text-muted font-medium">{row.label}</p>
                <p className="text-sm font-semibold text-v2-text mt-0.5">{row.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Earnings */}
      <div className="wizard-fade-in wizard-fade-in-3">
        <div className="bg-v2-primary/10 rounded-[22px] p-5 text-center">
          <p className="text-sm font-semibold text-v2-primary mb-1">
            {t('wizard.estimatedEarnings')}
          </p>
          <p className="text-3xl font-extrabold text-v2-text" dir="ltr">
            {total.toFixed(0)}{' '}
            <span className="text-base font-bold text-v2-text-muted">{t('common.sar')}</span>
          </p>
          <p className="text-xs text-v2-text-muted mt-1">({t('wizard.ifFullyBooked')})</p>
        </div>
      </div>

      {/* Publish Button */}
      <div className="wizard-fade-in wizard-fade-in-4 pt-2">
        <button
          type="button"
          onClick={goNext}
          disabled={isSubmitting}
          className="w-full v2-gradient-primary text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-bubble-md text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('wp.creatingListing')}
            </>
          ) : (
            <>✈️ {t('wizard.publish')}</>
          )}
        </button>
      </div>
    </div>
  );
}
