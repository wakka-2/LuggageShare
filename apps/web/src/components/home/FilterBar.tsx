'use client';

import { Search, X, ArrowLeftRight } from 'lucide-react';

interface FilterBarProps {
  from: string;
  to: string;
  date: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onClear: () => void;
  onSwap: () => void;
  resultCount?: number;
}

export default function FilterBar({
  from,
  to,
  date,
  onFromChange,
  onToChange,
  onDateChange,
  onClear,
  onSwap,
  resultCount,
}: FilterBarProps) {
  const hasFilters = from || to || date;

  return (
    <div className="bg-white rounded-[22px] shadow-bubble-xs p-3 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* From */}
        <div className="relative flex-1">
          <div className="absolute top-1/2 -translate-y-1/2 start-3 w-2.5 h-2.5 rounded-full bg-v2-mint" />
          <input
            type="text"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            placeholder="من أين..."
            className="w-full bg-v2-bg rounded-full ps-8 pe-3 py-2.5 text-sm text-v2-text placeholder:text-v2-text-muted outline-none focus:ring-2 focus:ring-v2-primary/20"
          />
        </div>

        {/* Swap button */}
        <button
          onClick={onSwap}
          aria-label="تبديل المدن"
          className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full bg-v2-bg hover:bg-v2-primary/10 transition-colors flex-shrink-0"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-v2-text-soft" />
        </button>

        {/* To */}
        <div className="relative flex-1">
          <div className="absolute top-1/2 -translate-y-1/2 start-3 w-2.5 h-2.5 rounded-full bg-v2-secondary" />
          <input
            type="text"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            placeholder="إلى أين..."
            className="w-full bg-v2-bg rounded-full ps-8 pe-3 py-2.5 text-sm text-v2-text placeholder:text-v2-text-muted outline-none focus:ring-2 focus:ring-v2-primary/20"
          />
        </div>

        {/* Date */}
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-v2-bg rounded-full px-3 py-2.5 text-sm text-v2-text outline-none focus:ring-2 focus:ring-v2-primary/20 sm:w-40"
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-3 py-2.5 rounded-full text-xs text-v2-text-soft hover:bg-v2-bg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              مسح
            </button>
          )}
          <button className="v2-gradient-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <Search className="w-4 h-4" />
            بحث
          </button>
        </div>
      </div>

      {/* Result count */}
      {resultCount !== undefined && hasFilters && (
        <p className="text-xs text-v2-text-muted mt-2 px-2">{resultCount} نتيجة</p>
      )}
    </div>
  );
}
