'use client';

import { Check, X, Loader2, ShieldCheck, Inbox } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/providers/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  useAdminPendingTopUps,
  useConfirmTopUp,
  useRejectTopUp,
  type TopUpRequestRow,
} from '@/hooks/useWallet';

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminTopUpsPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const ar = lang === 'ar';
  const locale = ar ? 'ar-SA' : 'en-US';

  const { data: pending, isLoading } = useAdminPendingTopUps();
  const confirm = useConfirmTopUp();
  const reject = useRejectTopUp();

  const L = {
    title: ar ? 'تأكيد عمليات الشحن' : 'Top-up confirmations',
    subtitle: ar
      ? 'اعتمد التحويلات المستلمة لإضافة الرصيد'
      : 'Approve received transfers to credit users',
    noAccess: ar ? 'هذه الصفحة للمشرفين فقط' : 'This page is for admins only',
    empty: ar ? 'لا توجد طلبات قيد الانتظار' : 'No pending requests',
    confirm: ar ? 'تأكيد' : 'Confirm',
    reject: ar ? 'رفض' : 'Reject',
    reference: ar ? 'المرجع' : 'Ref',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-v2-text">{L.title}</h1>
              <p className="text-sm text-v2-text-soft">{L.subtitle}</p>
            </div>
          </div>

          {!user?.isAdmin ? (
            <div className="bg-white rounded-[22px] p-8 shadow-bubble-sm text-center text-v2-text-soft">
              {L.noAccess}
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[22px] p-4 shadow-bubble-sm h-20 animate-pulse"
                />
              ))}
            </div>
          ) : pending && pending.length > 0 ? (
            <div className="space-y-3">
              {pending.map((req: TopUpRequestRow) => {
                const busy =
                  (confirm.isPending && confirm.variables === req.id) ||
                  (reject.isPending && reject.variables?.id === req.id);
                return (
                  <div key={req.id} className="bg-white rounded-[22px] p-4 shadow-bubble-sm">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-v2-text truncate">
                          {req.user?.name ?? req.userId}
                        </p>
                        <p className="text-xs text-v2-text-muted truncate">{req.user?.email}</p>
                        <p className="text-xs text-v2-text-muted mt-0.5">
                          {formatDate(req.createdAt, locale)}
                          {req.reference ? ` · ${L.reference}: ${req.reference}` : ''}
                        </p>
                      </div>
                      <div className="text-xl font-extrabold text-v2-text" dir="ltr">
                        {Number(req.amount).toFixed(2)} SAR
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => confirm.mutate(req.id)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-60"
                        >
                          {busy && confirm.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          {L.confirm}
                        </button>
                        <button
                          onClick={() => reject.mutate({ id: req.id })}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 border border-v2-secondary/40 text-v2-secondary text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-60"
                        >
                          <X className="w-4 h-4" />
                          {L.reject}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[22px] p-8 shadow-bubble-sm text-center">
              <div className="w-14 h-14 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-7 h-7 text-v2-primary" />
              </div>
              <h3 className="text-base font-bold text-v2-text">{L.empty}</h3>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
