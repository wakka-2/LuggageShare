'use client';

import { Briefcase } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';
import { useLanguage } from '@/providers/LanguageProvider';

export default function CareersPage() {
  const { t } = useLanguage();

  return (
    <InfoPage icon={Briefcase} titleKey="pages.careersTitle">
      <p>{t('pages.careersIntro')}</p>

      <h2>{t('pages.careersWhy').split(',')[0]}</h2>
      <p>{t('pages.careersWhy')}</p>

      <h2>{t('pages.careersCulture').split('.')[0]}</h2>
      <p>{t('pages.careersCulture')}</p>

      <h2>{t('pages.careersOpen').split('.')[0]}</h2>
      <p>{t('pages.careersOpen')}</p>

      <hr />
      <p>
        <strong>{t('pages.careersApply')}</strong>
      </p>
    </InfoPage>
  );
}
