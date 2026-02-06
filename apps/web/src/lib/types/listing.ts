// Listing types for the marketplace

export type ListingType = 'offer' | 'request';

export type ListingStatus = 'active' | 'booked' | 'completed' | 'expired';

export interface PricingTier {
  small: number;
  medium: number;
  large: number;
  negotiable: boolean;
}

export interface ItemRestrictions {
  allowed: string[];
  notAllowed: string[];
  notes?: string;
}

export interface HandoffOption {
  type: 'home_pickup' | 'mall_meetup' | 'airport_dropoff' | 'custom';
  location: string;
  locationAr: string;
  details?: string;
}

export interface ListingUser {
  id: string;
  name: string;
  nameAr: string;
  avatarUrl?: string;
  rating: number;
  completedDeals: number;
  isVerified: boolean;
  memberSince: string;
}

export interface Listing {
  id: string;
  type: ListingType;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  user: ListingUser;
  from: {
    city: string;
    cityAr: string;
    country: string;
    countryAr: string;
    code: string;
  };
  to: {
    city: string;
    cityAr: string;
    country: string;
    countryAr: string;
    code: string;
  };
  travelDate: string;
  returnDate?: string;
  availableWeight?: number;
  neededWeight?: number;
  pricing: PricingTier;
  restrictions: ItemRestrictions;
  handoffOptions: HandoffOption[];
  status: ListingStatus;
  views: number;
  createdAt: string;
  expiresAt: string;
}

export const ITEM_CATEGORIES = {
  allowed: [
    { key: 'electronics', label: 'Electronics', labelAr: 'إلكترونيات', icon: 'phone' },
    { key: 'documents', label: 'Documents', labelAr: 'مستندات', icon: 'document' },
    { key: 'clothes', label: 'Clothes', labelAr: 'ملابس', icon: 'shirt' },
    { key: 'cosmetics', label: 'Cosmetics', labelAr: 'مستحضرات تجميل', icon: 'sparkles' },
    { key: 'accessories', label: 'Accessories', labelAr: 'إكسسوارات', icon: 'watch' },
    { key: 'gifts', label: 'Gifts', labelAr: 'هدايا', icon: 'gift' },
  ],
  notAllowed: [
    { key: 'liquids', label: 'Liquids', labelAr: 'سوائل', icon: 'water' },
    { key: 'food', label: 'Food', labelAr: 'طعام', icon: 'food' },
    { key: 'fragile', label: 'Fragile', labelAr: 'قابل للكسر', icon: 'wine' },
    { key: 'valuables', label: 'Valuables', labelAr: 'مقتنيات ثمينة', icon: 'diamond' },
    { key: 'batteries', label: 'Batteries', labelAr: 'بطاريات', icon: 'battery' },
  ],
} as const;

export type ViewMode = 'grid' | 'list';
