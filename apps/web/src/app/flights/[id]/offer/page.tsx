'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plane,
  Calendar,
  Weight,
  Tag,
  MessageSquare,
  ArrowLeft,
  Info,
  Camera,
  X,
  Loader2,
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useFlight } from '@/hooks/useFlights';
import { useCreateOffer } from '@/hooks/useOffers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const WEIGHT_PRESETS = ['5', '10', '15', '20'];

export default function MakeOfferPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';

  const { data: flight, isLoading } = useFlight(id || null);
  const createOffer = useCreateOffer(id);

  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const remaining = flight ? Number(flight.remainingWeight) : 0;
  const pricePerKg = flight ? Number(flight.pricePerKg) : 0;

  const weightPresets = WEIGHT_PRESETS.filter((p) => parseFloat(p) <= remaining);

  function handleWeightChange(v: string) {
    setWeight(v);
    const w = parseFloat(v);
    if (!isNaN(w) && w > 0 && pricePerKg > 0) {
      setPrice(String(Math.round(w * pricePerKg)));
    }
    setErrors((prev) => ({ ...prev, weight: '' }));
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || imageUrls.length >= 3) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/uploads/image?folder=items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data?.url || data?.data?.url;
      if (url) setImageUrls((prev) => [...prev, url]);
    } catch {
      setErrors((prev) => ({ ...prev, photo: t('offer.photoUploadError') || 'Upload failed' }));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const w = parseFloat(weight);
    const p = parseFloat(price);
    const newErrors: Record<string, string> = {};

    if (!weight || isNaN(w) || w <= 0) {
      newErrors.weight = t('offer.weightRequired') || 'Please enter the weight you want to ship';
    } else if (w > remaining) {
      newErrors.weight = `Cannot exceed remaining capacity (${remaining} kg)`;
    }
    if (!price || isNaN(p) || p < 0) {
      newErrors.price = t('offer.priceRequired') || 'Please enter your offered price';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createOffer.mutateAsync({
        offeredWeight: w,
        offeredPrice: p,
        currency: flight?.currency ?? 'SAR',
        note: note.trim() || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('common.error') ||
        'Something went wrong';
      setErrors({ submit: msg });
    }
  }

  if (submitted) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col blob-background">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-full v2-gradient-primary flex items-center justify-center mx-auto mb-5 shadow-bubble-md">
                <MessageSquare className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-v2-text mb-2">
                {t('offer.submitted') || 'Offer Submitted!'}
              </h2>
              <p className="text-v2-text-soft mb-6">
                {t('offer.submittedDescription') ||
                  'The traveler will review your offer. You can negotiate via chat.'}
              </p>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-full v2-gradient-primary text-white font-semibold shadow-bubble-xs hover:opacity-90 transition-opacity"
              >
                {t('common.ok') || 'OK'}
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col blob-background">
          <Header />
          <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-white rounded-[22px] shadow-bubble-sm" />
              <div className="h-64 bg-white rounded-[22px] shadow-bubble-sm" />
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (!flight) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col blob-background">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-v2-text-muted">{t('flight.notFound') || 'Flight not found'}</p>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  // Prevent poster from making offers on own flight
  if (flight.posterId === user?.id) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col blob-background">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-sm">
              <p className="text-v2-text-muted mb-4">
                {t('offer.ownFlightError') || "You can't make an offer on your own flight."}
              </p>
              <button
                type="button"
                onClick={() => router.back()}
                className="text-v2-primary font-semibold hover:underline"
              >
                {t('common.back') || 'Go back'}
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  const fromCode = flight.departureCode || flight.departureCity.slice(0, 3).toUpperCase();
  const toCode = flight.arrivalCode || flight.arrivalCity.slice(0, 3).toUpperCase();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-v2-text-soft text-sm font-medium mb-5 hover:text-v2-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t('common.back') || 'Back'}
          </button>

          <h1 className="text-2xl font-extrabold text-v2-text mb-5">
            {t('offer.makeOffer') || 'Make an Offer'}
          </h1>

          {/* Flight summary card */}
          <div className="bg-white rounded-[22px] p-5 shadow-bubble-md mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-extrabold text-v2-text">{fromCode}</span>
              <div className="flex-1 flex items-center justify-center px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-v2-mint flex-shrink-0" />
                <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-1" />
                <Plane className="w-4 h-4 text-v2-primary -rotate-90 rtl:rotate-90 flex-shrink-0" />
                <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-1" />
                <div className="w-2.5 h-2.5 rounded-full bg-v2-secondary flex-shrink-0" />
              </div>
              <span className="text-xl font-extrabold text-v2-text">{toCode}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(flight.departureDate).toLocaleDateString(dateLocale, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft flex items-center gap-1">
                <Weight className="w-3 h-3" />
                {remaining} kg {t('flight.remaining') || 'remaining'}
              </span>
              <span className="bg-v2-bg px-2.5 py-1 rounded-full text-xs text-v2-text-soft flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {pricePerKg} {flight.currency}/kg
              </span>
            </div>
          </div>

          {/* Offer form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-4">
              <h2 className="text-lg font-bold text-v2-text mb-4">
                {t('offer.yourOffer') || 'Your Offer'}
              </h2>

              {/* Weight */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-v2-text mb-2">
                  {t('offer.weight') || 'Weight (kg)'} *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    max={remaining}
                    value={weight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    placeholder={`max ${remaining}`}
                    dir="ltr"
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-v2-primary/15 bg-v2-bg text-v2-text text-base focus:outline-none focus:border-v2-primary transition-colors"
                  />
                  <span className="px-4 py-3 rounded-2xl bg-v2-primary/10 text-v2-primary text-sm font-bold flex-shrink-0">
                    kg
                  </span>
                </div>
                {weightPresets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {weightPresets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleWeightChange(p)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors ${
                          weight === p
                            ? 'bg-v2-primary border-v2-primary text-white'
                            : 'bg-v2-bg border-v2-primary/20 text-v2-text-soft hover:border-v2-primary/40'
                        }`}
                      >
                        {p} kg
                      </button>
                    ))}
                  </div>
                )}
                {errors.weight && (
                  <p className="text-xs text-v2-secondary mt-1.5">{errors.weight}</p>
                )}
              </div>

              {/* Price */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-v2-text mb-2">
                  {t('offer.price') || 'Total Price'} *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setErrors((prev) => ({ ...prev, price: '' }));
                    }}
                    placeholder="0"
                    dir="ltr"
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-v2-primary/15 bg-v2-bg text-v2-text text-base focus:outline-none focus:border-v2-primary transition-colors"
                  />
                  <span className="px-4 py-3 rounded-2xl bg-v2-primary/10 text-v2-primary text-sm font-bold flex-shrink-0">
                    {flight.currency || 'SAR'}
                  </span>
                </div>
                {weight &&
                  price &&
                  !isNaN(parseFloat(weight)) &&
                  parseFloat(weight) > 0 &&
                  !isNaN(parseFloat(price)) && (
                    <p className="text-xs text-v2-text-muted mt-1.5">
                      ≈ {(parseFloat(price) / parseFloat(weight)).toFixed(1)} {flight.currency}/kg
                    </p>
                  )}
                {errors.price && <p className="text-xs text-v2-secondary mt-1.5">{errors.price}</p>}
              </div>

              {/* Note */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-v2-text mb-2">
                  {t('offer.note') || 'Message (optional)'}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    t('offer.notePlaceholder') ||
                    "Describe your items, e.g. 'Perfume set, original packaging'"
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-v2-primary/15 bg-v2-bg text-v2-text text-sm focus:outline-none focus:border-v2-primary transition-colors resize-none"
                />
              </div>

              {/* Item Photos */}
              <div>
                <label className="block text-sm font-bold text-v2-text mb-2">
                  {t('offer.itemPhotos') || 'Item Photos (optional)'}
                </label>
                <div className="flex flex-wrap gap-3">
                  {imageUrls.map((url, index) => (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt={`Item ${index + 1}`}
                        className="w-[90px] h-[90px] rounded-2xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-bubble-xs flex items-center justify-center hover:bg-v2-secondary/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-v2-secondary" />
                      </button>
                    </div>
                  ))}
                  {imageUrls.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-[90px] h-[90px] rounded-2xl border-2 border-dashed border-v2-primary/30 bg-v2-primary/5 flex flex-col items-center justify-center gap-1 hover:border-v2-primary/50 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 text-v2-primary animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-v2-primary" />
                          <span className="text-[11px] font-semibold text-v2-primary">
                            {t('offer.addPhoto') || 'Add'}
                          </span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
                <p className="text-xs text-v2-text-muted mt-2">
                  {t('offer.photoHint') || 'Add up to 3 photos of your items to help the carrier'}
                </p>
                {errors.photo && <p className="text-xs text-v2-secondary mt-1">{errors.photo}</p>}
              </div>
            </div>

            {/* Info note */}
            <div className="flex gap-3 bg-v2-primary/8 rounded-[22px] p-4 mb-5">
              <Info className="w-4 h-4 text-v2-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-v2-text-soft leading-relaxed">
                {t('offer.infoNote') ||
                  'After submitting, you can negotiate details via chat before the traveler accepts.'}
              </p>
            </div>

            {errors.submit && (
              <p className="text-sm text-v2-secondary bg-v2-secondary/10 rounded-2xl px-4 py-3 mb-4">
                {errors.submit}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-3.5 rounded-full border-2 border-v2-text-muted/30 text-v2-text-soft text-sm font-semibold hover:bg-v2-bg transition-colors"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={createOffer.isPending}
                className="flex-1 py-3.5 rounded-full v2-gradient-primary text-white text-sm font-bold shadow-bubble-xs hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {createOffer.isPending
                  ? t('common.loading') || 'Loading...'
                  : t('offer.submitOffer') || 'Submit Offer'}
              </button>
            </div>
          </form>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
