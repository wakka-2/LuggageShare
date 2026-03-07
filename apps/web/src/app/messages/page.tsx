import { MessageSquare } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function MessagesPage() {
  return (
    <InfoPage
      icon={MessageSquare}
      title="الرسائل"
      description="هذه الميزة متاحة حالياً في تطبيق حصتي. حمل التطبيق للتواصل مع الناقلين والمرسلين."
    />
  );
}
