import { Briefcase } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function CareersPage() {
  return (
    <InfoPage
      icon={Briefcase}
      title="الوظائف"
      description="نحن نبني مستقبل مشاركة الأمتعة. انضم إلى فريقنا وساهم في تغيير طريقة إرسال الأغراض."
      showDownload={false}
    />
  );
}
