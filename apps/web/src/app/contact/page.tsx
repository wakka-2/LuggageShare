'use client';

import { Mail } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';
import { useLanguage } from '@/providers/LanguageProvider';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <InfoPage icon={Mail} titleKey="pages.contactTitle">
      <p>{t('pages.contactIntro')}</p>

      <h2>{t('pages.contactEmail')}</h2>
      <p>
        <a href="mailto:support@luggageshare.com">{t('pages.contactEmailValue')}</a>
        <br />
        {t('pages.contactEmailDesc')}
      </p>

      <h2>{t('pages.contactSocial')}</h2>
      <ul>
        <li>{t('pages.contactTwitter')}</li>
        <li>{t('pages.contactInstagram')}</li>
      </ul>

      <h2>{t('pages.contactHours')}</h2>
      <p>{t('pages.contactHoursValue')}</p>

      <h2>{t('pages.contactOffice')}</h2>
      <p>{t('pages.contactOfficeValue')}</p>
    </InfoPage>
  );
}
