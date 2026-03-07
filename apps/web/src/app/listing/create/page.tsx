import { PlusCircle } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function CreateListingPage() {
  return (
    <InfoPage
      icon={PlusCircle}
      title="أضف رحلتك"
      description="هذه الميزة متاحة حالياً في تطبيق حصتي. حمل التطبيق لإضافة رحلاتك والبدء بالكسب."
    />
  );
}
