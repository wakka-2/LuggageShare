'use client';

interface SearchFiltersProps {
  from: string;
  to: string;
  date: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSwap?: () => void;
  onSearch?: () => void;
}

export function SearchFilters({
  from,
  to,
  date,
  onFromChange,
  onToChange,
  onDateChange,
  onSwap,
  onSearch,
}: SearchFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-center">
        {/* From Input */}
        <div className="flex-1 w-full">
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500">📍</span>
            <input
              type="text"
              placeholder="من أين؟"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-right"
            />
            {from && (
              <button
                onClick={() => onFromChange('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={onSwap}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span className="text-primary-500">⇄</span>
        </button>

        {/* To Input */}
        <div className="flex-1 w-full">
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">🎯</span>
            <input
              type="text"
              placeholder="إلى أين؟"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
            />
            {to && (
              <button
                onClick={() => onToChange('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Date Input */}
        <div className="w-full md:w-48">
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500">📅</span>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-right"
            />
            {date && (
              <button
                onClick={() => onDateChange('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium whitespace-nowrap"
        >
          بحث
        </button>
      </div>

      {/* Active Filters */}
      {(from || to || date) && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            {from && (
              <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                <span>من: {from}</span>
                <button onClick={() => onFromChange('')} className="hover:text-primary-900">✕</button>
              </span>
            )}
            {to && (
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                <span>إلى: {to}</span>
                <button onClick={() => onToChange('')} className="hover:text-green-900">✕</button>
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
                <span>{new Date(date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</span>
                <button onClick={() => onDateChange('')} className="hover:text-yellow-900">✕</button>
              </span>
            )}
          </div>
          <button
            onClick={() => {
              onFromChange('');
              onToChange('');
              onDateChange('');
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            مسح الكل
          </button>
        </div>
      )}
    </div>
  );
}
