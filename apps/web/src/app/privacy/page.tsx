'use client';

import { Lock } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';
import { useLanguage } from '@/providers/LanguageProvider';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <InfoPage icon={Lock} titleKey="pages.privacyTitle">
      <p className="text-xs text-v2-text-muted">{t('pages.privacyLastUpdated')}</p>
      <p>{t('pages.privacyIntro')}</p>

      <h2>{t('pages.privacyCollect').split('.')[0]}</h2>
      <p>{t('pages.privacyCollect')}</p>

      <h2>{t('pages.privacyUse').split('.')[0]}</h2>
      <p>{t('pages.privacyUse')}</p>

      <h2>{t('pages.privacySharing').split('.')[0]}</h2>
      <p>{t('pages.privacySharing')}</p>

      <h2>{t('pages.privacySecurity').split('.')[0]}</h2>
      <p>{t('pages.privacySecurity')}</p>

      <h2>{t('pages.privacyRights').split('.')[0]}</h2>
      <p>{t('pages.privacyRights')}</p>

      <h2>{t('pages.privacyCookies').split('.')[0]}</h2>
      <p>{t('pages.privacyCookies')}</p>

      <h2>{t('pages.privacyRetention').split('.')[0]}</h2>
      <p>{t('pages.privacyRetention')}</p>

      <hr />
      <p>{t('pages.privacyContact')}</p>
    </InfoPage>
  );
}
