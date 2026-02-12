# LuggageShare API Specification

> **Status**: REFERENCE ONLY - See [ROADMAP.md](ROADMAP.md) for current implementation status.
>
> **Version**: 1.0.0
> **Base URL**: `https://api.luggageshare.com/v1`
> **Format**: REST + WebSocket
> **Authentication**: JWT Bearer Token

---

## Implementation Status & Changes

**Implemented modules** (6/13): Auth, Users, Listings, Bookings, Messages, Notifications
**Not yet implemented** (7/13): Items, Reviews, Payments, Balance/Wallet, Flights, Admin, WebSocket

### Key Changes from Original Spec
- **Pricing**: Tiered (S/M/L) instead of per-kg. Listing responses will include `pricing: { small, medium, large }` instead of `pricePerKg`
- **Messaging**: Adding pre-booking conversations. New `POST /conversations` endpoint needed (currently messages are booking-scoped only)
- **Section 8 (Payments)**: Has duplicate 8.3 and 8.4 section numbers - needs cleanup when implementing

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Listings](#3-listings)
4. [Bookings](#4-bookings)
5. [Items](#5-items)
6. [Messages](#6-messages)
7. [Reviews](#7-reviews)
8. [Payments](#8-payments)
9. [Balance/Wallet](#9-balancewallet)
10. [Notifications](#10-notifications)
11. [Flights](#11-flights)
12. [Admin](#12-admin)
13. [WebSocket Events](#13-websocket-events)

---

## API Standards

### Request Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept-Language: ar | en (default: ar)
X-Device-Type: ios | android | web
X-App-Version: 1.0.0
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": [
      { "field": "phone", "message": "Phone must start with country code" }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

### Pagination

```
GET /resource?page=1&limit=20&sort=createdAt&order=desc
```

---

## 1. Authentication

> **MVP Strategy**: Google + Apple Sign-In (free)
> **Phase 2**: Add Phone OTP via WhatsApp/SMS (post-revenue)

### 1.1 Social Login (MVP - Primary)

Authenticate via Google or Apple Sign-In.

```
POST /auth/social
```

**Request:**
```json
{
  "provider": "google" | "apple",
  "idToken": "google_or_apple_id_token_here",
  "accessToken": "optional_access_token",
  "nonce": "apple_nonce_if_applicable"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "user": {
      "id": "user_xyz",
      "email": "user@example.com",
      "isNewUser": true,
      "profileComplete": false
    }
  }
}
```

**Notes:**
- For Google: Use `expo-auth-session` or `@react-native-google-signin/google-signin`
- For Apple: Use `expo-apple-authentication` (required for iOS apps with social login)

---

### 1.2 Request OTP (Phase 2 - Post-Revenue)

> ⚠️ **Not in MVP** - Will be added when revenue supports SMS costs

Send OTP to phone number for verification.

```
POST /auth/otp/request
```

**Request:**
```json
{
  "phone": "+966501234567",
  "type": "login" | "register",
  "channel": "whatsapp" | "sms"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "otpId": "otp_abc123",
    "expiresIn": 300,
    "phone": "+966501234567",
    "channel": "whatsapp"
  }
}
```

**Rate Limit:** 3 requests per phone per 10 minutes

---

### 1.3 Verify OTP (Phase 2)

> ⚠️ **Not in MVP**

Verify OTP and receive authentication tokens.

```
POST /auth/otp/verify
```

**Request:**
```json
{
  "otpId": "otp_abc123",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "user": {
      "id": "user_xyz",
      "phone": "+966501234567",
      "isNewUser": true,
      "profileComplete": false
    }
  }
}
```

---

### 1.4 Refresh Token

Get new access token using refresh token.

```
POST /auth/refresh
```

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": 3600
  }
}
```

---

### 1.5 Logout

Invalidate current session.

```
POST /auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

## 2. Users

### 2.1 Get Current User

```
GET /users/me
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_xyz",
    "phone": "+966501234567",
    "email": "user@example.com",
    "firstName": "Ahmed",
    "lastName": "Al-Saud",
    "displayName": "Ahmed A.",
    "avatarUrl": "https://cdn.luggageshare.com/avatars/user_xyz.jpg",
    "countryCode": "SA",
    "city": "Riyadh",
    "preferredLanguage": "ar",
    "isVerified": true,
    "verificationLevel": 2,
    "stats": {
      "tripsAsCarrier": 12,
      "tripsAsSender": 5,
      "ratingAsCarrier": 4.8,
      "ratingAsSender": 4.9,
      "totalReviews": 15
    },
    "settings": {
      "pushNotifications": true,
      "emailNotifications": true,
      "smsNotifications": false
    },
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

---

### 2.2 Update Profile

```
PATCH /users/me
```

**Request:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Al-Saud",
  "displayName": "Ahmed A.",
  "email": "ahmed@example.com",
  "city": "Riyadh",
  "preferredLanguage": "ar",
  "bio": "Frequent traveler between Riyadh and Cairo"
}
```

**Response (200):** Returns updated user object

---

### 2.3 Upload Avatar

```
POST /users/me/avatar
```

**Content-Type:** `multipart/form-data`

**Request:**
```
avatar: <image file> (max 5MB, jpg/png)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.luggageshare.com/avatars/user_xyz.jpg"
  }
}
```

---

### 2.4 Update Settings

```
PATCH /users/me/settings
```

**Request:**
```json
{
  "pushNotifications": true,
  "emailNotifications": false,
  "smsNotifications": false
}
```

---

### 2.5 Get User Profile (Public)

```
GET /users/:userId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_xyz",
    "displayName": "Ahmed A.",
    "avatarUrl": "https://cdn.luggageshare.com/avatars/user_xyz.jpg",
    "isVerified": true,
    "verificationLevel": 2,
    "stats": {
      "tripsAsCarrier": 12,
      "tripsAsSender": 5,
      "ratingAsCarrier": 4.8,
      "ratingAsSender": 4.9,
      "totalReviews": 15
    },
    "memberSince": "2026-01-15T10:30:00Z"
  }
}
```

---

### 2.6 Submit Verification Documents

```
POST /users/me/verification
```

**Content-Type:** `multipart/form-data`

**Request:**
```
documentType: national_id | passport | iqama
frontImage: <image file>
backImage: <image file> (optional)
selfieImage: <image file>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verificationId": "ver_abc123",
    "status": "pending",
    "message": "Documents submitted. Verification typically takes 24-48 hours."
  }
}
```

---

### 2.7 Get Verification Status

```
GET /users/me/verification
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verificationLevel": 1,
    "levels": [
      { "level": 1, "name": "Phone Verified", "completed": true },
      { "level": 2, "name": "ID Verified", "completed": false, "status": "pending" },
      { "level": 3, "name": "Fully Verified", "completed": false }
    ]
  }
}
```

---

## 3. Listings

### 3.1 Create Listing

```
POST /listings
```

**Request:**
```json
{
  "flightNumber": "SV123",
  "departureAirport": "RUH",
  "arrivalAirport": "CAI",
  "departureDate": "2026-02-15",
  "totalAllowanceKg": 30,
  "usedKg": 12,
  "availableKg": 18,
  "minBookingKg": 2,
  "pricePerKg": 25,
  "currency": "SAR",
  "preferences": {
    "acceptsDocuments": true,
    "acceptsClothing": true,
    "acceptsElectronics": true,
    "acceptsGifts": true,
    "acceptsOther": false
  },
  "notes": "Will be at airport 3 hours early. Happy to help with gifts."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "listing_abc123",
    "bookingRef": "LS-A1B2C3",
    "carrier": { ... },
    "flight": {
      "flightNumber": "SV123",
      "airline": "Saudia",
      "departureAirport": {
        "code": "RUH",
        "name": "King Khalid International Airport",
        "city": "Riyadh"
      },
      "arrivalAirport": {
        "code": "CAI",
        "name": "Cairo International Airport",
        "city": "Cairo"
      },
      "departureDate": "2026-02-15",
      "departureTime": "14:30",
      "arrivalTime": "16:45"
    },
    "availableKg": 18,
    "pricePerKg": 25,
    "currency": "SAR",
    "totalPrice": 450,
    "status": "active",
    "preferences": { ... },
    "createdAt": "2026-01-28T10:30:00Z",
    "expiresAt": "2026-02-15T14:30:00Z"
  }
}
```

---

### 3.2 Get Listings (Search)

```
GET /listings
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | string | Departure airport code (e.g., RUH) |
| `to` | string | Arrival airport code (e.g., CAI) |
| `date` | date | Departure date (YYYY-MM-DD) |
| `dateRange` | number | Days before/after date (default: 3) |
| `minKg` | number | Minimum available kg |
| `maxPricePerKg` | number | Maximum price per kg |
| `verifiedOnly` | boolean | Only verified carriers |
| `sort` | string | `price`, `date`, `rating` |
| `page` | number | Page number |
| `limit` | number | Results per page (max 50) |

**Example:**
```
GET /listings?from=RUH&to=CAI&date=2026-02-15&minKg=5&sort=price
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "listing_abc123",
      "carrier": {
        "id": "user_xyz",
        "displayName": "Ahmed A.",
        "avatarUrl": "...",
        "isVerified": true,
        "rating": 4.8,
        "totalTrips": 12
      },
      "flight": {
        "flightNumber": "SV123",
        "airline": "Saudia",
        "departureDate": "2026-02-15",
        "departureTime": "14:30"
      },
      "route": {
        "from": { "code": "RUH", "city": "Riyadh" },
        "to": { "code": "CAI", "city": "Cairo" }
      },
      "availableKg": 18,
      "pricePerKg": 25,
      "currency": "SAR",
      "preferences": { ... },
      "createdAt": "2026-01-28T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "hasMore": true
  }
}
```

---

### 3.3 Get Single Listing

```
GET /listings/:listingId
```

**Response (200):** Full listing object with all details

---

### 3.4 Update Listing

```
PATCH /listings/:listingId
```

**Request:** Same fields as create (partial update)

**Response (200):** Updated listing object

---

### 3.5 Cancel Listing

```
POST /listings/:listingId/cancel
```

**Request:**
```json
{
  "reason": "Flight cancelled"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "listing_abc123",
    "status": "cancelled",
    "cancelledAt": "2026-01-28T12:00:00Z"
  }
}
```

**Note:** Can only cancel if no active bookings

---

### 3.6 Get My Listings

```
GET /listings/me
```

**Query Parameters:**
- `status`: `active`, `completed`, `cancelled`, `all`

**Response (200):** Array of listings

---

## 4. Bookings

### 4.1 Create Booking Request

```
POST /bookings
```

**Request:**
```json
{
  "listingId": "listing_abc123",
  "weightKg": 5,
  "insuranceTier": 1,
  "message": "Hi Ahmed, I have 5kg of clothes and gifts for my family in Cairo."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "booking_xyz789",
    "bookingRef": "LS-X1Y2Z3",
    "listing": { ... },
    "carrier": { ... },
    "sender": { ... },
    "weightKg": 5,
    "pricing": {
      "pricePerKg": 25,
      "subtotal": 125,
      "platformFee": 0,
      "insuranceFee": 4.99,
      "totalAmount": 129.99,
      "currency": "SAR"
    },
    "insurance": {
      "tier": 1,
      "coverage": 1000
    },
    "status": "pending",
    "statusHistory": [
      { "status": "pending", "timestamp": "2026-01-28T10:30:00Z" }
    ],
    "createdAt": "2026-01-28T10:30:00Z"
  }
}
```

---

### 4.2 Get Booking

```
GET /bookings/:bookingId
```

**Response (200):** Full booking object

---

### 4.3 Get My Bookings

```
GET /bookings/me
```

**Query Parameters:**
- `role`: `carrier`, `sender`, `all`
- `status`: `active`, `completed`, `cancelled`, `all`

**Response (200):** Array of bookings

---

### 4.4 Accept Booking (Carrier)

```
POST /bookings/:bookingId/accept
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking_xyz789",
    "status": "accepted",
    "acceptedAt": "2026-01-28T11:00:00Z",
    "nextStep": "Sender should now list their items"
  }
}
```

---

### 4.5 Reject Booking (Carrier)

```
POST /bookings/:bookingId/reject
```

**Request:**
```json
{
  "reason": "Not enough space available"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking_xyz789",
    "status": "rejected",
    "rejectedAt": "2026-01-28T11:00:00Z"
  }
}
```

---

### 4.6 Cancel Booking

```
POST /bookings/:bookingId/cancel
```

**Request:**
```json
{
  "reason": "Changed travel plans"
}
```

**Response (200):** Booking with cancelled status

**Cancellation Rules:**
- Before items listed: Full refund
- After items approved: 80% refund
- Within 24h of flight: 50% refund
- No-show: No refund

---

### 4.7 Confirm Pickup (Carrier)

```
POST /bookings/:bookingId/pickup
```

**Request:**
```json
{
  "location": {
    "latitude": 24.7136,
    "longitude": 46.6753,
    "name": "King Khalid Airport, Terminal 1"
  },
  "photos": ["photo_id_1", "photo_id_2"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking_xyz789",
    "status": "picked_up",
    "pickedUpAt": "2026-02-15T11:30:00Z",
    "pickupLocation": { ... },
    "pickupPhotos": [...]
  }
}
```

---

### 4.8 Confirm Delivery (Sender)

```
POST /bookings/:bookingId/deliver
```

**Request:**
```json
{
  "location": {
    "latitude": 30.0444,
    "longitude": 31.2357,
    "name": "Cairo Airport, Terminal 2"
  },
  "photos": ["photo_id_3", "photo_id_4"],
  "allItemsReceived": true,
  "condition": "good"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking_xyz789",
    "status": "delivered",
    "deliveredAt": "2026-02-15T17:00:00Z",
    "nextStep": "Please leave a review for the carrier"
  }
}
```

---

### 4.9 Complete Booking

```
POST /bookings/:bookingId/complete
```

Automatically triggered when:
- Delivery confirmed
- Both reviews submitted (or 7 days passed)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking_xyz789",
    "status": "completed",
    "completedAt": "2026-02-15T17:30:00Z",
    "paymentReleased": true
  }
}
```

---

## 5. Items

### 5.1 Add Item to Booking

```
POST /bookings/:bookingId/items
```

**Request:**
```json
{
  "name": "Winter jacket for brother",
  "description": "Blue North Face jacket, size L",
  "category": "clothing",
  "quantity": 1,
  "estimatedWeightKg": 1.5,
  "declaredValue": 150,
  "currency": "SAR"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "item_abc123",
    "bookingId": "booking_xyz789",
    "name": "Winter jacket for brother",
    "description": "Blue North Face jacket, size L",
    "category": "clothing",
    "quantity": 1,
    "estimatedWeightKg": 1.5,
    "declaredValue": 150,
    "currency": "SAR",
    "status": "pending",
    "photos": [],
    "createdAt": "2026-01-28T12:00:00Z"
  }
}
```

---

### 5.2 Upload Item Photo

```
POST /bookings/:bookingId/items/:itemId/photos
```

**Content-Type:** `multipart/form-data`

**Request:**
```
photo: <image file> (max 10MB, jpg/png)
photoType: item | packaging | handoff_pickup | handoff_delivery
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "photo_xyz",
    "itemId": "item_abc123",
    "photoUrl": "https://cdn.luggageshare.com/items/photo_xyz.jpg",
    "thumbnailUrl": "https://cdn.luggageshare.com/items/photo_xyz_thumb.jpg",
    "photoType": "item",
    "createdAt": "2026-01-28T12:05:00Z"
  }
}
```

---

### 5.3 Get Booking Items

```
GET /bookings/:bookingId/items
```

**Response (200):** Array of items with photos

---

### 5.4 Update Item

```
PATCH /bookings/:bookingId/items/:itemId
```

**Request:** Partial update of item fields

---

### 5.5 Delete Item

```
DELETE /bookings/:bookingId/items/:itemId
```

**Note:** Only allowed before items are approved

---

### 5.6 Submit Items for Approval

```
POST /bookings/:bookingId/items/submit
```

Marks all items as ready for carrier review.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_xyz789",
    "status": "items_listed",
    "totalItems": 5,
    "totalWeight": 4.5,
    "message": "Items submitted. Waiting for carrier approval."
  }
}
```

---

### 5.7 Approve Items (Carrier)

```
POST /bookings/:bookingId/items/approve
```

**Request:**
```json
{
  "approvedItems": ["item_1", "item_2", "item_3"],
  "rejectedItems": [
    {
      "itemId": "item_4",
      "reason": "Electronics not allowed"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_xyz789",
    "status": "items_approved",
    "approvedCount": 3,
    "rejectedCount": 1,
    "nextStep": "Sender should proceed to payment"
  }
}
```

---

## 6. Messages

### 6.1 Get Conversations

```
GET /messages/conversations
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_abc123",
      "booking": {
        "id": "booking_xyz789",
        "bookingRef": "LS-X1Y2Z3",
        "status": "accepted"
      },
      "otherUser": {
        "id": "user_xyz",
        "displayName": "Ahmed A.",
        "avatarUrl": "...",
        "isOnline": true
      },
      "lastMessage": {
        "content": "See you at Terminal 1!",
        "sentAt": "2026-01-28T14:30:00Z",
        "isRead": false
      },
      "unreadCount": 2,
      "updatedAt": "2026-01-28T14:30:00Z"
    }
  ]
}
```

---

### 6.2 Get Conversation Messages

```
GET /messages/conversations/:conversationId
```

**Query Parameters:**
- `before`: message ID for pagination
- `limit`: max 50

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversation": { ... },
    "messages": [
      {
        "id": "msg_123",
        "senderId": "user_xyz",
        "content": "Hi! Happy to help with your items.",
        "messageType": "text",
        "isRead": true,
        "createdAt": "2026-01-28T14:00:00Z"
      },
      {
        "id": "msg_124",
        "senderId": "user_abc",
        "content": "Great! I have 5kg of clothes.",
        "messageType": "text",
        "isRead": true,
        "createdAt": "2026-01-28T14:05:00Z"
      }
    ]
  }
}
```

---

### 6.3 Send Message

```
POST /messages/conversations/:conversationId
```

**Request:**
```json
{
  "content": "See you at Terminal 1!",
  "messageType": "text"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "msg_125",
    "conversationId": "conv_abc123",
    "senderId": "user_xyz",
    "content": "See you at Terminal 1!",
    "messageType": "text",
    "isRead": false,
    "createdAt": "2026-01-28T14:30:00Z"
  }
}
```

---

### 6.4 Send Location

```
POST /messages/conversations/:conversationId
```

**Request:**
```json
{
  "messageType": "location",
  "location": {
    "latitude": 24.7136,
    "longitude": 46.6753,
    "name": "Starbucks, Terminal 1"
  }
}
```

---

### 6.5 Send Image

```
POST /messages/conversations/:conversationId/image
```

**Content-Type:** `multipart/form-data`

**Request:**
```
image: <image file>
```

---

### 6.6 Mark as Read

```
POST /messages/conversations/:conversationId/read
```

**Request:**
```json
{
  "messageIds": ["msg_123", "msg_124", "msg_125"]
}
```

---

### 6.7 Start Conversation

```
POST /messages/conversations
```

**Request:**
```json
{
  "userId": "user_xyz",
  "bookingId": "booking_xyz789",
  "initialMessage": "Hi! I'm interested in your listing."
}
```

---

## 7. Reviews

### 7.1 Create Review

```
POST /bookings/:bookingId/reviews
```

**Request:**
```json
{
  "rating": 5,
  "communicationRating": 5,
  "punctualityRating": 4,
  "itemConditionRating": 5,
  "comment": "Ahmed was very helpful and professional. Items arrived in perfect condition!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "review_abc123",
    "bookingId": "booking_xyz789",
    "reviewerId": "user_abc",
    "revieweeId": "user_xyz",
    "reviewType": "carrier",
    "rating": 5,
    "communicationRating": 5,
    "punctualityRating": 4,
    "itemConditionRating": 5,
    "comment": "Ahmed was very helpful and professional...",
    "createdAt": "2026-02-16T10:00:00Z"
  }
}
```

---

### 7.2 Get User Reviews

```
GET /users/:userId/reviews
```

**Query Parameters:**
- `type`: `carrier`, `sender`, `all`
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "averageRating": 4.8,
      "totalReviews": 15,
      "ratingDistribution": {
        "5": 12,
        "4": 2,
        "3": 1,
        "2": 0,
        "1": 0
      }
    },
    "reviews": [
      {
        "id": "review_abc123",
        "reviewer": {
          "id": "user_abc",
          "displayName": "Sara M.",
          "avatarUrl": "..."
        },
        "rating": 5,
        "comment": "Excellent service!",
        "createdAt": "2026-02-16T10:00:00Z"
      }
    ]
  }
}
```

---

## 8. Payments

### Payment Strategy: Phased Approach

**Phase 1 (Launch)**: Direct bank transfer between users
**Phase 2 (Month 7+)**: Platform escrow with manual processing
**Phase 3 (Year 2+)**: Automated payment gateway

---

### 8.1 Get Payment Details (Phase 1: Direct Transfer)

```
GET /bookings/:bookingId/payment-details
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_xyz789",
    "paymentMethod": "bank_transfer",
    "amount": 125.00,
    "currency": "SAR",
    "carrier": {
      "bankName": "Al Rajhi Bank",
      "bankNameAr": "بنك الراجحي",
      "iban": "SA0380000000608010167519",
      "accountName": "Ahmed Al-Rashid",
      "accountNameAr": "أحمد الراشد"
    },
    "reference": "LS-X1Y2Z3",
    "instructions": "Transfer the exact amount and include booking reference",
    "instructionsAr": "حوّل المبلغ بالضبط وأضف رقم الحجز كمرجع"
  }
}
```

---

### 8.2 Submit Payment Proof

After sender transfers money, they upload proof.

```
POST /bookings/:bookingId/payment-proof
```

**Content-Type:** `multipart/form-data`

**Request:**
```
screenshot: <image file> (transfer confirmation screenshot)
transferDate: 2026-02-14
transferReference: optional bank reference number
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "proofId": "proof_abc123",
    "bookingId": "booking_xyz789",
    "screenshotUrl": "https://cdn.luggageshare.com/proofs/proof_abc123.jpg",
    "status": "pending_verification",
    "message": "Payment proof submitted. Carrier will verify receipt.",
    "messageAr": "تم إرسال إثبات الدفع. سيتحقق الناقل من الاستلام."
  }
}
```

---

### 8.3 Confirm Payment Received (Carrier)

Carrier confirms they received the bank transfer.

```
POST /bookings/:bookingId/payment-confirm
```

**Request:**
```json
{
  "confirmed": true,
  "note": "Received 125 SAR on Feb 14"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_xyz789",
    "paymentStatus": "confirmed",
    "bookingStatus": "payment_completed",
    "confirmedAt": "2026-02-14T10:30:00Z",
    "nextStep": "Coordinate pickup with sender"
  }
}
```

---

### 8.4 Report Payment Issue

If carrier didn't receive payment or amount is wrong.

```
POST /bookings/:bookingId/payment-issue
```

**Request:**
```json
{
  "issueType": "not_received" | "wrong_amount" | "other",
  "description": "Transfer not showing in my account",
  "expectedAmount": 125.00,
  "receivedAmount": 0
}
```

---

### 8.3 Get Payment Status

```
GET /payments/:paymentId
```

---

### 8.4 Get Payment History

```
GET /payments/me
```

**Response (200):** Array of payment transactions

---

### 8.5 Request Refund

```
POST /payments/:paymentId/refund
```

**Request:**
```json
{
  "reason": "Booking cancelled",
  "amount": 129.99
}
```

---

### 8.6 Get Earnings (Carrier)

```
GET /payments/earnings
```

**Query Parameters:**
- `period`: `week`, `month`, `year`, `all`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 1250.00,
    "pendingPayouts": 250.00,
    "availableBalance": 1000.00,
    "currency": "SAR",
    "transactions": [
      {
        "id": "txn_123",
        "bookingRef": "LS-X1Y2Z3",
        "amount": 125.00,
        "status": "completed",
        "completedAt": "2026-02-16T10:00:00Z"
      }
    ]
  }
}
```

---

### 8.7 Request Payout

```
POST /payments/payout
```

**Request:**
```json
{
  "amount": 500.00,
  "payoutMethod": "bank_transfer",
  "bankDetails": {
    "bankName": "Al Rajhi Bank",
    "iban": "SA0380000000608010167519"
  }
}
```

---

## 9. Balance/Wallet

The Credit Balance System tracks platform commissions. Carriers accumulate negative balance when trips complete. If balance falls below threshold (-10 SAR default), account is restricted.

### 9.1 Get Balance

Get current user's balance and transaction history.

```
GET /balance
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": -7.50,
    "currency": "SAR",
    "threshold": -10.00,
    "isRestricted": false,
    "availableCredit": 2.50,
    "lastUpdated": "2026-01-28T10:00:00Z",
    "summary": {
      "totalCommissionCharged": 150.00,
      "totalTopUps": 142.50,
      "pendingTopUps": 0
    }
  }
}
```

---

### 9.2 Get Balance Transactions

Get transaction history for the current user.

```
GET /balance/transactions
```

**Query Parameters:**
- `type`: `commission_charge` | `top_up` | `adjustment` | `refund` | `bonus`
- `status`: `pending` | `completed` | `rejected`
- `startDate`, `endDate`: ISO date filters
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_abc123",
        "type": "commission_charge",
        "amount": -5.00,
        "balanceBefore": -2.50,
        "balanceAfter": -7.50,
        "description": "5% commission on booking LS-A1B2C3",
        "bookingRef": "LS-A1B2C3",
        "status": "completed",
        "createdAt": "2026-01-28T10:00:00Z"
      },
      {
        "id": "txn_abc122",
        "type": "top_up",
        "amount": 50.00,
        "balanceBefore": -52.50,
        "balanceAfter": -2.50,
        "description": "Balance top-up via bank transfer",
        "paymentMethod": "bank_transfer",
        "status": "completed",
        "verifiedAt": "2026-01-27T15:00:00Z",
        "createdAt": "2026-01-27T14:30:00Z"
      }
    ]
  }
}
```

---

### 9.3 Request Top-Up

Submit a top-up request to clear negative balance.

```
POST /balance/top-up
```

**Request:**
```json
{
  "amount": 50.00,
  "paymentMethod": "bank_transfer",
  "paymentProofUrl": "https://storage.luggageshare.com/proofs/txn123.jpg",
  "notes": "Transferred from Al Rajhi Bank"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_xyz789",
    "amount": 50.00,
    "status": "pending",
    "message": "Top-up request submitted. Will be verified within 24 hours.",
    "messageAr": "تم إرسال طلب الشحن. سيتم التحقق منه خلال 24 ساعة.",
    "platformBankDetails": {
      "bankName": "Al Rajhi Bank",
      "accountName": "LuggageShare Platform",
      "iban": "SA1234567890123456789012"
    }
  }
}
```

---

### 9.4 Get Platform Bank Details

Get platform bank details for top-up transfers.

```
GET /balance/bank-details
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "banks": [
      {
        "bankName": "Al Rajhi Bank",
        "bankNameAr": "مصرف الراجحي",
        "accountName": "LuggageShare Platform",
        "iban": "SA1234567890123456789012",
        "swiftCode": "RJHISARI"
      },
      {
        "bankName": "Al Ahli Bank (SNB)",
        "bankNameAr": "البنك الأهلي السعودي",
        "accountName": "LuggageShare Platform",
        "iban": "SA9876543210987654321098",
        "swiftCode": "NCBKSAJE"
      }
    ],
    "instructions": {
      "en": "Transfer the exact amount and include your registered phone number in the transfer notes.",
      "ar": "قم بتحويل المبلغ المحدد وأضف رقم جوالك المسجل في ملاحظات التحويل."
    },
    "minimumTopUp": 10.00,
    "currency": "SAR"
  }
}
```

---

### 9.5 Upload Payment Proof

Upload proof of payment for top-up verification.

```
POST /balance/top-up/:transactionId/proof
```

**Request (multipart/form-data):**
- `proof`: Image file (JPEG, PNG)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "proofUrl": "https://storage.luggageshare.com/proofs/txn123.jpg",
    "transactionId": "txn_xyz789",
    "status": "pending"
  }
}
```

---

### 9.6 Check Restriction Status

Check if user can post listings or accept bookings.

```
GET /balance/restriction-status
```

**Response (200) - Not Restricted:**
```json
{
  "success": true,
  "data": {
    "isRestricted": false,
    "canPostListings": true,
    "canAcceptBookings": true,
    "balance": -5.00,
    "threshold": -10.00,
    "availableCredit": 5.00
  }
}
```

**Response (200) - Restricted:**
```json
{
  "success": true,
  "data": {
    "isRestricted": true,
    "canPostListings": false,
    "canAcceptBookings": false,
    "balance": -15.00,
    "threshold": -10.00,
    "amountOwed": 15.00,
    "minimumPayment": 5.00,
    "message": "Your account is restricted. Please top up at least 5.00 SAR to continue.",
    "messageAr": "حسابك مقيد. يرجى شحن 5.00 ريال على الأقل للاستمرار."
  }
}
```

---

### Balance Error Codes

| Code | Description |
|------|-------------|
| `BALANCE_RESTRICTED` | User balance below threshold, cannot post/accept |
| `TOPUP_PENDING` | A top-up is already pending verification |
| `TOPUP_MINIMUM` | Amount below minimum top-up (10 SAR) |
| `INVALID_PROOF` | Payment proof image invalid or unreadable |

---

## 10. Notifications

### 9.1 Get Notifications

```
GET /notifications
```

**Query Parameters:**
- `unreadOnly`: boolean
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5,
    "notifications": [
      {
        "id": "notif_123",
        "type": "booking_request",
        "title": "New Booking Request",
        "titleAr": "طلب حجز جديد",
        "body": "Sara wants to book 5kg on your RUH-CAI flight",
        "bodyAr": "سارة تريد حجز 5 كجم على رحلتك من الرياض للقاهرة",
        "action": {
          "type": "open_booking",
          "data": { "bookingId": "booking_xyz789" }
        },
        "isRead": false,
        "createdAt": "2026-01-28T14:00:00Z"
      }
    ]
  }
}
```

---

### 9.2 Mark Notifications Read

```
POST /notifications/read
```

**Request:**
```json
{
  "notificationIds": ["notif_123", "notif_124"]
}
```

---

### 9.3 Mark All Read

```
POST /notifications/read-all
```

---

### 9.4 Register Push Token

```
POST /notifications/push-token
```

**Request:**
```json
{
  "token": "ExponentPushToken[xxx]",
  "platform": "ios" | "android"
}
```

---

### 9.5 Remove Push Token

```
DELETE /notifications/push-token
```

**Request:**
```json
{
  "token": "ExponentPushToken[xxx]"
}
```

---

## 11. Flights

### 10.1 Search Flights

```
GET /flights/search
```

**Query Parameters:**
- `number`: Flight number (e.g., SV123)
- `date`: Date (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "flightNumber": "SV123",
    "airline": {
      "code": "SV",
      "name": "Saudia",
      "logo": "https://..."
    },
    "departure": {
      "airport": "RUH",
      "city": "Riyadh",
      "terminal": "1",
      "date": "2026-02-15",
      "time": "14:30",
      "timezone": "Asia/Riyadh"
    },
    "arrival": {
      "airport": "CAI",
      "city": "Cairo",
      "terminal": "2",
      "date": "2026-02-15",
      "time": "16:45",
      "timezone": "Africa/Cairo"
    },
    "status": "scheduled",
    "duration": "2h 15m"
  }
}
```

---

### 10.2 Get Popular Routes

```
GET /flights/popular-routes
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "from": { "code": "RUH", "city": "Riyadh", "cityAr": "الرياض" },
      "to": { "code": "CAI", "city": "Cairo", "cityAr": "القاهرة" },
      "activeListings": 24,
      "avgPricePerKg": 25
    },
    {
      "from": { "code": "JED", "city": "Jeddah", "cityAr": "جدة" },
      "to": { "code": "MNL", "city": "Manila", "cityAr": "مانيلا" },
      "activeListings": 18,
      "avgPricePerKg": 35
    }
  ]
}
```

---

### 10.3 Get Airports

```
GET /flights/airports
```

**Query Parameters:**
- `search`: Search term
- `popular`: boolean (show popular only)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "code": "RUH",
      "name": "King Khalid International Airport",
      "nameAr": "مطار الملك خالد الدولي",
      "city": "Riyadh",
      "cityAr": "الرياض",
      "country": "SA",
      "isPopular": true
    }
  ]
}
```

---

## 12. Admin

*Note: Admin endpoints require `admin` role*

### 12.1 Get Users

```
GET /admin/users
```

### 12.2 Verify User

```
POST /admin/users/:userId/verify
```

### 12.3 Ban User

```
POST /admin/users/:userId/ban
```

### 12.4 Get Disputes

```
GET /admin/disputes
```

### 12.5 Resolve Dispute

```
POST /admin/disputes/:disputeId/resolve
```

### 12.6 Get Analytics

```
GET /admin/analytics
```

### 12.7 Get Pending Top-Ups

Get all pending balance top-up requests.

```
GET /admin/balance/top-ups
```

**Query Parameters:**
- `status`: `pending` | `completed` | `rejected`
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "topUps": [
      {
        "id": "txn_xyz789",
        "user": {
          "id": "user_123",
          "displayName": "Ahmed",
          "phone": "+966501234567"
        },
        "amount": 50.00,
        "paymentMethod": "bank_transfer",
        "paymentProofUrl": "https://storage.../proof.jpg",
        "notes": "Transferred from Al Rajhi Bank",
        "status": "pending",
        "createdAt": "2026-01-28T14:30:00Z"
      }
    ]
  }
}
```

---

### 12.8 Verify Top-Up

Approve a pending top-up and credit user's balance.

```
POST /admin/balance/top-ups/:transactionId/verify
```

**Request:**
```json
{
  "approved": true,
  "notes": "Verified bank transfer receipt"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_xyz789",
    "status": "completed",
    "userBalanceBefore": -52.50,
    "userBalanceAfter": -2.50,
    "userRestrictionLifted": true
  }
}
```

---

### 12.9 Reject Top-Up

Reject a pending top-up request.

```
POST /admin/balance/top-ups/:transactionId/reject
```

**Request:**
```json
{
  "reason": "Payment proof does not match the claimed amount"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_xyz789",
    "status": "rejected",
    "reason": "Payment proof does not match the claimed amount"
  }
}
```

---

### 12.10 Adjust User Balance

Manually adjust a user's balance (for disputes, corrections, bonuses).

```
POST /admin/balance/adjust
```

**Request:**
```json
{
  "userId": "user_123",
  "amount": 10.00,
  "type": "adjustment",
  "reason": "Dispute resolution - overcharged commission refund"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_adj456",
    "userId": "user_123",
    "amount": 10.00,
    "balanceBefore": -15.00,
    "balanceAfter": -5.00,
    "restrictionLifted": true
  }
}
```

---

### 12.11 Get Balance Dashboard

Get platform-wide balance statistics.

```
GET /admin/balance/dashboard
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalOwed": 15250.00,
    "restrictedUsers": 23,
    "pendingTopUps": {
      "count": 5,
      "totalAmount": 450.00
    },
    "thisMonth": {
      "commissionsCharged": 3500.00,
      "topUpsReceived": 2800.00,
      "adjustments": -150.00
    },
    "lastMonth": {
      "commissionsCharged": 2800.00,
      "topUpsReceived": 2500.00,
      "adjustments": -100.00
    }
  }
}
```

---

## 13. WebSocket Events

### Connection

```javascript
// Connect to WebSocket
const socket = io('wss://api.luggageshare.com', {
  auth: { token: 'jwt_token_here' }
});
```

### Events (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `{ conversationId }` | Join chat room |
| `leave_conversation` | `{ conversationId }` | Leave chat room |
| `send_message` | `{ conversationId, content, type }` | Send message |
| `typing_start` | `{ conversationId }` | User started typing |
| `typing_stop` | `{ conversationId }` | User stopped typing |
| `mark_read` | `{ conversationId, messageIds }` | Mark messages read |

### Events (Server → Client)

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ message }` | New message received |
| `message_read` | `{ messageIds, userId }` | Messages marked read |
| `user_typing` | `{ conversationId, userId }` | User is typing |
| `user_online` | `{ userId }` | User came online |
| `user_offline` | `{ userId }` | User went offline |
| `booking_updated` | `{ booking }` | Booking status changed |
| `notification` | `{ notification }` | New notification |

### Example Usage

```javascript
// Join conversation
socket.emit('join_conversation', { conversationId: 'conv_abc123' });

// Listen for new messages
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
});

// Send message
socket.emit('send_message', {
  conversationId: 'conv_abc123',
  content: 'Hello!',
  type: 'text'
});

// Handle typing indicator
socket.emit('typing_start', { conversationId: 'conv_abc123' });
// ... after user stops typing
socket.emit('typing_stop', { conversationId: 'conv_abc123' });

// Listen for typing
socket.on('user_typing', (data) => {
  showTypingIndicator(data.userId);
});
```

---

## Rate Limits

| Endpoint Category | Limit |
|-------------------|-------|
| Authentication | 10 req/min |
| General API | 100 req/min |
| File Upload | 20 req/min |
| Search | 30 req/min |
| WebSocket Messages | 60 msg/min |

---

## Versioning

API versioning via URL path: `/v1/`, `/v2/`

Breaking changes will increment major version.
Non-breaking additions will be documented in changelog.

---

*API Specification v1.0.0*
*Last Updated: January 2026*
