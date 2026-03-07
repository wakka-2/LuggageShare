import { Ban } from 'lucide-react';
import InfoPage from '@/components/common/InfoPage';

export default function ProhibitedItemsPage() {
  return (
    <InfoPage
      icon={Ban}
      title="العناصر المحظورة"
      description="يُمنع نقل المواد الخطرة والسوائل والمواد المحظورة قانونياً. الناقل والمرسل مسؤولان عن التأكد من قانونية المحتويات."
      showDownload={false}
    />
  );
}
