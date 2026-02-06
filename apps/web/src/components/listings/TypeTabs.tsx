'use client';

import { ListingType } from '@/lib/types/listing';

type TabValue = ListingType | 'all';

interface TypeTabsProps {
  value: TabValue;
  onChange: (value: TabValue) => void;
  counts?: {
    all: number;
    offer: number;
    request: number;
  };
}

export function TypeTabs({ value, onChange, counts }: TypeTabsProps) {
  const tabs = [
    { key: 'all' as TabValue, label: 'الكل', icon: '📋' },
    { key: 'offer' as TabValue, label: 'عروض', icon: '✈️' },
    { key: 'request' as TabValue, label: 'طلبات', icon: '📦' },
  ];

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
      {tabs.map((tab) => {
        const isActive = value === tab.key;
        const count = counts?.[tab.key];

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {count !== undefined && count > 0 && (
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-semibold
                ${isActive
                  ? 'bg-white/25 text-white'
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
