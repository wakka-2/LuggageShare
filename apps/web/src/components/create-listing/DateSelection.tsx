'use client';

import { useRef } from 'react';

interface DateSelectionProps {
  travelDate: string;
  returnDate?: string;
  onChange: (dates: { travelDate: string; returnDate?: string }) => void;
}

function DateInput({
  label,
  min,
  value,
  onChange,
}: {
  label: string;
  min: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div
        className="relative cursor-pointer"
        onClick={() => inputRef.current?.showPicker?.()}
      >
        <input
          ref={inputRef}
          type="date"
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pe-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent cursor-pointer"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none z-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
}

export function DateSelection({ travelDate, returnDate, onChange }: DateSelectionProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">تواريخ السفر</h2>
      <p className="text-gray-600">متى ستسافر؟</p>

      <div className="space-y-4">
        <DateInput
          label="تاريخ السفر *"
          min={today}
          value={travelDate}
          onChange={(val) => onChange({ travelDate: val, returnDate })}
        />

        <div>
          <DateInput
            label="تاريخ العودة (اختياري)"
            min={travelDate || today}
            value={returnDate || ''}
            onChange={(val) => onChange({ travelDate, returnDate: val || undefined })}
          />
          <p className="mt-2 text-sm text-gray-500">
            أضف تاريخ العودة إذا كانت رحلتك ذهاب وعودة
          </p>
        </div>
      </div>

      {travelDate && (
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
              <h4 className="text-sm font-medium text-blue-900 mb-1">تم تحديد تاريخ السفر</h4>
              <p className="text-sm text-blue-700">
                سيكون إعلانك نشطاً حتى هذا التاريخ. يمكنك تمديده لاحقاً عند الحاجة.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
