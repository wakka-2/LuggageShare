'use client';

import { ItemRestrictions, ITEM_CATEGORIES } from '@/lib/types/listing';

interface RestrictionsSelectionProps {
  restrictions: ItemRestrictions;
  onChange: (restrictions: ItemRestrictions) => void;
}

export function RestrictionsSelection({ restrictions, onChange }: RestrictionsSelectionProps) {
  const toggleAllowed = (key: string) => {
    const newAllowed = restrictions.allowed.includes(key)
      ? restrictions.allowed.filter((k) => k !== key)
      : [...restrictions.allowed, key];
    onChange({ ...restrictions, allowed: newAllowed });
  };

  const toggleNotAllowed = (key: string) => {
    const newNotAllowed = restrictions.notAllowed.includes(key)
      ? restrictions.notAllowed.filter((k) => k !== key)
      : [...restrictions.notAllowed, key];
    onChange({ ...restrictions, notAllowed: newNotAllowed });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">قيود الأغراض</h2>
      <p className="text-gray-600">حدد الأغراض التي يمكنك نقلها والتي لا يمكنك نقلها</p>

      <div className="space-y-6">
        {/* Allowed Items */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">أغراض يمكنني نقلها</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ITEM_CATEGORIES.allowed.map((item) => (
              <button
                key={item.key}
                onClick={() => toggleAllowed(item.key)}
                className={`p-3 border-2 rounded-lg text-start transition-all ${
                  restrictions.allowed.includes(item.key)
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {item.icon === 'phone' && '📱'}
                    {item.icon === 'document' && '📄'}
                    {item.icon === 'shirt' && '👕'}
                    {item.icon === 'sparkles' && '✨'}
                    {item.icon === 'watch' && '⌚'}
                    {item.icon === 'gift' && '🎁'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{item.labelAr}</span>
                </div>
                {restrictions.allowed.includes(item.key) && (
                  <div className="mt-2 flex items-center text-green-600 text-xs">
                    <svg className="w-4 h-4 me-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    مسموح
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Not Allowed Items */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">أغراض لا يمكنني نقلها</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ITEM_CATEGORIES.notAllowed.map((item) => (
              <button
                key={item.key}
                onClick={() => toggleNotAllowed(item.key)}
                className={`p-3 border-2 rounded-lg text-start transition-all ${
                  restrictions.notAllowed.includes(item.key)
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {item.icon === 'water' && '💧'}
                    {item.icon === 'food' && '🍔'}
                    {item.icon === 'wine' && '🍷'}
                    {item.icon === 'diamond' && '💎'}
                    {item.icon === 'battery' && '🔋'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{item.labelAr}</span>
                </div>
                {restrictions.notAllowed.includes(item.key) && (
                  <div className="mt-2 flex items-center text-red-600 text-xs">
                    <svg className="w-4 h-4 me-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    غير مسموح
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ملاحظات إضافية (اختياري)
          </label>
          <textarea
            value={restrictions.notes || ''}
            onChange={(e) => onChange({ ...restrictions, notes: e.target.value })}
            placeholder="أي قيود أو متطلبات محددة..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {restrictions.allowed.length > 0 && (
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
              <h4 className="text-sm font-medium text-blue-900 mb-1">تم تحديد القيود</h4>
              <p className="text-sm text-blue-700">
                اخترت {restrictions.allowed.length} نوع مسموح و{restrictions.notAllowed.length} نوع
                غير مسموح.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
