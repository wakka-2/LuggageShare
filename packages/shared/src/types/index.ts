// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  city?: string;
  isVerified: boolean;
  balance?: number;
  isBalanceRestricted?: boolean;
  createdAt: string;
}

export interface UserSettings {
  language: 'ar' | 'en';
  currency: 'SAR' | 'USD' | 'EUR';
  notifications: boolean;
}

// Listing types
export type ListingType = 'offer' | 'request';

export interface PricingTier {
  small: number;
  medium: number;
  large: number;
  negotiable: boolean;
}

export interface ItemRestrictions {
  acceptsFragile: boolean;
  acceptsElectronics: boolean;
  acceptsDocuments: boolean;
  acceptsClothing: boolean;
  maxItemValue?: number;
}

export type HandoffOption = 'airport' | 'delivery' | 'meetup';

export interface Listing {
  id: string;
  carrierId: string;
  type: ListingType;
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  departureCity: string;
  departureCode?: string;
  arrivalCity: string;
  arrivalCode?: string;
  departureDate: string;
  flightNumber?: string;
  availableWeight: number;
  pricing: PricingTier;
  currency: string;
  neededWeight?: number;
  restrictions?: ItemRestrictions;
  handoffOptions?: HandoffOption[];
  notes?: string;
  status: ListingStatus;
  expiresAt?: string;
  carrier?: User;
  createdAt: string;
}

export type ListingStatus = 'active' | 'completed' | 'cancelled';

// Booking types
export type PackageSize = 'small' | 'medium' | 'large';

export interface Booking {
  id: string;
  bookingRef: string;
  listingId: string;
  senderId: string;
  carrierId: string;
  status: BookingStatus;
  packageSize?: PackageSize;
  totalWeight: number;
  totalPrice: number;
  currency: string;
  items: Item[];
  listing?: Listing;
  sender?: User;
  carrier?: User;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface Item {
  id: string;
  bookingId: string;
  name: string;
  description?: string;
  weight: number;
  value: number;
  currency: string;
  imageUrls: string[];
}

// Conversation & Message types
export interface Conversation {
  id: string;
  listingId?: string;
  bookingId?: string;
  otherUser: User;
  listing?: Listing;
  lastMessage?: {
    content: string;
    createdAt: string;
    isMe: boolean;
  };
  unreadCount: number;
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'location';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  sender?: User;
  createdAt: string;
}

// Review types
export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  reviewer?: User;
  createdAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
