'use client';

import { ShieldCheck } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';
import { useLanguage } from '@/providers/LanguageProvider';

export default function SafetyPage() {
  const { t } = useLanguage();

  return (
    <InfoPage icon={ShieldCheck} titleKey="pages.safetyTitle">
      <p>{t('pages.safetyIntro')}</p>

      <h2>{t('pages.safetyVerification').split('.')[0]}</h2>
      <p>{t('pages.safetyVerification')}</p>

      <h2>{t('pages.safetyReviews').split('.')[0]}</h2>
      <p>{t('pages.safetyReviews')}</p>

      <h2>{t('pages.safetyChat').split('.')[0]}</h2>
      <p>{t('pages.safetyChat')}</p>

      <h2>{t('pages.safetyPayments').split('.')[0]}</h2>
      <p>{t('pages.safetyPayments')}</p>

      <h2>{t('pages.safetyTips').split('.')[0]}</h2>
      <p>{t('pages.safetyTips')}</p>

      <hr />
      <p>
        <strong>{t('pages.safetyReport')}</strong>
      </p>
    </InfoPage>
  );
}
