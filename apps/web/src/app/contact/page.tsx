import { Mail } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function ContactPage() {
  return (
    <InfoPage
      icon={Mail}
      title="تواصل معنا"
      description="لأي استفسارات أو ملاحظات، راسلنا على support@luggageshare.com وسنرد عليك في أقرب وقت."
      showDownload={false}
    />
  );
}
