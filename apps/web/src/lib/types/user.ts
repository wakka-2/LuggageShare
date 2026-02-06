export interface User {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  completedTrips: number;
  activeListings: number;
  languages: string[];
  memberSince: string;
  bankDetails?: {
    accountName: string;
    iban: string;
    bankName: string;
  };
}

export interface UserSettings {
  language: 'ar' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    bookingUpdates: boolean;
    messages: boolean;
    promotions: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    profileVisibility: 'public' | 'private';
  };
  theme: 'light' | 'dark' | 'system';
}

export interface UserListing {
  id: string;
  titleAr: string;
  type: 'offer' | 'request';
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  route: {
    from: string;
    to: string;
  };
  travelDate: string;
  price: number;
  views: number;
  bookings: number;
  createdAt: string;
}
