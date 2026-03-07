'use client';

import { useState, useCallback } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Send, Loader2, History } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Modal from '@/components/common/Modal';
import { useWalletBalance, useTransactionHistory, useWithdrawal } from '@/hooks/useWallet';
import type { Transaction } from '@/hooks/useWallet';

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isIncomeType(type: string): boolean {
  return (
    type === 'BOOKING_PAYMENT' ||
    type === 'REFUND' ||
    type === 'commission' ||
    type === 'top_up' ||
    type === 'refund'
  );
}

function getTransactionLabel(type: string): string {
  const labels: Record<string, string> = {
    BOOKING_PAYMENT: 'دفعة حجز',
    WITHDRAWAL: 'سحب',
    REFUND: 'استرداد',
    COMMISSION: 'عمولة',
    commission: 'عمولة',
    top_up: 'إيداع',
    refund: 'استرداد',
  };
  return labels[type] ?? type;
}

function getStatusBadge(status?: string) {
  if (!status) return null;
  const map: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: 'مكتمل', className: 'bg-v2-mint/15 text-emerald-700' },
    PENDING: { label: 'قيد الانتظار', className: 'bg-v2-amber/15 text-amber-700' },
    FAILED: { label: 'فشل', className: 'bg-v2-secondary/15 text-v2-secondary' },
  };
  const badge = map[status];
  if (!badge) return null;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
      {badge.label}
    </span>
  );
}

/* ---------- Skeleton components ---------- */

function BalanceSkeleton() {
  return (
    <div className="bg-white rounded-[22px] p-6 shadow-bubble-md animate-pulse">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-v2-primary/10" />
        <div className="h-5 w-28 bg-v2-primary/10 rounded-full" />
      </div>
      <div className="h-10 w-40 bg-v2-primary/10 rounded-xl mb-5" />
      <div className="h-11 w-36 bg-v2-primary/10 rounded-full" />
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="bg-white rounded-[22px] p-4 shadow-bubble-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-v2-primary/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-v2-primary/10 rounded-full" />
          <div className="h-3 w-20 bg-v2-primary/5 rounded-full" />
        </div>
        <div className="h-5 w-16 bg-v2-primary/10 rounded-full" />
      </div>
    </div>
  );
}

/* ---------- Withdrawal form ---------- */

function WithdrawalForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [iban, setIban] = useState('');

  const withdrawal = useWithdrawal();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const numericAmount = parseFloat(amount);
      if (!numericAmount || numericAmount <= 0 || !bankName.trim() || !iban.trim()) return;

      withdrawal.mutate(
        { amount: numericAmount, bankAccountName: bankName.trim(), iban: iban.trim() },
        {
          onSuccess: () => {
            onSuccess();
            onClose();
          },
        }
      );
    },
    [amount, bankName, iban, withdrawal, onSuccess, onClose]
  );

  const inputClasses =
    'w-full rounded-xl border border-v2-primary/15 bg-v2-bg/50 px-4 py-3 text-v2-text placeholder:text-v2-text-muted focus:outline-none focus:ring-2 focus:ring-v2-primary/30 focus:border-v2-primary/40 transition-all text-sm';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div>
        <label htmlFor="wd-amount" className="block text-sm font-semibold text-v2-text mb-1.5">
          المبلغ (ر.س)
        </label>
        <input
          id="wd-amount"
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

      {/* Bank name */}
      <div>
        <label htmlFor="wd-bank" className="block text-sm font-semibold text-v2-text mb-1.5">
          اسم البنك
        </label>
        <input
          id="wd-bank"
          type="text"
          required
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="مثال: البنك الأهلي"
          className={inputClasses}
        />
      </div>

      {/* IBAN */}
      <div>
        <label htmlFor="wd-iban" className="block text-sm font-semibold text-v2-text mb-1.5">
          رقم الآيبان (IBAN)
        </label>
        <input
          id="wd-iban"
          type="text"
          required
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          placeholder="SA0000000000000000000000"
          className={inputClasses}
          dir="ltr"
        />
      </div>

      {/* Error */}
      {withdrawal.isError && (
        <p className="text-sm text-v2-secondary" role="alert">
          حدث خطأ أثناء السحب. يرجى المحاولة مرة أخرى.
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={withdrawal.isPending}
        className="w-full flex items-center justify-center gap-2 v2-gradient-primary text-white font-semibold py-3 rounded-full shadow-bubble-sm hover:shadow-bubble-md disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {withdrawal.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {withdrawal.isPending ? 'جاري السحب...' : 'تأكيد السحب'}
      </button>
    </form>
  );
}

/* ---------- Main page ---------- */

export default function WalletPage() {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const { data: balanceData, isLoading: balanceLoading } = useWalletBalance();
  const { data: transactions, isLoading: txLoading } = useTransactionHistory();

  const handleWithdrawalSuccess = useCallback(() => {
    // Queries are auto-invalidated by the useWithdrawal hook onSuccess
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          {/* Page title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full v2-gradient-primary flex items-center justify-center shadow-bubble-xs">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-v2-text">المحفظة</h1>
              <p className="text-sm text-v2-text-soft">الرصيد والمعاملات المالية</p>
            </div>
          </div>

          {/* Balance card */}
          {balanceLoading ? (
            <BalanceSkeleton />
          ) : (
            <div className="bg-white rounded-[22px] p-6 shadow-bubble-md mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-v2-primary" />
                </div>
                <p className="text-sm font-semibold text-v2-text-soft">الرصيد الحالي</p>
              </div>

              <p className="text-4xl font-extrabold text-v2-text mt-3 mb-5" dir="ltr">
                <span>{formatCurrency(balanceData?.balance ?? 0)}</span>
                <span className="text-lg font-bold text-v2-text-muted mr-2"> ر.س</span>
              </p>

              <button
                onClick={() => setIsWithdrawOpen(true)}
                className="inline-flex items-center gap-2 v2-gradient-primary text-white font-semibold px-6 py-2.5 rounded-full shadow-bubble-sm hover:shadow-bubble-md transition-all"
              >
                <Send className="w-4 h-4" />
                سحب الرصيد
              </button>
            </div>
          )}

          {/* Transaction history */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-v2-primary" />
              <h2 className="text-lg font-extrabold text-v2-text">سجل المعاملات</h2>
            </div>

            {txLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <TransactionSkeleton key={i} />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx: Transaction) => {
                  const income = isIncomeType(tx.type);
                  return (
                    <div
                      key={tx.id}
                      className="bg-white rounded-[22px] p-4 shadow-bubble-sm hover:shadow-bubble-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon */}
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

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-v2-text truncate">
                              {tx.description || getTransactionLabel(tx.type)}
                            </p>
                            {(tx as Transaction & { status?: string }).status &&
                              getStatusBadge((tx as Transaction & { status?: string }).status)}
                          </div>
                          <p className="text-xs text-v2-text-muted mt-0.5">
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>

                        {/* Amount */}
                        <p
                          className={`text-sm font-bold flex-shrink-0 ${
                            income ? 'text-emerald-600' : 'text-v2-secondary'
                          }`}
                          dir="ltr"
                        >
                          {income ? '+' : '-'}
                          {formatCurrency(Math.abs(tx.amount))} ر.س
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
                <h3 className="text-base font-bold text-v2-text mb-1">لا توجد معاملات</h3>
                <p className="text-sm text-v2-text-soft">
                  ستظهر معاملاتك المالية هنا عند إتمام أول حجز
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />

        {/* Withdrawal modal */}
        <Modal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} title="سحب الرصيد">
          <WithdrawalForm
            onSuccess={handleWithdrawalSuccess}
            onClose={() => setIsWithdrawOpen(false)}
          />
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
