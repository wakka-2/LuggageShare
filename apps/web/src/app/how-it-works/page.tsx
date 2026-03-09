'use client';

import { HelpCircle } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';
import { useLanguage } from '@/providers/LanguageProvider';

export default function HowItWorksPage() {
  const { t } = useLanguage();

  const steps = [
    { title: t('pages.howStep1Title'), desc: t('pages.howStep1Desc') },
    { title: t('pages.howStep2Title'), desc: t('pages.howStep2Desc') },
    { title: t('pages.howStep3Title'), desc: t('pages.howStep3Desc') },
    { title: t('pages.howStep4Title'), desc: t('pages.howStep4Desc') },
    { title: t('pages.howStep5Title'), desc: t('pages.howStep5Desc') },
  ];

  return (
    <InfoPage icon={HelpCircle} titleKey="pages.howItWorksTitle">
      <p>{t('pages.howItWorksIntro')}</p>

      {steps.map((step, i) => (
        <div key={i}>
          <h2>{step.title}</h2>
          <p>{step.desc}</p>
        </div>
      ))}
    </InfoPage>
  );
}
