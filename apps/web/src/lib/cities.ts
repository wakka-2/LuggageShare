export interface City {
  nameEn: string;
  nameAr: string;
  code: string;
  country: string;
}

export const CITIES: City[] = [
  // Saudi Arabia
  { nameEn: 'Riyadh', nameAr: 'الرياض', code: 'RUH', country: 'SA' },
  { nameEn: 'Jeddah', nameAr: 'جدة', code: 'JED', country: 'SA' },
  { nameEn: 'Dammam', nameAr: 'الدمام', code: 'DMM', country: 'SA' },
  { nameEn: 'Medina', nameAr: 'المدينة المنورة', code: 'MED', country: 'SA' },
  { nameEn: 'Mecca', nameAr: 'مكة المكرمة', code: 'QCA', country: 'SA' },
  { nameEn: 'Tabuk', nameAr: 'تبوك', code: 'TUU', country: 'SA' },
  { nameEn: 'Abha', nameAr: 'أبها', code: 'AHB', country: 'SA' },
  { nameEn: 'Taif', nameAr: 'الطائف', code: 'TIF', country: 'SA' },
  { nameEn: 'Jizan', nameAr: 'جازان', code: 'GIZ', country: 'SA' },
  { nameEn: 'Hail', nameAr: 'حائل', code: 'HAS', country: 'SA' },

  // UAE
  { nameEn: 'Dubai', nameAr: 'دبي', code: 'DXB', country: 'AE' },
  { nameEn: 'Abu Dhabi', nameAr: 'أبوظبي', code: 'AUH', country: 'AE' },
  { nameEn: 'Sharjah', nameAr: 'الشارقة', code: 'SHJ', country: 'AE' },

  // Egypt
  { nameEn: 'Cairo', nameAr: 'القاهرة', code: 'CAI', country: 'EG' },
  { nameEn: 'Alexandria', nameAr: 'الإسكندرية', code: 'HBE', country: 'EG' },

  // Jordan
  { nameEn: 'Amman', nameAr: 'عمّان', code: 'AMM', country: 'JO' },

  // Bahrain
  { nameEn: 'Manama', nameAr: 'المنامة', code: 'BAH', country: 'BH' },

  // Kuwait
  { nameEn: 'Kuwait City', nameAr: 'مدينة الكويت', code: 'KWI', country: 'KW' },

  // Qatar
  { nameEn: 'Doha', nameAr: 'الدوحة', code: 'DOH', country: 'QA' },

  // Oman
  { nameEn: 'Muscat', nameAr: 'مسقط', code: 'MCT', country: 'OM' },

  // Lebanon
  { nameEn: 'Beirut', nameAr: 'بيروت', code: 'BEY', country: 'LB' },

  // Turkey
  { nameEn: 'Istanbul', nameAr: 'إسطنبول', code: 'IST', country: 'TR' },
  { nameEn: 'Ankara', nameAr: 'أنقرة', code: 'ESB', country: 'TR' },

  // Morocco
  { nameEn: 'Casablanca', nameAr: 'الدار البيضاء', code: 'CMN', country: 'MA' },

  // Iraq
  { nameEn: 'Baghdad', nameAr: 'بغداد', code: 'BGW', country: 'IQ' },
  { nameEn: 'Erbil', nameAr: 'أربيل', code: 'EBL', country: 'IQ' },

  // Tunisia
  { nameEn: 'Tunis', nameAr: 'تونس', code: 'TUN', country: 'TN' },

  // Sudan
  { nameEn: 'Khartoum', nameAr: 'الخرطوم', code: 'KRT', country: 'SD' },

  // International hubs
  { nameEn: 'London', nameAr: 'لندن', code: 'LHR', country: 'GB' },
  { nameEn: 'Paris', nameAr: 'باريس', code: 'CDG', country: 'FR' },
  { nameEn: 'Frankfurt', nameAr: 'فرانكفورت', code: 'FRA', country: 'DE' },
  { nameEn: 'New York', nameAr: 'نيويورك', code: 'JFK', country: 'US' },
  { nameEn: 'Washington', nameAr: 'واشنطن', code: 'IAD', country: 'US' },
  { nameEn: 'Los Angeles', nameAr: 'لوس أنجلوس', code: 'LAX', country: 'US' },
  { nameEn: 'Kuala Lumpur', nameAr: 'كوالالمبور', code: 'KUL', country: 'MY' },
  { nameEn: 'Jakarta', nameAr: 'جاكرتا', code: 'CGK', country: 'ID' },
  { nameEn: 'Mumbai', nameAr: 'مومباي', code: 'BOM', country: 'IN' },
  { nameEn: 'Islamabad', nameAr: 'إسلام أباد', code: 'ISB', country: 'PK' },
  { nameEn: 'Addis Ababa', nameAr: 'أديس أبابا', code: 'ADD', country: 'ET' },
];

export function filterCities(query: string, lang: 'en' | 'ar'): City[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return CITIES.filter((city) => {
    const name = lang === 'ar' ? city.nameAr : city.nameEn;
    return (
      name.toLowerCase().includes(q) ||
      city.code.toLowerCase().includes(q) ||
      city.nameEn.toLowerCase().includes(q)
    );
  }).slice(0, 6);
}

export function getCityDisplayName(city: City, lang: 'en' | 'ar'): string {
  return lang === 'ar' ? city.nameAr : city.nameEn;
}
