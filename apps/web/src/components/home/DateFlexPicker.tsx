'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  MONTHS_AR,
  WEEKDAY_INITIALS_AR,
  FLEX_OPTIONS,
  startOfToday,
  addDays,
  formatArabicShort,
  parseLocalISO,
  toLocalISO,
  type Flexibility,
} from '@/lib/dates';

interface DateFlexPickerProps {
  value: string; // local ISO (YYYY-MM-DD) or ''
  flex: Flexibility;
  onChange: (dateISO: string, flex: Flexibility) => void;
}

function sameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.getTime() === b.getTime();
}

// Custom RTL Arabic date picker with a flexibility toggle — replaces the native
// <input type="date"> (which renders mm/dd/yyyy in English inside the RTL UI).
export default function DateFlexPicker({ value, flex, onChange }: DateFlexPickerProps) {
  const today = startOfToday();
  const selected = value ? parseLocalISO(value) : null;
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isCurrentMonth =
    viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth();
  const firstDow = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();

  const label = selected ? `${formatArabicShort(selected)}${flex ? ` ±${flex}` : ''}` : 'التاريخ';

  return (
    <div className="relative sm:w-44" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 bg-v2-bg rounded-full px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-v2-primary/20"
      >
        <Calendar className="w-4 h-4 text-v2-text-soft flex-shrink-0" />
        <span className={selected ? 'text-v2-text' : 'text-v2-text-muted'}>{label}</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-[300px] bg-white rounded-[22px] shadow-bubble-sm p-4 end-0">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              aria-label="الشهر التالي"
              onClick={() =>
                setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
              }
              disabled={isCurrentMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-v2-bg text-v2-text disabled:opacity-35 disabled:cursor-default"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-v2-text">
              {MONTHS_AR[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              aria-label="الشهر السابق"
              onClick={() =>
                setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
              }
              className="w-8 h-8 flex items-center justify-center rounded-full bg-v2-bg text-v2-text"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAY_INITIALS_AR.map((d, i) => (
              <div key={i} className="text-center text-xs text-v2-text-muted py-1">
                {d}
              </div>
            ))}
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
              const isPast = date < today;
              const isSel = sameDay(date, selected);
              const isToday = sameDay(date, today);
              const inRange =
                !isSel &&
                flex > 0 &&
                selected &&
                Math.abs(date.getTime() - selected.getTime()) / 86400000 <= flex;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => onChange(toLocalISO(date), flex)}
                  className={[
                    'aspect-square min-h-[34px] rounded-full text-sm tabular-nums transition-colors',
                    isPast ? 'text-v2-text-muted opacity-35 cursor-default' : 'text-v2-text',
                    isSel ? 'v2-gradient-primary text-white font-bold' : '',
                    inRange ? 'bg-v2-primary/10' : '',
                    !isPast && !isSel ? 'hover:bg-v2-primary/10' : '',
                    isToday && !isSel ? 'ring-1 ring-inset ring-v2-primary' : '',
                  ].join(' ')}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 mt-4 flex-wrap">
            <span className="text-xs text-v2-text-soft">المرونة:</span>
            {FLEX_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(value, opt.value)}
                className={[
                  'text-xs rounded-full px-3 py-1.5 transition-colors',
                  flex === opt.value
                    ? 'bg-v2-primary/10 text-v2-primary font-semibold'
                    : 'bg-v2-bg text-v2-text-soft hover:bg-v2-primary/5',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => {
                onChange('', 0);
                setOpen(false);
              }}
              className="text-xs text-v2-text-soft hover:text-v2-text"
            >
              مسح
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-v2-primary"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
