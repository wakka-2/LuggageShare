import { LifeBuoy } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function HelpPage() {
  return (
    <InfoPage
      icon={LifeBuoy}
      title="مركز المساعدة"
      description="هل تحتاج مساعدة؟ تواصل معنا عبر البريد الإلكتروني support@luggageshare.com أو عبر التطبيق."
    />
  );
}
