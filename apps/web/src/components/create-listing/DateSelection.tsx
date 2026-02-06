'use client';

interface DateSelectionProps {
  travelDate: string;
  returnDate?: string;
  onChange: (dates: { travelDate: string; returnDate?: string }) => void;
}

export function DateSelection({ travelDate, returnDate, onChange }: DateSelectionProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Travel Dates</h2>
      <p className="text-gray-600">When are you traveling?</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Date *
          </label>
          <input
            type="date"
            min={today}
            value={travelDate}
            onChange={(e) => onChange({ travelDate: e.target.value, returnDate })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Return Date (Optional)
          </label>
          <input
            type="date"
            min={travelDate || today}
            value={returnDate || ''}
            onChange={(e) => onChange({ travelDate, returnDate: e.target.value || undefined })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            Add a return date if you're making a round trip
          </p>
        </div>
      </div>

      {travelDate && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
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
              <h4 className="text-sm font-medium text-blue-900 mb-1">Travel Date Set</h4>
              <p className="text-sm text-blue-700">
                Your listing will be active until this date. You can extend it later if needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
