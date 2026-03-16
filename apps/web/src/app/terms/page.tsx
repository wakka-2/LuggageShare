'use client';

import { FileText } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';
import { useLanguage } from '@/providers/LanguageProvider';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <InfoPage icon={FileText} titleKey="pages.termsTitle">
      <p className="text-xs text-v2-text-muted">{t('pages.termsLastUpdated')}</p>
      <p>{t('pages.termsIntro')}</p>

      <h2>{t('pages.termsTitle')}</h2>
      <h3>1. {t('pages.termsEligibility').split('.')[0]}</h3>
      <p>{t('pages.termsEligibility')}</p>

      <h3>2. {t('wp.footerAbout')}</h3>
      <p>{t('pages.termsServices')}</p>

      <h3>3. {t('nav.myTrips')}</h3>
      <p>{t('pages.termsBookings')}</p>

      <h3>4. {t('booking.total')}</h3>
      <p>{t('pages.termsPayments')}</p>

      <h3>5. {t('pages.prohibitedTitle')}</h3>
      <p>{t('pages.termsProhibited')}</p>

      <h3>6. {t('pages.termsLiability').split('.')[0]}</h3>
      <p>{t('pages.termsLiability')}</p>

      <h3>7. {t('pages.termsTermination').split('.')[0]}</h3>
      <p>{t('pages.termsTermination')}</p>

      <h3>8. {t('pages.termsChanges').split('.')[0]}</h3>
      <p>{t('pages.termsChanges')}</p>

      <hr />
      <p>{t('pages.termsContact')}</p>
    </InfoPage>
  );
}
