// Booking status labels
export const BOOKING_STATUS_LABELS = {
  ar: {
    pending: 'قيد الانتظار',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    picked_up: 'تم الاستلام',
    in_transit: 'قيد التوصيل',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
  },
  en: {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  },
} as const;

// Listing status labels
export const LISTING_STATUS_LABELS = {
  ar: {
    active: 'نشط',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  },
  en: {
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },
} as const;

// Popular cities
export const POPULAR_CITIES = [
  { code: 'RUH', nameEn: 'Riyadh', nameAr: 'الرياض', country: 'SA' },
  { code: 'JED', nameEn: 'Jeddah', nameAr: 'جدة', country: 'SA' },
  { code: 'DMM', nameEn: 'Dammam', nameAr: 'الدمام', country: 'SA' },
  { code: 'CAI', nameEn: 'Cairo', nameAr: 'القاهرة', country: 'EG' },
  { code: 'DXB', nameEn: 'Dubai', nameAr: 'دبي', country: 'AE' },
  { code: 'AMM', nameEn: 'Amman', nameAr: 'عمان', country: 'JO' },
  { code: 'BAH', nameEn: 'Bahrain', nameAr: 'البحرين', country: 'BH' },
  { code: 'KWI', nameEn: 'Kuwait', nameAr: 'الكويت', country: 'KW' },
] as const;

// Item categories
export const ITEM_CATEGORIES = [
  { id: 'clothing', nameEn: 'Clothing', nameAr: 'ملابس', icon: '👕' },
  { id: 'electronics', nameEn: 'Electronics', nameAr: 'إلكترونيات', icon: '📱' },
  { id: 'documents', nameEn: 'Documents', nameAr: 'مستندات', icon: '📄' },
  { id: 'gifts', nameEn: 'Gifts', nameAr: 'هدايا', icon: '🎁' },
  { id: 'cosmetics', nameEn: 'Cosmetics', nameAr: 'مستحضرات', icon: '💄' },
  { id: 'books', nameEn: 'Books', nameAr: 'كتب', icon: '📚' },
  { id: 'other', nameEn: 'Other', nameAr: 'أخرى', icon: '📦' },
] as const;

// Prohibited items
export const PROHIBITED_ITEMS = [
  'illegal_drugs',
  'weapons',
  'explosives',
  'hazardous_materials',
  'counterfeit_goods',
  'stolen_property',
  'cash_over_limit',
  'prescription_meds',
  'alcohol',
  'tobacco_over_limit',
  'perishables',
  'live_animals',
  'pornographic_material',
] as const;

// Commission rates (Phase 2)
export const COMMISSION_RATES = {
  carrier: 0.05, // 5%
  sender: 0, // 0%
} as const;

// Balance thresholds
export const BALANCE_THRESHOLDS = {
  warning: -5, // SAR
  restricted: -10, // SAR
} as const;

// Rating labels
export const RATING_LABELS = {
  ar: {
    1: 'سيء جداً',
    2: 'سيء',
    3: 'مقبول',
    4: 'جيد',
    5: 'ممتاز',
  },
  en: {
    1: 'Very Poor',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    google: '/auth/google',
    apple: '/auth/apple',
    refresh: '/auth/refresh',
  },
  users: {
    me: '/users/me',
    profile: (id: string) => `/users/${id}`,
  },
  listings: {
    search: '/listings',
    detail: (id: string) => `/listings/${id}`,
    create: '/listings',
    update: (id: string) => `/listings/${id}`,
    delete: (id: string) => `/listings/${id}`,
  },
  bookings: {
    list: '/bookings',
    detail: (id: string) => `/bookings/${id}`,
    create: '/bookings',
    accept: (id: string) => `/bookings/${id}/accept`,
    reject: (id: string) => `/bookings/${id}/reject`,
    cancel: (id: string) => `/bookings/${id}/cancel`,
  },
  messages: {
    conversations: '/messages/conversations',
    messages: (bookingId: string) => `/messages/conversations/${bookingId}`,
    send: (bookingId: string) => `/messages/conversations/${bookingId}`,
    read: (bookingId: string) => `/messages/conversations/${bookingId}/read`,
  },
  notifications: {
    list: '/notifications',
    registerToken: '/notifications/register-token',
    read: (id: string) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
  },
} as const;
