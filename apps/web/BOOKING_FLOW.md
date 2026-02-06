# Booking Flow Documentation

## Overview
Complete booking lifecycle implementation for LuggageShare web app, enabling users to book listings, track bookings, and communicate with carriers.

## File Structure

### Types
- `/src/lib/types/booking.ts` - Booking type definitions
  - `Booking` - Main booking entity
  - `BookingStatus` - Status enum (pending, confirmed, in_transit, delivered, cancelled, disputed)
  - `PackageSize` - Size options (small, medium, large)
  - `CreateBookingRequest` - Request payload for creating bookings

### Mock Data
- `/src/lib/data/mockBookings.ts` - Sample booking data with 3 bookings in different states

### Pages

#### 1. My Bookings List (`/bookings`)
**File**: `/src/app/bookings/page.tsx`

**Features**:
- Filter tabs: All, Active (pending/confirmed/in_transit), Past (delivered/cancelled/disputed)
- Booking cards with:
  - Route visualization (from → to)
  - Status badge with color coding
  - Key details (carrier, size, price)
  - Unread message indicator
- Empty state with CTA to browse listings
- Clickable cards navigate to booking detail

#### 2. Create Booking Flow (`/bookings/create?listing=ID`)
**File**: `/src/app/bookings/create/page.tsx`

**Multi-step Form**:
1. **Package Details**
   - Size selection (small/medium/large) with pricing
   - Item category dropdown (filtered by listing restrictions)
   - Item description textarea
   - Weight input

2. **Handoff Selection**
   - Choose from listing's handoff options
   - Options displayed with icons and locations
   - Optional notes field

3. **Contact & Confirmation**
   - Contact name, phone, email (optional)
   - Booking summary with all details
   - Total price calculation
   - Final confirmation

**Validation**:
- Each step validates before allowing progression
- Navigation buttons (Previous/Next) enabled based on validation
- Summary shows all selected options before confirmation

#### 3. Booking Confirmation (`/bookings/confirmation?id=ID`)
**File**: `/src/app/bookings/confirmation/page.tsx`

**Features**:
- Success message with checkmark
- Booking ID display
- "What's Next" section with steps
- Actions: View booking details, Go to my bookings

#### 4. Booking Detail (`/bookings/[id]`)
**File**: `/src/app/bookings/[id]/page.tsx`

**Features**:
- Status timeline (pending → confirmed → in_transit → delivered)
- Route visualization with travel date
- Package details (category, description, size, weight)
- Handoff details with location and notes
- Carrier information with contact
- Pricing summary
- Real-time messaging interface
  - Chat messages with sender identification
  - Message input with send button
  - Unread message indicators

### Integration Points

#### Listing Detail Page
**File**: `/src/app/listings/[id]/page.tsx`

**Updates**:
- Changed "تواصل مع الناشر" button to "احجز الآن" (Book Now)
- Button links to `/bookings/create?listing=${listingId}`

#### Header Navigation
**File**: `/src/components/layout/Header.tsx`

**Updates**:
- Added "حجوزاتي" (My Bookings) link to desktop and mobile navigation
- Links to `/bookings` page

## User Journey

### Complete Booking Flow
1. User browses listings (`/listings`)
2. User clicks on listing to view details (`/listings/[id]`)
3. User clicks "احجز الآن" (Book Now) button
4. User redirected to create booking form (`/bookings/create?listing=ID`)
5. User completes 3-step form:
   - Selects package size and details
   - Chooses handoff method
   - Provides contact information
6. User confirms booking
7. User redirected to confirmation page (`/bookings/confirmation?id=ID`)
8. User can view booking details or go to bookings list
9. User accesses "حجوزاتي" from header navigation
10. User views all bookings with filters
11. User clicks booking to view details and communicate

## Status Flow

```
pending → confirmed → in_transit → delivered
   ↓          ↓           ↓
cancelled  cancelled  cancelled
                     disputed
```

## Mock Data Structure

### Sample Booking States
- **Confirmed**: Booking confirmed by carrier, ready for handoff
- **Pending**: Awaiting carrier confirmation
- **Delivered**: Successfully completed in the past

### Messages
- Each booking can have multiple messages
- Messages track sender, content (Arabic/English), timestamp
- Unread count displayed on booking cards

## Next Steps for Backend Integration

1. Replace mock data with API calls:
   - `GET /api/bookings` - List user's bookings
   - `GET /api/bookings/:id` - Get booking details
   - `POST /api/bookings` - Create new booking
   - `POST /api/bookings/:id/messages` - Send message

2. Add real-time message updates:
   - WebSocket connection for instant messaging
   - Push notifications for new messages

3. Implement payment flow:
   - Payment gateway integration
   - Escrow system for secure transactions

4. Add status update triggers:
   - Carrier confirmation
   - Handoff completion
   - Delivery confirmation

5. File uploads:
   - Package photos
   - Receipt/proof of delivery

## Styling Notes

- Uses Tailwind CSS with Arabic RTL support
- Primary color: `primary-600` (blue)
- Status colors:
  - Yellow: Pending
  - Blue: Confirmed
  - Purple: In Transit
  - Green: Delivered
  - Red: Cancelled
  - Orange: Disputed
- Responsive design with mobile-first approach
- Arabic font and right-to-left layout
