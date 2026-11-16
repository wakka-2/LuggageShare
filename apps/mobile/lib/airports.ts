import i18n from '@/i18n';

/**
 * Airport cities offered in the city picker.
 *
 * `en` is what we store and send to the API (search and existing listings use
 * English city names); `ar` is only for display. Users can still enter a city
 * that is not in this list.
 */
export interface Airport {
  code: string;
  en: string;
  ar: string;
  countryEn: string;
  countryAr: string;
}

export const AIRPORTS: Airport[] = [
  // Saudi Arabia
  { code: 'RUH', en: 'Riyadh', ar: 'الرياض', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'JED', en: 'Jeddah', ar: 'جدة', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'DMM', en: 'Dammam', ar: 'الدمام', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  {
    code: 'MED',
    en: 'Medina',
    ar: 'المدينة المنورة',
    countryEn: 'Saudi Arabia',
    countryAr: 'السعودية',
  },
  { code: 'AHB', en: 'Abha', ar: 'أبها', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'TUU', en: 'Tabuk', ar: 'تبوك', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'TIF', en: 'Taif', ar: 'الطائف', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'GIZ', en: 'Jazan', ar: 'جازان', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'ELQ', en: 'Qassim', ar: 'القصيم', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'HAS', en: 'Hail', ar: 'حائل', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'AJF', en: 'Al Jouf', ar: 'الجوف', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'EAM', en: 'Najran', ar: 'نجران', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'YNB', en: 'Yanbu', ar: 'ينبع', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'ULH', en: 'AlUla', ar: 'العلا', countryEn: 'Saudi Arabia', countryAr: 'السعودية' },
  // Gulf
  { code: 'DXB', en: 'Dubai', ar: 'دبي', countryEn: 'UAE', countryAr: 'الإمارات' },
  { code: 'AUH', en: 'Abu Dhabi', ar: 'أبوظبي', countryEn: 'UAE', countryAr: 'الإمارات' },
  { code: 'SHJ', en: 'Sharjah', ar: 'الشارقة', countryEn: 'UAE', countryAr: 'الإمارات' },
  { code: 'DOH', en: 'Doha', ar: 'الدوحة', countryEn: 'Qatar', countryAr: 'قطر' },
  { code: 'KWI', en: 'Kuwait', ar: 'الكويت', countryEn: 'Kuwait', countryAr: 'الكويت' },
  { code: 'BAH', en: 'Bahrain', ar: 'البحرين', countryEn: 'Bahrain', countryAr: 'البحرين' },
  { code: 'MCT', en: 'Muscat', ar: 'مسقط', countryEn: 'Oman', countryAr: 'عُمان' },
  // Levant / Egypt / North Africa
  { code: 'CAI', en: 'Cairo', ar: 'القاهرة', countryEn: 'Egypt', countryAr: 'مصر' },
  { code: 'HBE', en: 'Alexandria', ar: 'الإسكندرية', countryEn: 'Egypt', countryAr: 'مصر' },
  { code: 'AMM', en: 'Amman', ar: 'عمّان', countryEn: 'Jordan', countryAr: 'الأردن' },
  { code: 'BEY', en: 'Beirut', ar: 'بيروت', countryEn: 'Lebanon', countryAr: 'لبنان' },
  { code: 'BGW', en: 'Baghdad', ar: 'بغداد', countryEn: 'Iraq', countryAr: 'العراق' },
  { code: 'KRT', en: 'Khartoum', ar: 'الخرطوم', countryEn: 'Sudan', countryAr: 'السودان' },
  { code: 'CMN', en: 'Casablanca', ar: 'الدار البيضاء', countryEn: 'Morocco', countryAr: 'المغرب' },
  { code: 'TUN', en: 'Tunis', ar: 'تونس', countryEn: 'Tunisia', countryAr: 'تونس' },
  { code: 'ALG', en: 'Algiers', ar: 'الجزائر', countryEn: 'Algeria', countryAr: 'الجزائر' },
  // Asia
  { code: 'IST', en: 'Istanbul', ar: 'إسطنبول', countryEn: 'Turkey', countryAr: 'تركيا' },
  { code: 'KHI', en: 'Karachi', ar: 'كراتشي', countryEn: 'Pakistan', countryAr: 'باكستان' },
  { code: 'LHE', en: 'Lahore', ar: 'لاهور', countryEn: 'Pakistan', countryAr: 'باكستان' },
  { code: 'DEL', en: 'Delhi', ar: 'دلهي', countryEn: 'India', countryAr: 'الهند' },
  { code: 'BOM', en: 'Mumbai', ar: 'مومباي', countryEn: 'India', countryAr: 'الهند' },
  { code: 'DAC', en: 'Dhaka', ar: 'دكا', countryEn: 'Bangladesh', countryAr: 'بنغلاديش' },
  { code: 'MNL', en: 'Manila', ar: 'مانيلا', countryEn: 'Philippines', countryAr: 'الفلبين' },
  { code: 'CGK', en: 'Jakarta', ar: 'جاكرتا', countryEn: 'Indonesia', countryAr: 'إندونيسيا' },
  {
    code: 'KUL',
    en: 'Kuala Lumpur',
    ar: 'كوالالمبور',
    countryEn: 'Malaysia',
    countryAr: 'ماليزيا',
  },
  // Europe
  { code: 'LHR', en: 'London', ar: 'لندن', countryEn: 'UK', countryAr: 'المملكة المتحدة' },
  { code: 'CDG', en: 'Paris', ar: 'باريس', countryEn: 'France', countryAr: 'فرنسا' },
  { code: 'FRA', en: 'Frankfurt', ar: 'فرانكفورت', countryEn: 'Germany', countryAr: 'ألمانيا' },
  { code: 'BER', en: 'Berlin', ar: 'برلين', countryEn: 'Germany', countryAr: 'ألمانيا' },
];

const normalize = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[ً-ْ]/g, '') // Arabic diacritics
    .replace(/[إأآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

/** Find an airport by stored city name (either language) or code. */
export function findAirport(cityOrCode?: string | null): Airport | undefined {
  if (!cityOrCode) return undefined;
  const q = normalize(cityOrCode);
  return AIRPORTS.find(
    (a) => normalize(a.en) === q || normalize(a.ar) === q || a.code.toLowerCase() === q
  );
}

/** Display name for a stored (English) city in the UI language. */
export function cityLabel(
  city: string | null | undefined,
  language: string = i18n.language
): string {
  if (!city) return '';
  const airport = findAirport(city);
  if (!airport) return city;
  return language === 'ar' ? airport.ar : airport.en;
}

export function searchAirports(query: string): Airport[] {
  const q = normalize(query);
  if (!q) return AIRPORTS;
  return AIRPORTS.filter(
    (a) =>
      normalize(a.en).includes(q) ||
      normalize(a.ar).includes(q) ||
      a.code.toLowerCase().startsWith(q) ||
      normalize(a.countryEn).includes(q) ||
      normalize(a.countryAr).includes(q)
  );
}
