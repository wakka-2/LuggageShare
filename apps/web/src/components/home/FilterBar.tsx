'use client';

import { Search, X, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import DateFlexPicker from './DateFlexPicker';
import type { Flexibility } from '@/lib/dates';

interface FilterBarProps {
  from: string;
  to: string;
  date: string;
  flex: Flexibility;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onDateChange: (dateISO: string, flex: Flexibility) => void;
  onClear: () => void;
  onSwap: () => void;
  resultCount?: number;
}

export default function FilterBar({
  from,
  to,
  date,
  flex,
  onFromChange,
  onToChange,
  onDateChange,
  onClear,
  onSwap,
  resultCount,
}: FilterBarProps) {
  const { t } = useLanguage();
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
            placeholder={t('searchBar.from')}
            className="w-full bg-v2-bg rounded-full ps-8 pe-3 py-2.5 text-sm text-v2-text placeholder:text-v2-text-muted outline-none focus:ring-2 focus:ring-v2-primary/20"
          />
        </div>

        {/* Swap button */}
        <button
          onClick={onSwap}
          aria-label={t('searchBar.swapCities')}
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
            placeholder={t('searchBar.to')}
            className="w-full bg-v2-bg rounded-full ps-8 pe-3 py-2.5 text-sm text-v2-text placeholder:text-v2-text-muted outline-none focus:ring-2 focus:ring-v2-primary/20"
          />
        </div>

        {/* Date + flexibility */}
        <DateFlexPicker value={date} flex={flex} onChange={onDateChange} />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-3 py-2.5 rounded-full text-xs text-v2-text-soft hover:bg-v2-bg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              {t('searchBar.clearAll')}
            </button>
          )}
          <button className="v2-gradient-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <Search className="w-4 h-4" />
            {t('searchBar.search')}
          </button>
        </div>
      </div>

      {/* Result count */}
      {resultCount !== undefined && hasFilters && (
        <p className="text-xs text-v2-text-muted mt-2 px-2">
          {resultCount} {t('searchBar.result')}
        </p>
      )}
    </div>
  );
}
