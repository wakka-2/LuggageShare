// Listing types for the Haraj-style marketplace

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
  locationAr?: string;
  details?: string;
}

export interface ListingUser {
  id: string;
  name: string;
  nameAr?: string;
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
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  user: ListingUser;
  from: {
    city: string;
    cityAr?: string;
    country: string;
    countryAr?: string;
    code: string;
  };
  to: {
    city: string;
    cityAr?: string;
    country: string;
    countryAr?: string;
    code: string;
  };
  travelDate: string;
  returnDate?: string;
  availableWeight?: number; // for offers
  neededWeight?: number; // for requests
  pricing: PricingTier;
  restrictions: ItemRestrictions;
  handoffOptions: HandoffOption[];
  status: ListingStatus;
  views: number;
  createdAt: string;
  expiresAt: string;
}

// Predefined restriction categories
export const ITEM_CATEGORIES = {
  allowed: [
    { key: 'electronics', labelKey: 'categories.electronics', icon: 'phone-portrait-outline' },
    { key: 'documents', labelKey: 'categories.documents', icon: 'document-text-outline' },
    { key: 'clothes', labelKey: 'categories.clothes', icon: 'shirt-outline' },
    { key: 'cosmetics', labelKey: 'categories.cosmetics', icon: 'sparkles-outline' },
    { key: 'accessories', labelKey: 'categories.accessories', icon: 'watch-outline' },
    { key: 'gifts', labelKey: 'categories.gifts', icon: 'gift-outline' },
  ],
  notAllowed: [
    { key: 'liquids', labelKey: 'categories.liquids', icon: 'water-outline' },
    { key: 'food', labelKey: 'categories.food', icon: 'fast-food-outline' },
    { key: 'fragile', labelKey: 'categories.fragile', icon: 'wine-outline' },
    { key: 'valuables', labelKey: 'categories.valuables', icon: 'diamond-outline' },
    { key: 'batteries', labelKey: 'categories.batteries', icon: 'battery-half-outline' },
  ],
} as const;

export type ViewMode = 'grid' | 'list';

export interface MarketplaceFilters {
  type: ListingType | 'all';
  from: string;
  to: string;
  dateFrom: string;
  dateTo: string;
  maxPrice: number | null;
  verifiedOnly: boolean;
}
