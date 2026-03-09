'use client';

import { LifeBuoy } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';
import { useLanguage } from '@/providers/LanguageProvider';

export default function HelpPage() {
  const { t } = useLanguage();

  const faqs = [
    { q: t('pages.helpQ1'), a: t('pages.helpA1') },
    { q: t('pages.helpQ2'), a: t('pages.helpA2') },
    { q: t('pages.helpQ3'), a: t('pages.helpA3') },
    { q: t('pages.helpQ4'), a: t('pages.helpA4') },
    { q: t('pages.helpQ5'), a: t('pages.helpA5') },
    { q: t('pages.helpQ6'), a: t('pages.helpA6') },
  ];

  return (
    <InfoPage icon={LifeBuoy} titleKey="pages.helpTitle">
      <p>{t('pages.helpIntro')}</p>

      {faqs.map((faq, i) => (
        <div key={i}>
          <h3>{faq.q}</h3>
          <p>{faq.a}</p>
        </div>
      ))}
    </InfoPage>
  );
}
