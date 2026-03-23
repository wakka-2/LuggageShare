'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Calendar,
  Weight,
  Tag,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  ArrowRight,
  List,
} from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useCreateFlight } from '@/hooks/useFlights';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const TOTAL_STEPS = 4;
const CURRENCY_OPTIONS = ['SAR', 'USD', 'EUR', 'AED'];
const WEIGHT_PRESETS = ['5', '10', '15', '20', '23'];

interface FormState {
  departureCity: string;
  departureCode: string;
  arrivalCity: string;
  arrivalCode: string;
  departureDate: string;
  flightNumber: string;
  totalWeight: string;
  pricePerKg: string;
  currency: string;
  notes: string;
}

const initialForm: FormState = {
  departureCity: '',
  departureCode: '',
  arrivalCity: '',
  arrivalCode: '',
  departureDate: '',
  flightNumber: '',
  totalWeight: '10',
  pricePerKg: '25',
  currency: 'SAR',
  notes: '',
};

function StepIndicator({
  step,
  total,
  t,
}: {
  step: number;
  total: number;
  t: (k: string) => string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-v2-text-muted">
          {t('common.step') || 'Step'} {step} / {total}
        </span>
        <span className="text-xs text-v2-text-muted">{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="w-full h-2 bg-v2-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full v2-gradient-primary transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ───── Step 1: Route ───── */
function RouteStep({
  form,
  onChange,
  t,
}: {
  form: FormState;
  onChange: (key: keyof FormState, val: string) => void;
  t: (k: string) => string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-v2-text flex items-center gap-2">
        <Plane className="w-5 h-5 text-v2-primary -rotate-90 rtl:rotate-90" />
        {t('flight.route') || 'Route'}
      </h2>

      <div>
        <label className="block text-sm font-semibold text-v2-text mb-1.5">
          {t('flight.from') || 'From'} *
        </label>
        <input
          type="text"
          value={form.departureCity}
          onChange={(e) => onChange('departureCity', e.target.value)}
          placeholder={t('flight.cityPlaceholder') || 'e.g. Riyadh'}
          className="w-full px-4 py-3 rounded-2xl border-2 border-v2-primary/15 bg-v2-bg text-v2-text focus:outline-none focus:border-v2-primary transition-colors"
        />
        <input
          type="text"
          value={form.departureCode}
          onChange={(e) => onChange('departureCode', e.target.value.toUpperCase().slice(0, 3))}
          placeholder={t('flight.iataCode') || 'IATA (optional, e.g. RUH)'}
          maxLength={3}
          className="w-full mt-2 px-4 py-2.5 rounded-2xl border-2 border-v2-primary/10 bg-v2-bg text-v2-text text-sm focus:outline-none focus:border-v2-primary transition-colors"
        />
      </div>

      <div className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-v2-primary/10 flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-v2-primary rtl:rotate-180" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-v2-text mb-1.5">
          {t('flight.to') || 'To'} *
        </label>
        <input
          type="text"
          value={form.arrivalCity}
          onChange={(e) => onChange('arrivalCity', e.target.value)}
          placeholder={t('flight.cityPlaceholder') || 'e.g. London'}
          className="w-full px-4 py-3 rounded-2xl border-2 border-v2-primary/15 bg-v2-bg text-v2-text focus:outline-none focus:border-v2-primary transition-colors"
        />
        <input
          type="text"
          value={form.arrivalCode}
          onChange={(e) => onChange('arrivalCode', e.target.value.toUpperCase().slice(0, 3))}
          placeholder={t('flight.iataCode') || 'IATA (optional, e.g. LHR)'}
          maxLength={3}
          className="w-full mt-2 px-4 py-2.5 rounded-2xl border-2 border-v2-primary/10 bg-v2-bg text-v2-text text-sm focus:outline-none focus:border-v2-primary transition-colors"
        />
      </div>
    </div>
  );
}

/* ───── Step 2: Date & Flight Info ───── */
function DateStep({
  form,
  onChange,
  t,
}: {
  form: FormState;
  onChange: (key: keyof FormState, val: string) => void;
  t: (k: string) => string;
}) {
  // Min date = tomorrow (require >24h lead time matching API)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-v2-text flex items-center gap-2">
        <Calendar className="w-5 h-5 text-v2-primary" />
        {t('flight.dateAndInfo') || 'Date & Flight Info'}
      </h2>

      <div>
        <label className="block text-sm font-semibold text-v2-text mb-1.5">
          {t('flight.departureDate') || 'Departure Date'} *
        </label>
        <input
          type="date"
          value={form.departureDate}
          min={minDate}
          onChange={(e) => onChange('departureDate', e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border-2 border-v2-primary/15 bg-v2-bg text-v2-text focus:outline-none focus:border-v2-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-v2-text mb-1.5">
          {t('flight.flightNumber') || 'Flight Number (optional)'}
        </label>
        <input
          type="text"
          value={form.flightNumber}
          onChange={(e) => onChange('flightNumber', e.target.value.toUpperCase())}
          placeholder="SV001"
          className="w-full px-4 py-3 rounded-2xl border-2 border-v2-primary/15 bg-v2-bg text-v2-text focus:outline-none focus:border-v2-primary transition-colors"
        />
      </div>
    </div>
  );
}

/* ───── Step 3: Weight & Pricing ───── */
function PricingStep({
  form,
  onChange,
  t,
}: {
  form: FormState;
  onChange: (key: keyof FormState, val: string) => void;
  t: (k: string) => string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-v2-text flex items-center gap-2">
        <Weight className="w-5 h-5 text-v2-primary" />
        {t('flight.weightAndPricing') || 'Weight & Pricing'}
      </h2>

      <div>
        <label className="block text-sm font-semibold text-v2-text mb-1.5">
          {t('flight.availableWeight') || 'Available Weight (kg)'} *
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="1"
            max="50"
            value={form.totalWeight}
            onChange={(e) => onChange('totalWeight', e.target.value)}
            dir="ltr"
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-v2-primary/15 bg-v2-bg text-v2-text focus:outline-none focus:border-v2-primary transition-colors"
          />
          <span className="px-4 py-3 rounded-2xl bg-v2-primary/10 text-v2-primary text-sm font-bold flex-shrink-0">
            kg
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {WEIGHT_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange('totalWeight', p)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors ${
                form.totalWeight === p
                  ? 'bg-v2-primary border-v2-primary text-white'
                  : 'bg-v2-bg border-v2-primary/20 text-v2-text-soft hover:border-v2-primary/40'
              }`}
            >
              {p} kg
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-v2-text mb-1.5">
          {t('flight.pricePerKg') || 'Price per kg'} *
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            value={form.pricePerKg}
            onChange={(e) => onChange('pricePerKg', e.target.value)}
            dir="ltr"
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-v2-primary/15 bg-v2-bg text-v2-text focus:outline-none focus:border-v2-primary transition-colors"
          />
          <div className="flex gap-1">
            {CURRENCY_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange('currency', c)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-colors ${
                  form.currency === c
                    ? 'bg-v2-primary text-white'
                    : 'bg-v2-bg text-v2-text-soft hover:bg-v2-primary/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {form.totalWeight && form.pricePerKg && (
          <p className="text-xs text-v2-text-muted mt-1.5">
            {t('flight.estimatedEarnings') || 'Estimated earnings'}:{' '}
            {Math.round(parseFloat(form.totalWeight || '0') * parseFloat(form.pricePerKg || '0'))}{' '}
            {form.currency}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-v2-text mb-1.5">
          {t('flight.notes') || 'Notes (optional)'}
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder={
            t('flight.notesPlaceholder') ||
            "Any preferences or restrictions for items you'll carry..."
          }
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border-2 border-v2-primary/15 bg-v2-bg text-v2-text text-sm focus:outline-none focus:border-v2-primary transition-colors resize-none"
        />
      </div>
    </div>
  );
}

/* ───── Step 4: Review ───── */
function ReviewStep({
  form,
  t,
  lang,
}: {
  form: FormState;
  t: (k: string) => string;
  lang: string;
}) {
  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const fromCode = form.departureCode || form.departureCity.slice(0, 3).toUpperCase();
  const toCode = form.arrivalCode || form.arrivalCity.slice(0, 3).toUpperCase();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-v2-text flex items-center gap-2">
        <List className="w-5 h-5 text-v2-primary" />
        {t('flight.review') || 'Review & Post'}
      </h2>

      <div className="bg-v2-bg rounded-[22px] p-5 space-y-4">
        {/* Route */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-v2-text">{fromCode}</p>
            <p className="text-xs text-v2-text-soft">{form.departureCity}</p>
          </div>
          <div className="flex-1 flex items-center justify-center px-3">
            <div className="w-2 h-2 rounded-full bg-v2-mint flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-1" />
            <Plane className="w-4 h-4 text-v2-primary -rotate-90 rtl:rotate-90 flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-1" />
            <div className="w-2 h-2 rounded-full bg-v2-secondary flex-shrink-0" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-v2-text">{toCode}</p>
            <p className="text-xs text-v2-text-soft">{form.arrivalCity}</p>
          </div>
        </div>

        <div className="border-t border-v2-primary/10 pt-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-v2-text-muted">{t('flight.departureDate') || 'Date'}</span>
            <span className="font-semibold text-v2-text">
              {form.departureDate
                ? new Date(form.departureDate).toLocaleDateString(dateLocale, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          {form.flightNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-v2-text-muted">{t('flight.flightNumber') || 'Flight'}</span>
              <span className="font-semibold text-v2-text">{form.flightNumber}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-v2-text-muted">{t('flight.availableWeight') || 'Weight'}</span>
            <span className="font-semibold text-v2-text">{form.totalWeight} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-v2-text-muted">{t('flight.pricePerKg') || 'Price/kg'}</span>
            <span className="font-semibold text-v2-text">
              {form.pricePerKg} {form.currency}
            </span>
          </div>
          {form.notes && (
            <div className="flex justify-between text-sm gap-4">
              <span className="text-v2-text-muted flex-shrink-0">
                {t('flight.notes') || 'Notes'}
              </span>
              <span className="font-semibold text-v2-text text-end">{form.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Main Page ───── */
export default function CreateFlightPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const createFlight = useCreateFlight();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function handleChange(key: keyof FormState, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  function validateStep(): boolean {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.departureCity.trim()) newErrors.departureCity = 'Required';
      if (!form.arrivalCity.trim()) newErrors.arrivalCity = 'Required';
    }
    if (step === 2) {
      if (!form.departureDate) newErrors.departureDate = 'Required';
    }
    if (step === 3) {
      const w = parseFloat(form.totalWeight);
      const p = parseFloat(form.pricePerKg);
      if (!form.totalWeight || isNaN(w) || w <= 0) newErrors.totalWeight = 'Enter a valid weight';
      if (!form.pricePerKg || isNaN(p) || p < 0) newErrors.pricePerKg = 'Enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep()) {
      if (step < TOTAL_STEPS) setStep(step + 1);
    }
  }

  async function handleSubmit() {
    try {
      await createFlight.mutateAsync({
        departureCity: form.departureCity.trim(),
        departureCode: form.departureCode.trim() || undefined,
        arrivalCity: form.arrivalCity.trim(),
        arrivalCode: form.arrivalCode.trim() || undefined,
        departureDate: new Date(form.departureDate).toISOString(),
        flightNumber: form.flightNumber.trim() || undefined,
        totalWeight: parseFloat(form.totalWeight),
        pricePerKg: parseFloat(form.pricePerKg),
        currency: form.currency,
        notes: form.notes.trim() || undefined,
      });
      setDone(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('common.error') ||
        'Something went wrong';
      setErrors({ submit: msg });
    }
  }

  if (done) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col blob-background">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-full v2-gradient-primary flex items-center justify-center mx-auto mb-5 shadow-bubble-md">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-v2-text mb-2">
                {t('flight.posted') || 'Flight Posted!'}
              </h2>
              <p className="text-v2-text-soft mb-6">
                {t('flight.postedDescription') ||
                  'Your flight is now live. Senders can browse it and make offers.'}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-3 rounded-full v2-gradient-primary text-white font-semibold shadow-bubble-xs hover:opacity-90 transition-opacity"
                >
                  {t('common.goHome') || 'Go to Home'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/trips')}
                  className="px-6 py-3 rounded-full border-2 border-v2-primary/20 text-v2-primary font-semibold hover:bg-v2-primary/5 transition-colors"
                >
                  {t('flight.viewMyFlights') || 'View My Flights'}
                </button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
          <h1 className="text-2xl font-extrabold text-v2-text mb-6">
            {t('flight.create') || 'Post a Flight'}
          </h1>

          <StepIndicator step={step} total={TOTAL_STEPS} t={t} />

          <div className="bg-white rounded-[22px] p-5 shadow-bubble-md mb-5">
            {step === 1 && <RouteStep form={form} onChange={handleChange} t={t} />}
            {step === 2 && <DateStep form={form} onChange={handleChange} t={t} />}
            {step === 3 && <PricingStep form={form} onChange={handleChange} t={t} />}
            {step === 4 && <ReviewStep form={form} t={t} lang={lang} />}

            {/* Field errors for step 1 */}
            {errors.departureCity && (
              <p className="text-xs text-v2-secondary mt-2">{errors.departureCity}</p>
            )}
            {errors.arrivalCity && (
              <p className="text-xs text-v2-secondary mt-2">{errors.arrivalCity}</p>
            )}
            {errors.departureDate && (
              <p className="text-xs text-v2-secondary mt-2">{errors.departureDate}</p>
            )}
          </div>

          {errors.submit && (
            <p className="text-sm text-v2-secondary bg-v2-secondary/10 rounded-2xl px-4 py-3 mb-4">
              {errors.submit}
            </p>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-3.5 rounded-full border-2 border-v2-primary/20 text-v2-primary text-sm font-semibold hover:bg-v2-primary/5 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                {t('common.back') || 'Back'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-3.5 rounded-full border-2 border-v2-text-muted/30 text-v2-text-soft text-sm font-semibold hover:bg-v2-bg transition-colors"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3.5 rounded-full v2-gradient-primary text-white text-sm font-bold shadow-bubble-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                {t('common.next') || 'Next'}
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createFlight.isPending}
                className="flex-1 py-3.5 rounded-full v2-gradient-primary text-white text-sm font-bold shadow-bubble-xs hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {createFlight.isPending
                  ? t('common.loading') || 'Loading...'
                  : t('flight.post') || 'Post Flight'}
              </button>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
