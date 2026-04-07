'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Ticket,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/providers/LanguageProvider';
import apiClient from '@/lib/api';

const CATEGORIES = ['general', 'bug', 'billing', 'account', 'safety'] as const;

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    description: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [ticketId, setTicketId] = useState<string | null>(null);

  const categoryLabels: Record<string, string> = {
    general: t('pages.ticketCategoryGeneral'),
    bug: t('pages.ticketCategoryBug'),
    billing: t('pages.ticketCategoryBilling'),
    account: t('pages.ticketCategoryAccount'),
    safety: t('pages.ticketCategorySafety'),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const { data } = await apiClient.post('/tickets', form);
      setTicketId(data?.id || data);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', category: 'general', description: '' });
    } catch {
      setStatus('error');
    }
  };

  const isValid =
    form.name.length >= 2 &&
    form.email.includes('@') &&
    form.subject.length >= 5 &&
    form.description.length >= 10;

  return (
    <div className="min-h-screen flex flex-col blob-background">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-v2-text-soft hover:text-v2-text mb-6 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          {t('wp.back')}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-v2-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-v2-text">{t('pages.contactTitle')}</h1>
            <p className="text-v2-text-soft text-sm">{t('pages.contactIntro')}</p>
          </div>
        </div>

        {/* Ticket Form */}
        <div className="bg-white rounded-[22px] shadow-bubble-sm p-6 md:p-8 mb-6">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-v2-text mb-2">{t('pages.ticketSuccess')}</h2>
              {ticketId && (
                <p className="text-v2-text-soft text-sm mb-4">
                  {t('pages.ticketId')}: <span className="font-mono font-bold">{ticketId}</span>
                </p>
              )}
              <button
                onClick={() => {
                  setStatus('idle');
                  setTicketId(null);
                }}
                className="mt-4 px-6 py-2 bg-v2-primary text-white rounded-full font-semibold hover:bg-v2-primary/90 transition-colors"
              >
                {t('pages.contactTitle')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Email row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-v2-text mb-1.5">
                    {t('pages.ticketName')}
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t('pages.ticketNamePlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-v2-primary focus:ring-2 focus:ring-v2-primary/20 outline-none transition-all text-sm"
                    required
                    minLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-v2-text mb-1.5">
                    {t('pages.ticketEmail')}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t('pages.ticketEmailPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-v2-primary focus:ring-2 focus:ring-v2-primary/20 outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* Subject & Category row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-v2-text mb-1.5">
                    {t('pages.ticketSubject')}
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder={t('pages.ticketSubjectPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-v2-primary focus:ring-2 focus:ring-v2-primary/20 outline-none transition-all text-sm"
                    required
                    minLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-v2-text mb-1.5">
                    {t('pages.ticketCategory')}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-v2-primary focus:ring-2 focus:ring-v2-primary/20 outline-none transition-all text-sm bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-v2-text mb-1.5">
                  {t('pages.ticketDescription')}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t('pages.ticketDescriptionPlaceholder')}
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-v2-primary focus:ring-2 focus:ring-v2-primary/20 outline-none transition-all text-sm resize-none"
                  required
                  minLength={10}
                />
                <p className="text-xs text-v2-text-soft mt-1">{form.description.length}/5000</p>
              </div>

              {/* Error message */}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {t('pages.ticketError')}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || status === 'submitting'}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-v2-primary text-white rounded-full font-semibold hover:bg-v2-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  t('pages.ticketSubmitting')
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t('pages.ticketSubmit')}
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-[18px] shadow-bubble-sm p-5">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-bold text-v2-text text-sm mb-1">{t('pages.contactEmail')}</h3>
            <p className="text-v2-text-soft text-xs mb-2">{t('pages.ticketOrEmail')}</p>
            <a
              href="mailto:help@luggageshare.com"
              className="text-v2-primary text-sm font-semibold hover:underline"
            >
              help@luggageshare.com
            </a>
          </div>

          <div className="bg-white rounded-[18px] shadow-bubble-sm p-5">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-bold text-v2-text text-sm mb-1">{t('pages.contactHours')}</h3>
            <p className="text-v2-text-soft text-xs">{t('pages.contactHoursValue')}</p>
          </div>

          <div className="bg-white rounded-[18px] shadow-bubble-sm p-5">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="font-bold text-v2-text text-sm mb-1">{t('pages.contactSocial')}</h3>
            <p className="text-v2-text-soft text-xs">{t('pages.contactTwitter')}</p>
            <p className="text-v2-text-soft text-xs">{t('pages.contactInstagram')}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
