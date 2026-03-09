'use client';

import { Building2 } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';
import { useLanguage } from '@/providers/LanguageProvider';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <InfoPage icon={Building2} titleKey="pages.aboutTitle">
      <p>{t('pages.aboutIntro')}</p>
      <p>{t('pages.aboutMission')}</p>

      <h2>{t('pages.howItWorksTitle')}</h2>
      <p>{t('pages.aboutHow')}</p>

      <h2>{t('pages.aboutValues').split('.')[0]}</h2>
      <p>{t('pages.aboutValues')}</p>

      <h2>{t('pages.aboutTeam').split(',')[0]}</h2>
      <p>{t('pages.aboutTeam')}</p>
    </InfoPage>
  );
}
