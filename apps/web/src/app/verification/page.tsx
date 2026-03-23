'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, BookOpen, Car, ShieldCheck, Info, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useLanguage } from '@/providers/LanguageProvider';
import apiClient from '@/lib/api';

const DOCUMENT_TYPES = [
  {
    key: 'national_id',
    labelKey: 'verification.nationalId',
    Icon: CreditCard,
    color: 'v2-primary',
  },
  { key: 'passport', labelKey: 'verification.passport', Icon: BookOpen, color: 'v2-accent3' },
  {
    key: 'driving_license',
    labelKey: 'verification.drivingLicense',
    Icon: Car,
    color: 'v2-accent2',
  },
] as const;

export default function VerificationPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [fullName, setFullName] = useState('');

  const { data: status, isLoading } = useQuery({
    queryKey: ['verification-status'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/me/verification');
      return data.data ?? data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/users/me/verify', {
        documentType: selectedType,
        documentNumber,
        ...(fullName.trim() && { fullName: fullName.trim() }),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !documentNumber.trim()) return;
    submitMutation.mutate();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          {/* Back nav */}
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-v2-text-soft hover:text-v2-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('profile.title')}
          </Link>

          <h1 className="text-2xl font-extrabold text-v2-text mb-6">{t('profile.verification')}</h1>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-16 bg-white rounded-[22px] shadow-bubble-sm" />
              <div className="h-4 w-40 bg-white rounded-full" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-24 bg-white rounded-[22px] shadow-bubble-sm" />
                <div className="h-24 bg-white rounded-[22px] shadow-bubble-sm" />
                <div className="h-24 bg-white rounded-[22px] shadow-bubble-sm" />
              </div>
            </div>
          ) : status?.isVerified || submitMutation.isSuccess ? (
            /* Verified state */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-28 h-28 rounded-full bg-v2-mint/15 flex items-center justify-center mb-6">
                <ShieldCheck className="w-14 h-14 text-v2-mint" />
              </div>
              <h2 className="text-xl font-bold text-v2-text mb-3">
                {t('verification.identityVerified')}
              </h2>
              <p className="text-v2-text-soft max-w-xs leading-relaxed">
                {t('verification.verifiedDescription')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Info card */}
              <div className="flex items-start gap-3 bg-v2-primary/10 rounded-[18px] p-4">
                <div className="w-9 h-9 rounded-full bg-v2-primary/15 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-v2-primary" />
                </div>
                <p className="text-sm text-v2-text leading-relaxed">
                  {t('verification.infoMessage')}
                </p>
              </div>

              {/* Document type */}
              <div>
                <p className="text-[15px] font-semibold text-v2-text mb-3">
                  {t('verification.documentType')}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {DOCUMENT_TYPES.map(({ key, labelKey, Icon }) => {
                    const isSelected = selectedType === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setSelectedType(key)}
                        className={`flex flex-col items-center gap-2 py-4 px-2 rounded-[18px] shadow-bubble-sm transition-all ${
                          isSelected
                            ? 'bg-v2-primary/8 border-2 border-v2-primary'
                            : 'bg-white border-2 border-transparent hover:border-v2-primary/20'
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-v2-primary/15' : 'bg-v2-text-muted/10'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${isSelected ? 'text-v2-primary' : 'text-v2-text-muted'}`}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-semibold text-center leading-tight ${
                            isSelected ? 'text-v2-primary' : 'text-v2-text-soft'
                          }`}
                        >
                          {t(labelKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document number */}
              <div>
                <label className="block text-[15px] font-semibold text-v2-text mb-2">
                  {t('verification.documentNumber')}
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value.toUpperCase())}
                  placeholder={t('verification.enterDocumentNumber')}
                  required
                  className="w-full h-12 rounded-[14px] bg-white shadow-bubble-xs px-5 text-v2-text placeholder:text-v2-text-muted focus:outline-none focus:ring-2 focus:ring-v2-primary/30"
                />
              </div>

              {/* Full name (optional) */}
              <div>
                <label className="block text-[15px] font-semibold text-v2-text mb-2">
                  {t('verification.fullNameOptional')}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('verification.fullNamePlaceholder')}
                  className="w-full h-12 rounded-[14px] bg-white shadow-bubble-xs px-5 text-v2-text placeholder:text-v2-text-muted focus:outline-none focus:ring-2 focus:ring-v2-primary/30"
                />
              </div>

              {/* Error */}
              {submitMutation.isError && (
                <p className="text-sm text-v2-secondary">{t('verification.submitFailed')}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!selectedType || !documentNumber.trim() || submitMutation.isPending}
                className="w-full h-13 rounded-full bg-gradient-to-r from-v2-primary to-v2-accent1 text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('verification.submitRequest')
                )}
              </button>
            </form>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
