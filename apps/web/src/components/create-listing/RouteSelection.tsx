'use client';

import { useState } from 'react';

interface City {
  city: string;
  country: string;
  code: string;
}

interface RouteSelectionProps {
  from: City | null;
  to: City | null;
  onChange: (route: { from: City | null; to: City | null }) => void;
}

const COMMON_CITIES: City[] = [
  { city: 'الرياض', country: 'السعودية', code: 'RUH' },
  { city: 'جدة', country: 'السعودية', code: 'JED' },
  { city: 'الدمام', country: 'السعودية', code: 'DMM' },
  { city: 'القاهرة', country: 'مصر', code: 'CAI' },
  { city: 'دبي', country: 'الإمارات', code: 'DXB' },
  { city: 'عمّان', country: 'الأردن', code: 'AMM' },
  { city: 'اسطنبول', country: 'تركيا', code: 'IST' },
  { city: 'لندن', country: 'بريطانيا', code: 'LHR' },
  { city: 'باريس', country: 'فرنسا', code: 'CDG' },
  { city: 'مانيلا', country: 'الفلبين', code: 'MNL' },
  { city: 'جاكرتا', country: 'إندونيسيا', code: 'CGK' },
  { city: 'نيويورك', country: 'أمريكا', code: 'JFK' },
];

export function RouteSelection({ from, to, onChange }: RouteSelectionProps) {
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const filteredFromCities = COMMON_CITIES.filter(
    (city) =>
      city.city.includes(fromSearch) ||
      city.country.includes(fromSearch) ||
      city.code.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToCities = COMMON_CITIES.filter(
    (city) =>
      city.city.includes(toSearch) ||
      city.country.includes(toSearch) ||
      city.code.toLowerCase().includes(toSearch.toLowerCase())
  );

  const selectFrom = (city: City) => {
    onChange({ from: city, to });
    setShowFromDropdown(false);
    setFromSearch('');
  };

  const selectTo = (city: City) => {
    onChange({ from, to: city });
    setShowToDropdown(false);
    setToSearch('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">مسار الرحلة</h2>
      <p className="text-gray-600">من أين وإلى أين تسافر؟</p>

      <div className="space-y-4">
        {/* From City */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">من</label>
          {from ? (
            <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">{from.city}</div>
                <div className="text-sm text-gray-600">
                  {from.country} ({from.code})
                </div>
              </div>
              <button
                onClick={() => onChange({ from: null, to })}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                تغيير
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="ابحث عن مدينة..."
                value={fromSearch}
                onChange={(e) => setFromSearch(e.target.value)}
                onFocus={() => setShowFromDropdown(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              {showFromDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredFromCities.map((city) => (
                    <button
                      key={`${city.code}-from`}
                      onClick={() => selectFrom(city)}
                      className="w-full px-4 py-3 text-start hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{city.city}</div>
                      <div className="text-sm text-gray-600">
                        {city.country} ({city.code})
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* To City */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">إلى</label>
          {to ? (
            <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">{to.city}</div>
                <div className="text-sm text-gray-600">
                  {to.country} ({to.code})
                </div>
              </div>
              <button
                onClick={() => onChange({ from, to: null })}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                تغيير
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="ابحث عن مدينة..."
                value={toSearch}
                onChange={(e) => setToSearch(e.target.value)}
                onFocus={() => setShowToDropdown(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              {showToDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredToCities.map((city) => (
                    <button
                      key={`${city.code}-to`}
                      onClick={() => selectTo(city)}
                      className="w-full px-4 py-3 text-start hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{city.city}</div>
                      <div className="text-sm text-gray-600">
                        {city.country} ({city.code})
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
