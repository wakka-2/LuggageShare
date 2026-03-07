import { ShieldCheck } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function SafetyPage() {
  return (
    <InfoPage
      icon={ShieldCheck}
      title="السلامة"
      description="سلامتك أولويتنا. جميع الناقلين يخضعون للتحقق من الهوية، ونوفر نظام تقييم ومراجعات لضمان تجربة آمنة."
      showDownload={false}
    />
  );
}
