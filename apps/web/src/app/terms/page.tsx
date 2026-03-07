import { FileText } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function TermsPage() {
  return (
    <InfoPage
      icon={FileText}
      title="شروط الخدمة"
      description="باستخدامك لمنصة حصتي، فإنك توافق على شروط الخدمة الخاصة بنا. سيتم نشر الشروط الكاملة قريباً."
      showDownload={false}
    />
  );
}
