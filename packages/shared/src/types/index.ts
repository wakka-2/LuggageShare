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
  createdAt: string;
}

export interface UserSettings {
  language: 'ar' | 'en';
  currency: 'SAR' | 'USD' | 'EUR';
  notifications: boolean;
}

// Listing types
export interface Listing {
  id: string;
  carrierId: string;
  departureCity: string;
  departureCode?: string;
  arrivalCity: string;
  arrivalCode?: string;
  departureDate: string;
  flightNumber?: string;
  availableWeight: number;
  price: number;
  currency: string;
  preferences?: ListingPreferences;
  notes?: string;
  status: ListingStatus;
  carrier?: User;
  createdAt: string;
}

export interface ListingPreferences {
  acceptsFragile: boolean;
  acceptsElectronics: boolean;
  acceptsDocuments: boolean;
  acceptsClothing: boolean;
  maxItemValue?: number;
}

export type ListingStatus = 'active' | 'completed' | 'cancelled';

// Booking types
export interface Booking {
  id: string;
  listingId: string;
  senderId: string;
  carrierId: string;
  status: BookingStatus;
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

// Message types
export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  sender?: User;
  createdAt: string;
}

export interface Conversation {
  bookingId: string;
  otherUser: User;
  route: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    isMe: boolean;
  };
  unreadCount: number;
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
