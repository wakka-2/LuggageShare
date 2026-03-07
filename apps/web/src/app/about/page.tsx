import { Building2 } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function AboutPage() {
  return (
    <InfoPage
      icon={Building2}
      title="من نحن"
      description="حصتي هي منصة سعودية لمشاركة مساحة الأمتعة بين المسافرين. نربط بين من لديهم مساحة فارغة ومن يحتاجون لإرسال أغراضهم."
      showDownload={false}
    />
  );
}
