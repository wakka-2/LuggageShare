'use client';

import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';

export function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="hidden md:block bg-v2-bg border-t border-v2-primary/10">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 v2-gradient-primary rounded-2xl flex items-center justify-center shadow-bubble-xs">
                <span className="text-white font-bold text-lg">{lang === 'ar' ? 'ح' : 'L'}</span>
              </div>
              <span className="font-extrabold text-xl text-v2-text">{t('wp.footerBrand')}</span>
            </Link>
            <p className="text-sm text-v2-text-muted">{t('wp.footerTagline')}</p>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-v2-text mb-4">{t('wp.footerCompany')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-v2-text-soft hover:text-v2-primary transition-colors"
                >
                  {t('wp.footerAbout')}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-v2-text-soft hover:text-v2-primary transition-colors"
                >
                  {t('wp.footerHowItWorks')}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-v2-text-soft hover:text-v2-primary transition-colors"
                >
                  {t('wp.footerCareers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-v2-text mb-4">{t('wp.support')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-v2-text-soft hover:text-v2-primary transition-colors"
                >
                  {t('wp.footerHelpCenter')}
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="text-sm text-v2-text-soft hover:text-v2-primary transition-colors"
                >
                  {t('wp.footerSafety')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-v2-text-soft hover:text-v2-primary transition-colors"
                >
                  {t('wp.footerContactUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-v2-text mb-4">{t('wp.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-v2-text-soft hover:text-v2-primary transition-colors"
                >
                  {t('wp.footerTerms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-v2-text-soft hover:text-v2-primary transition-colors"
                >
                  {t('wp.footerPrivacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/prohibited-items"
                  className="text-sm text-v2-text-soft hover:text-v2-primary transition-colors"
                >
                  {t('wp.footerProhibitedItems')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-v2-primary/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-v2-text-muted">
            {t('wp.footerCopyright', {
              brand: t('wp.footerBrand'),
              rights: t('wp.allRightsReserved'),
            })}
          </p>
          <div className="flex gap-3">
            <a
              href="https://twitter.com/luggageshare"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('wp.footerTwitter')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-v2-primary/10 text-v2-primary hover:bg-v2-primary/20 transition-all text-sm font-semibold"
            >
              𝕏
            </a>
            <a
              href="https://instagram.com/luggageshare"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('wp.footerInstagram')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-v2-secondary/10 text-v2-secondary hover:bg-v2-secondary/20 transition-all text-sm font-semibold"
            >
              IG
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
