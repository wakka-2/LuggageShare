import { HelpCircle } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function HowItWorksPage() {
  return (
    <InfoPage
      icon={HelpCircle}
      title="كيف يعمل"
      description="ابحث عن رحلة مناسبة، تواصل مع الناقل، سلم أغراضك واستلمها في الوجهة. بسيط وآمن."
      showDownload={false}
    />
  );
}
