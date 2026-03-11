'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  Package,
  RotateCcw,
  Timer,
  XCircle,
  HelpCircle,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useBookingDispute, useCreateDispute, type DisputeReason } from '@/hooks/useDisputes';
import { useLanguage } from '@/providers/LanguageProvider';

const DISPUTE_REASONS: {
  key: DisputeReason;
  Icon: LucideIcon;
}[] = [
  { key: 'damaged_item', Icon: AlertTriangle },
  { key: 'missing_item', Icon: Package },
  { key: 'wrong_item', Icon: RotateCcw },
  { key: 'late_delivery', Icon: Timer },
  { key: 'no_delivery', Icon: XCircle },
  { key: 'other', Icon: HelpCircle },
];

const REASON_LABELS: Record<DisputeReason, { en: string; ar: string }> = {
  damaged_item: { en: 'Damaged Item', ar: 'عنصر تالف' },
  missing_item: { en: 'Missing Item', ar: 'عنصر مفقود' },
  wrong_item: { en: 'Wrong Item', ar: 'عنصر خاطئ' },
  late_delivery: { en: 'Late Delivery', ar: 'تسليم متأخر' },
  no_delivery: { en: 'No Delivery', ar: 'لم يُسلَّم' },
  other: { en: 'Other', ar: 'أخرى' },
};

const STATUS_CONFIG: Record<
  string,
  { label: { en: string; ar: string }; color: string; bg: string }
> = {
  open: { label: { en: 'Open', ar: 'مفتوح' }, color: '#FFBE5C', bg: '#FFBE5C22' },
  under_review: {
    label: { en: 'Under Review', ar: 'قيد المراجعة' },
    color: '#5CB8FF',
    bg: '#5CB8FF22',
  },
  resolved: { label: { en: 'Resolved', ar: 'محلول' }, color: '#56D8B1', bg: '#56D8B122' },
  closed: { label: { en: 'Closed', ar: 'مغلق' }, color: '#A8A5C0', bg: '#A8A5C022' },
};

function FileDisputeForm({
  bookingId,
  from,
  to,
  lang,
  t,
}: {
  bookingId: string;
  from?: string;
  to?: string;
  lang: string;
  t: (key: string) => string;
}) {
  const router = useRouter();
  const createDispute = useCreateDispute();
  const [selectedReason, setSelectedReason] = useState<DisputeReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError(lang === 'ar' ? 'يرجى اختيار سبب' : 'Please select a reason');
      return;
    }
    setError('');
    try {
      await createDispute.mutateAsync({
        bookingId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      setError(
        lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.'
      );
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-bubble-md"
          style={{ background: 'linear-gradient(135deg, #7C6AFF, #FF6B9D)' }}
        >
          <ShieldCheck size={48} color="#fff" />
        </div>
        <h2 className="text-2xl font-bold text-v2-text mb-3">
          {lang === 'ar' ? 'تم تقديم البلاغ' : 'Dispute Filed'}
        </h2>
        <p className="text-v2-text-secondary text-sm max-w-xs leading-relaxed mb-8">
          {lang === 'ar'
            ? 'تلقينا بلاغك وسيراجعه فريقنا قريباً.'
            : 'We received your dispute and our team will review it shortly.'}
        </p>
        <button
          onClick={() => router.back()}
          className="px-8 py-3 rounded-[22px] font-bold text-v2-primary bg-white shadow-bubble-sm"
        >
          {lang === 'ar' ? 'العودة' : 'Go Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Route badge */}
      {(from || to) && (
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-bubble-sm text-sm font-semibold text-v2-text">
          <Shield size={14} className="text-v2-primary" />
          {from} → {to}
        </div>
      )}

      {/* Info banner */}
      <div className="flex gap-3 items-start bg-v2-primary/10 rounded-[18px] p-4">
        <Info size={18} className="text-v2-primary mt-0.5 shrink-0" />
        <p className="text-sm text-v2-primary leading-relaxed">
          {lang === 'ar'
            ? 'يُرجى تقديم التفاصيل بدقة لمساعدة فريقنا في حل النزاع بسرعة. لا يمكن تقديم أكثر من بلاغ واحد لكل حجز.'
            : 'Please provide accurate details to help our team resolve the dispute quickly. Only one dispute can be filed per booking.'}
        </p>
      </div>

      {/* Reason grid */}
      <div>
        <p className="text-sm font-bold text-v2-text mb-3">
          {lang === 'ar' ? 'اختر السبب' : 'Select a reason'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DISPUTE_REASONS.map(({ key, Icon }) => {
            const isSelected = selectedReason === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedReason(key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-[18px] border-2 transition-all ${
                  isSelected
                    ? 'border-v2-primary bg-v2-primary/10 shadow-bubble-sm'
                    : 'border-transparent bg-white shadow-bubble-sm hover:border-v2-primary/40'
                }`}
              >
                <Icon
                  size={24}
                  className={isSelected ? 'text-v2-primary' : 'text-v2-text-secondary'}
                />
                <span
                  className={`text-xs font-semibold text-center leading-tight ${
                    isSelected ? 'text-v2-primary' : 'text-v2-text-secondary'
                  }`}
                >
                  {REASON_LABELS[key][lang as 'en' | 'ar']}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-sm font-bold text-v2-text mb-2">
          {lang === 'ar' ? 'تفاصيل إضافية (اختياري)' : 'Additional details (optional)'}
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={5}
          placeholder={
            lang === 'ar' ? 'اشرح ما حدث بالتفصيل...' : 'Describe what happened in detail...'
          }
          className="w-full rounded-[18px] bg-white border border-gray-200 px-4 py-3 text-sm text-v2-text placeholder-v2-text-secondary shadow-bubble-sm resize-none focus:outline-none focus:ring-2 focus:ring-v2-primary/30"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        />
        <p className="text-xs text-v2-text-secondary text-right mt-1">{description.length}/1000</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-[14px] px-4 py-3">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={createDispute.isPending || !selectedReason}
        className="w-full py-4 rounded-[22px] font-bold text-white text-base shadow-bubble-md disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        style={{ background: 'linear-gradient(135deg, #7C6AFF, #FF6B9D)' }}
      >
        {createDispute.isPending
          ? lang === 'ar'
            ? 'جارٍ الإرسال...'
            : 'Submitting...'
          : lang === 'ar'
            ? 'تقديم البلاغ'
            : 'File Dispute'}
      </button>
    </div>
  );
}

function DisputeContent({ bookingId }: { bookingId: string }) {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;
  const { lang } = useLanguage();
  const t = (key: string) => key;
  const router = useRouter();

  const { data: existingDispute, isLoading } = useBookingDispute(bookingId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5FF] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-v2-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5FF]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#F8F5FF]/90 backdrop-blur-sm border-b border-white/60 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white shadow-bubble-sm flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-v2-text" />
        </button>
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-v2-primary" />
          <h1 className="font-bold text-v2-text text-base">
            {lang === 'ar' ? 'بلاغ نزاع' : 'File a Dispute'}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {existingDispute ? (
          /* Already filed — show status */
          <div className="bg-white rounded-[24px] shadow-bubble-md p-6 space-y-5">
            {/* Status icon */}
            <div className="flex flex-col items-center text-center gap-3 pb-5 border-b border-gray-100">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: STATUS_CONFIG[existingDispute.status]?.bg ?? '#A8A5C022',
                }}
              >
                <ShieldCheck
                  size={32}
                  style={{ color: STATUS_CONFIG[existingDispute.status]?.color ?? '#A8A5C0' }}
                />
              </div>
              <h2 className="text-lg font-bold text-v2-text">
                {lang === 'ar' ? 'تم تقديم البلاغ مسبقاً' : 'Dispute Already Filed'}
              </h2>
              <p className="text-sm text-v2-text-secondary leading-relaxed">
                {lang === 'ar' ? 'فريقنا يراجع هذا البلاغ.' : 'Our team is reviewing this dispute.'}
              </p>
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                style={{
                  backgroundColor: STATUS_CONFIG[existingDispute.status]?.bg ?? '#A8A5C022',
                  color: STATUS_CONFIG[existingDispute.status]?.color ?? '#A8A5C0',
                }}
              >
                {STATUS_CONFIG[existingDispute.status]?.label[lang as 'en' | 'ar'] ??
                  existingDispute.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-v2-text-secondary font-medium">
                  {lang === 'ar' ? 'السبب' : 'Reason'}
                </span>
                <span className="text-sm font-semibold text-v2-text">
                  {REASON_LABELS[existingDispute.reason]?.[lang as 'en' | 'ar'] ??
                    existingDispute.reason}
                </span>
              </div>
              {existingDispute.description && (
                <div className="space-y-1">
                  <span className="text-sm text-v2-text-secondary font-medium">
                    {lang === 'ar' ? 'الوصف' : 'Description'}
                  </span>
                  <p className="text-sm text-v2-text bg-gray-50 rounded-[14px] p-3 leading-relaxed">
                    {existingDispute.description}
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-xs text-v2-text-secondary flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(existingDispute.createdAt).toLocaleDateString(
                    lang === 'ar' ? 'ar-SA' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  )}
                </span>
                <CheckCircle2 size={14} className="text-green-500" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] shadow-bubble-md p-6">
            <FileDisputeForm bookingId={bookingId} from={from} to={to} lang={lang} t={t} />
          </div>
        )}

        {/* Back to bookings link */}
        <div className="mt-6 text-center">
          <Link
            href="/trips"
            className="text-sm text-v2-text-secondary hover:text-v2-primary transition-colors"
          >
            {lang === 'ar' ? '← العودة إلى رحلاتي' : '← Back to My Trips'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DisputePage() {
  const params = useParams<{ bookingId: string }>();

  return (
    <ProtectedRoute>
      <DisputeContent bookingId={params.bookingId} />
    </ProtectedRoute>
  );
}
