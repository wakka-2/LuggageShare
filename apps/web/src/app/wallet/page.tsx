'use client';

import { useState, useCallback } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  History,
  Copy,
  Check,
  Gift,
  ShieldCheck,
  Banknote,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/providers/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Modal from '@/components/common/Modal';
import {
  useWalletBalance,
  useTransactionHistory,
  useRequestTopUp,
  useMyTopUps,
  type Transaction,
  type TopUpResult,
} from '@/hooks/useWallet';

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

function formatDate(dateStr: string, locale = 'ar-SA'): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Bilingual labels for the new credit UI (avoids depending on missing i18n keys).
function labels(lang: string) {
  const ar = lang === 'ar';
  return {
    creditsTitle: ar ? 'المحفظة' : 'Credits',
    creditsSubtitle: ar ? 'رصيد النقاط لرسوم المنصة' : 'Your credit balance for platform fees',
    balance: ar ? 'الرصيد' : 'Balance',
    topUp: ar ? 'شحن الرصيد' : 'Top up credits',
    topUpTitle: ar ? 'شحن الرصيد' : 'Top up credits',
    amount: ar ? 'المبلغ' : 'Amount',
    reference: ar ? 'مرجع التحويل (اختياري)' : 'Transfer reference (optional)',
    submit: ar ? 'متابعة' : 'Continue',
    submitting: ar ? 'جارٍ الإرسال...' : 'Submitting...',
    transferTo: ar ? 'حوّل إلى هذا الحساب' : 'Transfer to this account',
    iban: 'IBAN',
    bank: ar ? 'البنك' : 'Bank',
    accountName: ar ? 'اسم الحساب' : 'Account name',
    copied: ar ? 'تم النسخ' : 'Copied',
    copy: ar ? 'نسخ' : 'Copy',
    pendingNote: ar
      ? 'سيُضاف رصيدك بعد تأكيد استلام التحويل.'
      : 'Your credits are added once we confirm the transfer.',
    done: ar ? 'تم' : 'Done',
    error: ar ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again',
    inviteTitle: ar ? 'ادعُ أصدقاءك' : 'Invite friends',
    inviteDesc: ar
      ? 'شارك رمزك — تحصل على 10 نقاط لكل صديق يسجّل به.'
      : 'Share your code — earn 10 credits for every friend who signs up.',
    yourCode: ar ? 'رمز الدعوة' : 'Your invite code',
    transactions: ar ? 'العمليات' : 'Transactions',
    noTx: ar ? 'لا توجد عمليات بعد' : 'No transactions yet',
    adminLink: ar ? 'لوحة تأكيد الشحن' : 'Top-up admin',
    pending: ar ? 'قيد الانتظار' : 'Pending',
    confirmed: ar ? 'مؤكد' : 'Confirmed',
    rejected: ar ? 'مرفوض' : 'Rejected',
  };
}

function CopyButton({
  value,
  copyLabel,
  copiedLabel,
}: {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 text-xs font-semibold text-v2-primary hover:opacity-80 transition"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}

function TopUpForm({ L, onDone }: { L: ReturnType<typeof labels>; onDone: () => void }) {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [result, setResult] = useState<TopUpResult | null>(null);
  const topUp = useRequestTopUp();

  const inputClasses =
    'w-full rounded-xl border border-v2-primary/15 bg-v2-bg/50 px-4 py-3 text-v2-text placeholder:text-v2-text-muted focus:outline-none focus:ring-2 focus:ring-v2-primary/30 focus:border-v2-primary/40 transition-all text-sm';

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const numericAmount = parseFloat(amount);
      if (!numericAmount || numericAmount <= 0) return;
      topUp.mutate(
        { amount: numericAmount, reference: reference.trim() || undefined },
        { onSuccess: (data) => setResult(data) }
      );
    },
    [amount, reference, topUp]
  );

  // Step 2: show where to transfer.
  if (result) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-v2-bg/60 p-4 space-y-3">
          <div className="flex items-center gap-2 text-v2-text font-semibold">
            <Banknote className="w-4 h-4 text-v2-primary" />
            {L.transferTo}
          </div>
          <div className="text-2xl font-extrabold text-v2-text" dir="ltr">
            {formatCurrency(result.amount)} {result.currency}
          </div>
          <Row label={L.iban} value={result.payTo.iban} L={L} mono />
          <Row label={L.bank} value={result.payTo.bankName} L={L} />
          <Row label={L.accountName} value={result.payTo.accountName} L={L} />
        </div>
        <p className="text-sm text-v2-text-soft">{L.pendingNote}</p>
        <button
          onClick={onDone}
          className="w-full v2-gradient-primary text-white font-semibold py-3 rounded-full shadow-bubble-sm hover:shadow-bubble-md transition-all"
        >
          {L.done}
        </button>
      </div>
    );
  }

  // Step 1: choose amount.
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tu-amount" className="block text-sm font-semibold text-v2-text mb-1.5">
          {L.amount}
        </label>
        <input
          id="tu-amount"
          type="number"
          min="1"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className={inputClasses}
          dir="ltr"
        />
      </div>
      <div>
        <label htmlFor="tu-ref" className="block text-sm font-semibold text-v2-text mb-1.5">
          {L.reference}
        </label>
        <input
          id="tu-ref"
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className={inputClasses}
        />
      </div>
      {topUp.isError && (
        <p className="text-sm text-v2-secondary" role="alert">
          {L.error}
        </p>
      )}
      <button
        type="submit"
        disabled={topUp.isPending}
        className="w-full flex items-center justify-center gap-2 v2-gradient-primary text-white font-semibold py-3 rounded-full shadow-bubble-sm hover:shadow-bubble-md disabled:opacity-60 transition-all"
      >
        {topUp.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        {topUp.isPending ? L.submitting : L.submit}
      </button>
    </form>
  );
}

function Row({
  label,
  value,
  L,
  mono,
}: {
  label: string;
  value: string;
  L: ReturnType<typeof labels>;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-v2-text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <span className={`text-sm font-semibold text-v2-text ${mono ? 'font-mono' : ''}`} dir="ltr">
          {value}
        </span>
        <CopyButton value={value} copyLabel={L.copy} copiedLabel={L.copied} />
      </span>
    </div>
  );
}

export default function WalletPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const L = labels(lang);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const { data: balanceData, isLoading: balanceLoading } = useWalletBalance();
  const { data: transactions, isLoading: txLoading } = useTransactionHistory();
  useMyTopUps(); // prefetch so status shows after a top-up

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          {/* Title + admin link */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-v2-text">{L.creditsTitle}</h1>
                <p className="text-sm text-v2-text-soft">{L.creditsSubtitle}</p>
              </div>
            </div>
            {user?.isAdmin && (
              <Link
                href="/admin/topups"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-v2-primary bg-white px-3 py-2 rounded-full shadow-bubble-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                {L.adminLink}
              </Link>
            )}
          </div>

          {/* Balance card */}
          {balanceLoading ? (
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-md mb-6 h-40 animate-pulse" />
          ) : (
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-md mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-v2-primary" />
                </div>
                <p className="text-sm font-semibold text-v2-text-soft">{L.balance}</p>
              </div>
              <p className="text-4xl font-extrabold text-v2-text mt-3 mb-5" dir="ltr">
                <span>{formatCurrency(balanceData?.balance ?? 0)}</span>
                <span className="text-lg font-bold text-v2-text-muted">
                  {' '}
                  {balanceData?.currency ?? 'SAR'}
                </span>
              </p>
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="inline-flex items-center gap-2 v2-gradient-primary text-white font-semibold px-6 py-2.5 rounded-full shadow-bubble-sm hover:shadow-bubble-md transition-all"
              >
                <Plus className="w-4 h-4" />
                {L.topUp}
              </button>
            </div>
          )}

          {/* Invite card */}
          {user?.inviteCode && (
            <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm mb-8">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-5 h-5 text-v2-primary" />
                <h2 className="text-base font-extrabold text-v2-text">{L.inviteTitle}</h2>
              </div>
              <p className="text-sm text-v2-text-soft mb-3">{L.inviteDesc}</p>
              <div className="flex items-center justify-between rounded-xl bg-v2-bg/60 px-4 py-3">
                <div>
                  <p className="text-[11px] text-v2-text-muted">{L.yourCode}</p>
                  <p
                    className="text-lg font-extrabold tracking-widest text-v2-text font-mono"
                    dir="ltr"
                  >
                    {user.inviteCode}
                  </p>
                </div>
                <CopyButton value={user.inviteCode} copyLabel={L.copy} copiedLabel={L.copied} />
              </div>
            </div>
          )}

          {/* Transaction history */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-v2-primary" />
              <h2 className="text-lg font-extrabold text-v2-text">{L.transactions}</h2>
            </div>

            {txLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[22px] p-4 shadow-bubble-sm h-16 animate-pulse"
                  />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx: Transaction) => {
                  const income = tx.amount >= 0;
                  return (
                    <div key={tx.id} className="bg-white rounded-[22px] p-4 shadow-bubble-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            income ? 'bg-emerald-50' : 'bg-red-50'
                          }`}
                        >
                          {income ? (
                            <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-v2-secondary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-v2-text truncate">
                            {tx.description || tx.type}
                          </p>
                          <p className="text-xs text-v2-text-muted mt-0.5">
                            {formatDate(tx.createdAt, lang === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-bold flex-shrink-0 ${
                            income ? 'text-emerald-600' : 'text-v2-secondary'
                          }`}
                          dir="ltr"
                        >
                          {income ? '+' : '-'}
                          {formatCurrency(Math.abs(tx.amount))} {balanceData?.currency ?? 'SAR'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-[22px] p-8 shadow-bubble-sm text-center">
                <div className="w-14 h-14 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-3">
                  <History className="w-7 h-7 text-v2-primary" />
                </div>
                <h3 className="text-base font-bold text-v2-text mb-1">{L.noTx}</h3>
              </div>
            )}
          </div>
        </main>

        <Footer />

        <Modal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} title={L.topUpTitle}>
          <TopUpForm L={L} onDone={() => setIsTopUpOpen(false)} />
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
