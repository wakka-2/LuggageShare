import { Plane } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function TripsPage() {
  return (
    <InfoPage
      icon={Plane}
      title="رحلاتي"
      description="هذه الميزة متاحة حالياً في تطبيق حصتي. حمل التطبيق لتتبع رحلاتك وحجوزاتك."
    />
  );
}
