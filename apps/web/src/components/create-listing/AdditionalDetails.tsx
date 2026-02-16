'use client';

import { ListingType } from '@/lib/types/listing';

interface AdditionalDetailsProps {
  title: string;
  description: string;
  availableWeight?: number;
  neededWeight?: number;
  listingType: ListingType | null;
  onChange: (details: {
    title: string;
    description: string;
    availableWeight?: number;
    neededWeight?: number;
  }) => void;
}

export function AdditionalDetails({
  title,
  description,
  availableWeight,
  neededWeight,
  listingType,
  onChange,
}: AdditionalDetailsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">تفاصيل إضافية</h2>
      <p className="text-gray-600">أضف المزيد من المعلومات عن إعلانك</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عنوان الإعلان *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange({ title: e.target.value, description, availableWeight, neededWeight })}
            placeholder={
              listingType === 'offer'
                ? 'مثال: الرياض إلى القاهرة - مساحة أمتعة إضافية 15 كجم'
                : 'مثال: أحتاج توصيل أغراض من لندن إلى الرياض'
            }
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">{title.length}/100 حرف</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الوصف
          </label>
          <textarea
            value={description}
            onChange={(e) => onChange({ title, description: e.target.value, availableWeight, neededWeight })}
            placeholder={
              listingType === 'offer'
                ? 'صف رحلتك وكيف يمكنك المساعدة...'
                : 'صف ما تحتاج لتوصيله...'
            }
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">{description.length}/500 حرف</p>
        </div>

        {listingType === 'offer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وزن الأمتعة المتاح (كجم)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={availableWeight || ''}
              onChange={(e) =>
                onChange({
                  title,
                  description,
                  availableWeight: parseFloat(e.target.value) || undefined,
                  neededWeight,
                })
              }
              placeholder="مثال: 15"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              كم مساحة إضافية متوفرة لديك؟
            </p>
          </div>
        )}

        {listingType === 'request' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوزن المطلوب (كجم)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={neededWeight || ''}
              onChange={(e) =>
                onChange({
                  title,
                  description,
                  availableWeight,
                  neededWeight: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="مثال: 10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              كم وزن تحتاج لنقله؟
            </p>
          </div>
        )}
      </div>

      {title.trim() && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 me-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">معاينة الإعلان</h4>
              <p className="text-sm text-blue-700">
                إعلانك جاهز! راجع جميع الخطوات واضغط "إنشاء الإعلان" عند الانتهاء.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
