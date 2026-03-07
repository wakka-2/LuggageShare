import { Lock } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function PrivacyPage() {
  return (
    <InfoPage
      icon={Lock}
      title="سياسة الخصوصية"
      description="نحن نحمي بياناتك الشخصية ولا نشاركها مع أطراف ثالثة. سيتم نشر سياسة الخصوصية الكاملة قريباً."
      showDownload={false}
    />
  );
}
