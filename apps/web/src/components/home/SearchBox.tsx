'use client';

import { useState } from 'react';
import { Search, MapPin, Calendar, Package } from 'lucide-react';

export function SearchBox() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [weight, setWeight] = useState('');

  const handleSearch = () => {
    console.log({ from, to, date, weight });
  };

  return (
    <div className="bg-white rounded-[28px] shadow-bubble-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* From */}
        <div className="relative">
          <label className="block text-sm text-v2-text-soft mb-1.5 font-medium">من</label>
          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-v2-mint" />
            <input
              type="text"
              placeholder="المدينة المصدر"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-v2-bg rounded-full shadow-bubble-xs focus:shadow-bubble-sm focus:ring-2 focus:ring-v2-primary/20 outline-none transition-all text-v2-text placeholder:text-v2-text-muted"
            />
          </div>
        </div>

        {/* To */}
        <div className="relative">
          <label className="block text-sm text-v2-text-soft mb-1.5 font-medium">إلى</label>
          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-v2-secondary" />
            <input
              type="text"
              placeholder="المدينة الوجهة"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-v2-bg rounded-full shadow-bubble-xs focus:shadow-bubble-sm focus:ring-2 focus:ring-v2-primary/20 outline-none transition-all text-v2-text placeholder:text-v2-text-muted"
            />
          </div>
        </div>

        {/* Date */}
        <div className="relative">
          <label className="block text-sm text-v2-text-soft mb-1.5 font-medium">التاريخ</label>
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v2-primary" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-v2-bg rounded-full shadow-bubble-xs focus:shadow-bubble-sm focus:ring-2 focus:ring-v2-primary/20 outline-none transition-all text-v2-text placeholder:text-v2-text-muted"
            />
          </div>
        </div>

        {/* Weight */}
        <div className="relative">
          <label className="block text-sm text-v2-text-soft mb-1.5 font-medium">الوزن (كجم)</label>
          <div className="relative">
            <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v2-amber" />
            <input
              type="number"
              placeholder="5"
              min="1"
              max="30"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-v2-bg rounded-full shadow-bubble-xs focus:shadow-bubble-sm focus:ring-2 focus:ring-v2-primary/20 outline-none transition-all text-v2-text placeholder:text-v2-text-muted"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="w-full mt-5 v2-gradient-primary text-white py-3 px-6 rounded-full font-semibold hover:shadow-bubble-md transition-all flex items-center justify-center gap-2"
      >
        <Search className="w-5 h-5" />
        <span>بحث</span>
      </button>
    </div>
  );
}
