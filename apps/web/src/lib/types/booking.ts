// Booking types for the marketplace

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'disputed';

export type PackageSize = 'small' | 'medium' | 'large';

export type HandoffType = 'home_pickup' | 'mall_meetup' | 'airport_dropoff' | 'custom';

export interface BookingItem {
  category: string;
  categoryAr: string;
  description: string;
  descriptionAr: string;
  weight: number;
}

export interface BookingHandoff {
  type: HandoffType;
  location: string;
  locationAr: string;
  date?: string;
  notes?: string;
  notesAr?: string;
}

export interface BookingContact {
  name: string;
  phone: string;
  email?: string;
}

export interface BookingMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderNameAr: string;
  content: string;
  contentAr?: string;
  timestamp: string;
  isRead: boolean;
}

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingTitleAr: string;

  // Participants
  senderId: string;
  senderName: string;
  senderNameAr: string;
  carrierId: string;
  carrierName: string;
  carrierNameAr: string;

  // Route
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

  // Package details
  packageSize: PackageSize;
  item: BookingItem;

  // Handoff
  handoff: BookingHandoff;

  // Contact
  senderContact: BookingContact;
  carrierContact?: BookingContact;

  // Pricing
  price: number;
  currency: string;

  // Status
  status: BookingStatus;

  // Tracking
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  deliveredAt?: string;

  // Communication
  messages: BookingMessage[];
  unreadCount: number;
}

export interface CreateBookingRequest {
  listingId: string;
  packageSize: PackageSize;
  item: BookingItem;
  handoff: BookingHandoff;
  senderContact: BookingContact;
}
