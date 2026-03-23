'use client';

import { Ban } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';
import { useLanguage } from '@/providers/LanguageProvider';

export default function ProhibitedItemsPage() {
  const { t } = useLanguage();

  return (
    <InfoPage icon={Ban} titleKey="pages.prohibitedTitle">
      <p>{t('pages.prohibitedIntro')}</p>

      <ul>
        <li>{t('pages.prohibitedList1')}</li>
        <li>{t('pages.prohibitedList2')}</li>
        <li>{t('pages.prohibitedList3')}</li>
        <li>{t('pages.prohibitedList4')}</li>
        <li>{t('pages.prohibitedList5')}</li>
        <li>{t('pages.prohibitedList6')}</li>
        <li>{t('pages.prohibitedList7')}</li>
        <li>{t('pages.prohibitedList8')}</li>
      </ul>

      <hr />
      <p>
        <strong>{t('pages.prohibitedResponsibility')}</strong>
      </p>
      <p>{t('pages.prohibitedReport')}</p>
    </InfoPage>
  );
}
