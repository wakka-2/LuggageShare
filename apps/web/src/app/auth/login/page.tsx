import { LogIn } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function LoginPage() {
  return (
    <InfoPage
      icon={LogIn}
      title="تسجيل الدخول"
      description="تسجيل الدخول متاح حالياً عبر تطبيق حصتي. حمل التطبيق للتسجيل والدخول بحسابك."
    />
  );
}
