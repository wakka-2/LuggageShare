import { UserPlus } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function RegisterPage() {
  return (
    <InfoPage
      icon={UserPlus}
      title="إنشاء حساب"
      description="إنشاء الحساب متاح حالياً عبر تطبيق حصتي. حمل التطبيق وسجل بحساب Google أو Apple."
    />
  );
}
