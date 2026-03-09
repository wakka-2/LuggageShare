'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Package,
  ArrowRight,
  Plane,
  Calendar,
  Weight,
  DollarSign,
  FileText,
  Send,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageUpload from '@/components/common/ImageUpload';
import { useCreateBooking } from '@/hooks/useBookings';
import { useSendMessage } from '@/hooks/useMessages';
import { useListing } from '@/hooks/useListings';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';

interface BookingForm {
  weight: number;
  itemName: string;
  itemDescription: string;
  notes: string;
  message: string;
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ListingSummarySkeleton() {
  return (
    <div className="bg-white rounded-[22px] p-6 shadow-bubble-md animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="text-center space-y-2">
          <div className="h-8 w-14 bg-v2-primary/10 rounded mx-auto" />
          <div className="h-4 w-20 bg-v2-primary/10 rounded mx-auto" />
        </div>
        <div className="flex-1 mx-6 h-1 bg-v2-primary/10 rounded" />
        <div className="text-center space-y-2">
          <div className="h-8 w-14 bg-v2-primary/10 rounded mx-auto" />
          <div className="h-4 w-20 bg-v2-primary/10 rounded mx-auto" />
        </div>
      </div>
      <div className="border-t border-v2-primary/10 pt-4 flex gap-3">
        <div className="h-8 w-32 bg-v2-primary/10 rounded-full" />
        <div className="h-8 w-24 bg-v2-primary/10 rounded-full" />
        <div className="h-8 w-28 bg-v2-primary/10 rounded-full" />
      </div>
    </div>
  );
}

export default function CreateBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const { t, lang } = useLanguage();

  const dateLocale = lang === 'ar' ? 'ar-SA' : 'en-US';

  const { data: listing, isLoading: listingLoading } = useListing(listingId);
  const createBooking = useCreateBooking();
  const sendMessage = useSendMessage();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingForm>({
    defaultValues: {
      weight: 1,
      itemName: '',
      itemDescription: '',
      notes: '',
      message: '',
    },
  });

  const watchedWeight = watch('weight');

  const totalPrice = useMemo(() => {
    if (!listing || !watchedWeight) return 0;
    const w = Number(watchedWeight) || 0;
    return Math.round(w * listing.price * 100) / 100;
  }, [listing, watchedWeight]);

  const fromCode = listing
    ? listing.departureCode || listing.departureCity.slice(0, 3).toUpperCase()
    : '';
  const toCode = listing
    ? listing.arrivalCode || listing.arrivalCity.slice(0, 3).toUpperCase()
    : '';

  const maxWeight = listing?.availableWeight || 30;

  const onSubmit = async (data: BookingForm) => {
    if (!listingId) return;
    setSubmitError(null);

    try {
      const result = await createBooking.mutateAsync({
        listingId,
        totalWeight: Number(data.weight),
        items: [
          {
            name: data.itemName,
            description: data.itemDescription || undefined,
            weight: Number(data.weight),
            value: 0,
            imageUrls: photoUrl ? [photoUrl] : undefined,
          },
        ],
      });

      const bookingId = result?.data?.id || result?.id || result;

      // Send the initial message if provided
      if (bookingId && data.message.trim()) {
        try {
          await sendMessage.mutateAsync({
            bookingId: String(bookingId),
            content: data.message.trim(),
          });
        } catch {
          // Message send failed — still redirect, user can resend from chat
        }
      }

      if (bookingId) {
        // Go to chat so the conversation continues naturally
        router.push(`/chat/${bookingId}`);
      } else {
        router.push('/trips');
      }
    } catch {
      setSubmitError(t('wp.createBookingError'));
    }
  };

  // No listing ID provided
  if (!listingId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col blob-background">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-v2-primary" />
              </div>
              <h2 className="text-lg font-bold text-v2-text mb-2">{t('wp.noListingSelected')}</h2>
              <p className="text-v2-text-soft mb-6">{t('wp.selectListingFirst')}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 v2-gradient-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                {t('wp.browseListings')}
              </Link>
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

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-v2-text-soft hover:text-v2-text mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            {t('wp.back')}
          </button>

          <h1 className="text-2xl font-extrabold text-v2-text mb-2">{t('booking.bookListing')}</h1>
          <p className="text-v2-text-soft mb-6">{t('wp.sendShipmentWith')}</p>

          {/* Listing Summary Card */}
          {listingLoading ? (
            <div className="mb-6">
              <ListingSummarySkeleton />
            </div>
          ) : listing ? (
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-md mb-6">
              {/* Route */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-v2-text">{fromCode}</p>
                  <p className="text-sm text-v2-text-soft mt-1">{listing.departureCity}</p>
                </div>

                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="w-3 h-3 rounded-full bg-v2-mint flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-2" />
                  <Plane className="w-5 h-5 text-v2-primary -rotate-90 rtl:rotate-90 flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-v2-primary/20 mx-2" />
                  <div className="w-3 h-3 rounded-full bg-v2-secondary flex-shrink-0" />
                </div>

                <div className="text-center">
                  <p className="text-2xl font-extrabold text-v2-text">{toCode}</p>
                  <p className="text-sm text-v2-text-soft mt-1">{listing.arrivalCity}</p>
                </div>
              </div>

              {/* Listing details pills */}
              <div className="border-t border-v2-primary/10 mt-4 pt-4 flex flex-wrap gap-2">
                <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(listing.departureDate, dateLocale)}
                </span>
                <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  {listing.price} {t('wp.sarPerKg')}
                </span>
                <span className="bg-v2-bg px-3 py-1.5 rounded-full text-sm text-v2-text-soft flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5" />
                  {listing.availableWeight} {t('wp.kgAvailable')}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-v2-secondary/10 rounded-[22px] p-4 text-center mb-6">
              <p className="text-sm text-v2-secondary font-medium">{t('wp.listingLoadError')}</p>
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 0: Message to Carrier */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-md border-2 border-v2-primary/15">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-mint/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-v2-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-v2-text">{t('wp.messageToCarrier')}</h2>
                  <p className="text-xs text-v2-text-muted">{t('wp.messageToCarrierHint')}</p>
                </div>
              </div>

              <textarea
                rows={3}
                className="w-full px-4 py-3 rounded-[16px] bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all resize-none"
                placeholder={t('wp.messageToCarrierPlaceholder')}
                {...register('message')}
              />
            </div>

            {/* Section 1: Item Details */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">{t('wp.shipmentDetails')}</h2>
              </div>

              <div className="space-y-4">
                {/* Item Name */}
                <div>
                  <label
                    htmlFor="itemName"
                    className="block text-sm font-semibold text-v2-text mb-1.5"
                  >
                    {t('wp.shipmentName')}
                  </label>
                  <input
                    id="itemName"
                    type="text"
                    className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                    placeholder={t('wp.shipmentNamePlaceholder')}
                    {...register('itemName', { required: t('wp.shipmentNameRequired') })}
                  />
                  {errors.itemName && (
                    <p className="text-xs text-v2-secondary mt-1 mr-2">{errors.itemName.message}</p>
                  )}
                </div>

                {/* Item Description */}
                <div>
                  <label
                    htmlFor="itemDescription"
                    className="block text-sm font-semibold text-v2-text mb-1.5"
                  >
                    {t('wp.shipmentDescription')}
                  </label>
                  <textarea
                    id="itemDescription"
                    rows={3}
                    className="w-full px-4 py-3 rounded-[16px] bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all resize-none"
                    placeholder={t('wp.shipmentDescriptionPlaceholder')}
                    {...register('itemDescription', {
                      required: t('wp.shipmentDescriptionRequired'),
                    })}
                  />
                  {errors.itemDescription && (
                    <p className="text-xs text-v2-secondary mt-1 mr-2">
                      {errors.itemDescription.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Weight */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Weight className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">{t('booking.weight')}</h2>
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-semibold text-v2-text mb-1.5">
                  {t('wp.shipmentWeight')}
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max={maxWeight}
                  className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                  placeholder="1"
                  {...register('weight', {
                    required: t('wp.weightRequired'),
                    min: { value: 0.5, message: t('wp.weightMin') },
                    max: {
                      value: maxWeight,
                      message: t('wp.weightMax', { max: String(maxWeight) }),
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.weight && (
                  <p className="text-xs text-v2-secondary mt-1 mr-2">{errors.weight.message}</p>
                )}
                <p className="text-xs text-v2-text-muted mt-1.5 mr-2">
                  {t('wp.weightHint', { max: String(maxWeight) })}
                </p>
              </div>
            </div>

            {/* Section 3: Notes */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">{t('wp.notes')}</h2>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-v2-text mb-1.5">
                  {t('wp.additionalNotesOptional')}
                  <span className="text-v2-text-muted font-normal mr-1">{t('wp.optional')}</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full px-4 py-3 rounded-[16px] bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all resize-none"
                  placeholder={t('wp.notesPlaceholder')}
                  {...register('notes')}
                />
              </div>
            </div>

            {/* Section 4: Photo */}
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-v2-primary" />
                </div>
                <h2 className="font-bold text-v2-text">{t('wp.shipmentPhoto')}</h2>
                <span className="text-sm text-v2-text-muted">{t('wp.optional')}</span>
              </div>

              <ImageUpload
                onUpload={(url) => setPhotoUrl(url)}
                folder="bookings"
                label={t('wp.addShipmentPhoto')}
              />
            </div>

            {/* Price Summary */}
            {listing && (
              <div className="bg-white rounded-[22px] p-6 shadow-bubble-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-full bg-v2-amber/15 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-v2-amber" />
                  </div>
                  <h2 className="font-bold text-v2-text">{t('wp.costSummary')}</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-v2-text-soft">{t('booking.pricePerKg')}</span>
                    <span className="text-v2-text font-medium">
                      {listing.price} {t('common.sar')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-v2-text-soft">{t('booking.weight')}</span>
                    <span className="text-v2-text font-medium">
                      {Number(watchedWeight) || 0} {t('home.kg')}
                    </span>
                  </div>
                  <div className="border-t border-v2-primary/10 pt-3 flex items-center justify-between">
                    <span className="font-bold text-v2-text">{t('booking.total')}</span>
                    <span className="text-xl font-extrabold text-v2-primary">
                      {totalPrice} {t('common.sar')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {submitError && (
              <div className="bg-v2-secondary/10 rounded-[22px] p-4 text-center">
                <p className="text-sm text-v2-secondary font-medium">{submitError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={createBooking.isPending || listingLoading}
              className="w-full v2-gradient-primary text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-bubble-sm"
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('wp.creatingBooking')}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t('booking.sendRequest')}
                </>
              )}
            </button>
          </form>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
