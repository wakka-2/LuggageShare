'use client';

import { useState } from 'react';
import { Search, MapPin, Calendar, Package } from 'lucide-react';

export function SearchBox() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [weight, setWeight] = useState('');

  const handleSearch = () => {
    // TODO: Implement search
    console.log({ from, to, date, weight });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* From */}
        <div className="relative">
          <label className="block text-sm text-gray-500 mb-1">من</label>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            <input
              type="text"
              placeholder="المدينة المصدر"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* To */}
        <div className="relative">
          <label className="block text-sm text-gray-500 mb-1">إلى</label>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
            <input
              type="text"
              placeholder="المدينة الوجهة"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Date */}
        <div className="relative">
          <label className="block text-sm text-gray-500 mb-1">التاريخ</label>
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Weight */}
        <div className="relative">
          <label className="block text-sm text-gray-500 mb-1">الوزن (كجم)</label>
          <div className="relative">
            <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              placeholder="5"
              min="1"
              max="30"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="w-full mt-4 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
      >
        <Search className="w-5 h-5" />
        <span>بحث</span>
      </button>
    </div>
  );
}
