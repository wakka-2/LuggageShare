# Feature: Trips, Requests & Offers (Core Business Model Refactor)

> **Status**: Design v2 (Panel-Reviewed + Brainstorm-Refined)
> **Date**: 2026-03-04
> **Impact**: HIGH — refactors `Listing` → `Trip` + `Request` + `Offer`
> **Reviews**: Spec Panel (Wiegers, Fowler, Adzic, Nygard, Cockburn) + Brainstorm critique

---

## Business Model

LuggageShare is a **two-sided marketplace** where travelers monetize their spare luggage capacity and senders find affordable delivery.

### Two-Sided Discovery (Solves Cold Start)

| Side | Entity | Who Posts | Who Responds |
|------|--------|-----------|--------------|
| **Supply** | **Trip** | Traveler with spare capacity | Senders browse & make offers |
| **Demand** | **Request** | Sender who needs luggage carried | Travelers browse & make offers |

Both sides feed the same marketplace. Day 1: even if no trips are posted, senders can post requests that attract travelers — and vice versa.

### Core Loops

**Loop A — Traveler Posts Trip:**
1. Traveler posts **Trip** (JED→RUH, March 15, 10kg free)
2. Senders browse trips, submit **Offers** (5kg, 50 SAR)
3. Traveler and sender **negotiate via chat**
4. Traveler **accepts** → **Booking** auto-created

**Loop B — Sender Posts Request:**
1. Sender posts **Request** ("Need 3kg carried JED→RUH by March 20, budget 40 SAR")
2. Travelers browse requests, submit **Offers** ("I can carry this, 35 SAR")
3. Sender and traveler **negotiate via chat**
4. Sender **accepts** → **Booking** auto-created

### Pricing & Negotiation

- Trip posters may set a **suggested price per kg** (optional hint)
- Request posters may set a **budget** (optional max they'll pay)
- Offer makers propose their **own price + weight**
- **Negotiation happens via chat** — no structured counter-offer rounds
- The poster (trip or request) **accepts or rejects** the offer
- All transactions go through the offer→acceptance flow (no instant book)

### Cancellation Policy (MVP)

No financial penalties for MVP. Cancellation rate will be tracked on user profiles for future trust signals. Will revisit penalties based on real cancellation data post-launch.

---

## Data Model

### Current Model (Being Replaced)

```
Listing (conflates trip + offer into one entity)
├── carrierId, departureCity, arrivalCity, departureDate
├── flightNumber, availableWeight, price, currency
├── preferences, notes, status
└── → Booking[]
```

### New Model Overview

```
Trip (posted by a traveler — "I'm going JED→RUH, have 10kg free")
├── posterId, route, date, availableWeight, remainingWeight
├── suggestedPrice?, flightNumber?, transportType, preferences
├── status: active | full | completed | cancelled
└── → Offer[] (from senders), Booking[]

Request (posted by a sender — "I need 3kg carried JED→RUH by March 20")
├── posterId, route, neededByDate, weight, budget?
├── description, itemTypes?, prohibitedItemsDeclaration
├── status: active | fulfilled | expired | cancelled
└── → Offer[] (from travelers), Booking[]

Offer (a proposal — polymorphic, references Trip OR Request)
├── tripId? | requestId?   → exactly one must be set
├── userId                 → person making the offer
├── offeredWeight, offeredPrice, message?
├── status: pending | accepted | rejected | expired | withdrawn
└── → Booking? (on acceptance), Message[]
```

### Proposed Prisma Schema

```prisma
// ==========================================
// Trips (Supply Side — Travelers)
// ==========================================

model Trip {
  id              String   @id @default(cuid())
  posterId        String
  departureCity   String
  departureCode   String?
  arrivalCity     String
  arrivalCode     String?
  departureDate   DateTime
  transportType   String   @default("flight") // flight, car, bus, train
  flightNumber    String?                     // only for air travel
  availableWeight Decimal  @db.Decimal(5, 2)
  remainingWeight Decimal  @db.Decimal(5, 2)  // derived; see "Weight Tracking" section
  suggestedPrice  Decimal? @db.Decimal(8, 2)  // per kg hint, optional
  currency        String   @default("SAR")
  preferences     Json?                       // { acceptsFragile, acceptsElectronics, ... }
  notes           String?
  status          String   @default("active") // active, full, completed, cancelled
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  poster   User      @relation("UserTrips", fields: [posterId], references: [id])
  offers   Offer[]
  bookings Booking[]

  @@index([departureCity, arrivalCity, departureDate])
  @@index([posterId])
  @@index([status, departureDate])
  @@map("trips")
}

// ==========================================
// Requests (Demand Side — Senders)
// ==========================================

model Request {
  id             String   @id @default(cuid())
  posterId       String
  departureCity  String
  departureCode  String?
  arrivalCity    String
  arrivalCode    String?
  neededByDate   DateTime
  weight         Decimal  @db.Decimal(5, 2)  // how much they need carried
  budget         Decimal? @db.Decimal(8, 2)  // max they'll pay, optional
  currency       String   @default("SAR")
  description    String?                     // what they need carried
  itemTypes      Json?                       // { electronics: true, documents: true, ... }
  status         String   @default("active") // active, fulfilled, expired, cancelled
  prohibitedItemsDeclared Boolean @default(false) // see "Safety" section
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  poster   User    @relation("UserRequests", fields: [posterId], references: [id])
  offers   Offer[]
  booking  Booking?

  @@index([departureCity, arrivalCity, neededByDate])
  @@index([posterId])
  @@index([status, neededByDate])
  @@map("requests")
}

// ==========================================
// Offers (Polymorphic — on Trip OR Request)
// ==========================================

model Offer {
  id            String   @id @default(cuid())
  tripId        String?                      // set if offer is on a trip
  requestId     String?                      // set if offer is on a request
  userId        String                       // person making the offer
  offeredWeight Decimal  @db.Decimal(5, 2)
  offeredPrice  Decimal  @db.Decimal(8, 2)
  currency      String   @default("SAR")
  message       String?
  status        String   @default("pending") // pending, accepted, rejected, expired, withdrawn
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  trip     Trip?     @relation(fields: [tripId], references: [id])
  request  Request?  @relation(fields: [requestId], references: [id])
  user     User      @relation("UserOffers", fields: [userId], references: [id])
  booking  Booking?
  messages Message[]

  // NOTE: No @@unique constraint. "One active pending offer per user per trip/request"
  // is enforced in application logic (OffersService) to allow re-offers after rejection.
  @@index([tripId, status])
  @@index([requestId, status])
  @@index([userId])
  @@map("offers")
}
```

### Booking Model Update

```prisma
model Booking {
  id              String    @id @default(cuid())
  offerId         String    @unique
  tripId          String?               // set for trip-based bookings
  requestId       String?               // set for request-based bookings
  senderId        String
  carrierId       String
  status          String    @default("pending")
  totalWeight     Decimal   @db.Decimal(5, 2)
  totalPrice      Decimal   @db.Decimal(10, 2)
  currency        String    @default("SAR")
  paymentProofUrl String?
  paymentStatus   String    @default("unpaid")
  cancelledBy     String?
  cancelledAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  offer    Offer    @relation(fields: [offerId], references: [id])
  trip     Trip?    @relation(fields: [tripId], references: [id])
  request  Request? @relation(fields: [requestId], references: [id])
  sender   User     @relation("SenderBookings", fields: [senderId], references: [id])
  carrier  User     @relation("CarrierBookings", fields: [carrierId], references: [id])
  items    Item[]
  messages Message[]
  review   Review?
  dispute  Dispute?

  @@index([senderId])
  @@index([carrierId])
  @@index([tripId])
  @@index([requestId])
  @@map("bookings")
}
```

### Message Model Update (Pre-Booking Chat)

```prisma
model Message {
  id        String   @id @default(cuid())
  bookingId String?  // for post-acceptance chat
  offerId   String?  // for pre-booking negotiation chat
  senderId  String
  content   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  booking Booking? @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  offer   Offer?   @relation(fields: [offerId], references: [id], onDelete: Cascade)
  sender  User     @relation(fields: [senderId], references: [id])

  // CONSTRAINT: At least one of bookingId or offerId must be set.
  // Enforced in MessagesService — Prisma does not support CHECK constraints.
  @@index([bookingId, createdAt])
  @@index([offerId, createdAt])
  @@map("messages")
}
```

### User Model Updates

```prisma
model User {
  // ... existing fields ...

  trips           Trip[]    @relation("UserTrips")       // trips they posted
  requests        Request[] @relation("UserRequests")    // requests they posted
  offers          Offer[]   @relation("UserOffers")      // offers they made
  senderBookings  Booking[] @relation("SenderBookings")
  carrierBookings Booking[] @relation("CarrierBookings")

  // REMOVED: carrierListings Listing[] @relation("CarrierListings")
}
```

### Weight Tracking Strategy

`remainingWeight` on Trip is a **stored denormalized value** (not computed on read) for performance in search queries. It MUST be updated atomically within the same transaction as offer acceptance or booking cancellation.

**Consistency safeguard**: A daily reconciliation cron job compares `remainingWeight` against `availableWeight - SUM(accepted offer weights)` and logs any drift as an error metric. This catches bugs without sacrificing query performance.

---

## State Machines

### Trip Status

```
active ──→ full           (remainingWeight reaches 0)
  │          │
  │          ↓
  │       active           (capacity freed if booking cancelled)
  │
  ├──→ completed           (departureDate passed + all bookings delivered)
  └──→ cancelled           (poster cancels → all pending offers auto-rejected)
```

### Request Status

```
active ──→ fulfilled       (offer accepted → booking created)
  │
  ├──→ expired             (neededByDate passed while still active)
  └──→ cancelled           (poster cancels → all pending offers auto-rejected)
```

### Offer Status

```
pending ──→ accepted ──→ Booking auto-created
  │
  ├──→ rejected            (poster declines)
  ├──→ expired             (trip departureDate or request neededByDate passed)
  └──→ withdrawn           (offer maker cancels)
```

### Booking Status (unchanged from current)

```
pending → accepted → picked_up → in_transit → delivered
  │          │
  └──→ cancelled ←──┘
```

---

## Concrete Scenarios

### Scenario 1: Sender Makes Offer on Trip — Happy Path

```
Given: Ahmed posts trip JED→RUH (car) on March 15, 10kg available, suggested 8 SAR/kg
 When: Sara submits offer (5kg, 50 SAR total, message: "Perfume set for my sister")
 Then: Offer created (status: pending, tripId: Ahmed's trip)
  And: Ahmed receives push notification: "New offer on your JED→RUH trip"
  And: Trip remainingWeight stays at 10kg (unchanged until acceptance)

 When: Ahmed and Sara chat via the offer's message thread
  And: Ahmed accepts Sara's offer
 Then: Offer status → accepted
  And: Booking auto-created (sender: Sara, carrier: Ahmed, weight: 5kg, price: 50 SAR)
  And: Trip remainingWeight → 5kg
  And: Sara receives notification: "Your offer was accepted! Booking created."
```

### Scenario 2: Traveler Makes Offer on Request — Happy Path

```
Given: Fatima posts request "Need 3kg carried JED→RUH by March 20, budget 40 SAR"
  And: Fatima checked the prohibited items declaration
 When: Mohammed submits offer (3kg, 35 SAR, message: "I'm driving that route on March 18")
 Then: Offer created (status: pending, requestId: Fatima's request)
  And: Fatima receives push notification: "New offer on your delivery request"

 When: Fatima accepts Mohammed's offer
 Then: Offer status → accepted
  And: Booking auto-created (sender: Fatima, carrier: Mohammed, weight: 3kg, price: 35 SAR)
  And: Request status → fulfilled
  And: Other pending offers on this request → auto-rejected
  And: Mohammed receives notification: "Your offer was accepted! Booking created."
```

### Scenario 3: Offer Rejected, Sender Re-Offers

```
Given: Ahmed's trip has a pending offer from Sara (5kg, 20 SAR)
 When: Ahmed rejects the offer
 Then: Offer status → rejected
  And: Sara receives notification: "Your offer was not accepted"

 When: Sara submits a new offer (5kg, 40 SAR, message: "Revised price")
 Then: New Offer row created (status: pending)
  And: No @@unique conflict because constraint is enforced in app logic
       (only one PENDING offer per user per trip allowed)
```

### Scenario 4: Capacity Overflow — Cascading Rejection

```
Given: Ahmed's trip has 10kg remaining
  And: Offer A from Sara (7kg, 70 SAR) — pending
  And: Offer B from Khalid (6kg, 60 SAR) — pending
 When: Ahmed accepts Offer A (7kg)
 Then: Transaction executes:
       1. Lock Trip row
       2. Validate 10kg >= 7kg ✓
       3. remainingWeight → 3kg
       4. Create Booking for Sara
       5. Offer A status → accepted
       6. Auto-reject offers where offeredWeight > 3kg
  And: Offer B auto-rejected (6kg > 3kg remaining)
  And: Khalid receives notification: "Your offer was rejected — insufficient capacity"
```

### Scenario 5: Trip Cancelled with Active Bookings

```
Given: Ahmed's trip has 1 accepted offer with an active booking (status: accepted)
  And: 2 pending offers
 When: Ahmed cancels his trip
 Then: Trip status → cancelled
  And: Pending offers → rejected (with notifications)
  And: Active booking → cancelled (cancelledBy: Ahmed)
  And: Sender receives notification: "Trip cancelled — your booking has been cancelled"
  And: If payment was confirmed → refund process triggered
```

### Scenario 6: Offer Expiry

```
Given: Ahmed's trip departs March 15
  And: Sara's offer is still pending on March 16
 When: Expiry cron job runs daily at 02:00 UTC
 Then: Sara's offer status → expired
  And: Sara receives notification: "Your offer expired — trip has departed"
```

### Scenario 7: Pre-Booking Chat → Post-Booking Chat Continuity

```
Given: Sara submitted an offer on Ahmed's trip
 When: Ahmed opens the offer detail
 Then: Chat thread is available (messages linked to offerId)
  And: Ahmed asks: "Is the perfume set in original packaging?"
  And: Sara replies within the same thread

 When: Ahmed accepts the offer
 Then: Booking created
  And: New messages now link to bookingId (offer messages stay linked to offerId)
  And: Chat UI shows continuous thread (offer + booking messages merged by timestamp)
```

### Scenario 8: Prohibited Items Declaration on Request

```
Given: Fatima wants to post a delivery request
 When: She fills in route, date, weight, description
 Then: She MUST check "I declare this shipment contains no prohibited items" checkbox
  And: The checkbox is required — form cannot submit without it
  And: prohibitedItemsDeclared is stored as true on the Request

Given: Fatima tries to submit without checking the declaration
 Then: Validation error: "You must declare that your shipment contains no prohibited items"
```

### Scenario 9: Race Condition — Two Simultaneous Acceptances

```
Given: Ahmed's trip has 5kg remaining
  And: Offer A (3kg) and Offer B (4kg) are both pending
 When: Ahmed accepts Offer A AND Offer B at nearly the same time

 Then: Transaction for Offer A starts first:
       1. Locks Trip row
       2. Validates 5kg >= 3kg ✓
       3. remainingWeight → 2kg
       4. Creates Booking A
       Commits.

  And: Transaction for Offer B starts:
       1. Locks Trip row (waits for A to commit)
       2. Validates 2kg >= 4kg ✗ — FAILS
       3. Returns error: "Insufficient capacity — only 2kg remaining"
       Rolls back.

  And: Ahmed sees error for Offer B and can choose to reject it or wait
```

---

## Safety & Compliance

### Prohibited Items

Users must acknowledge prohibited items restrictions. This is a **legal requirement** for Saudi Arabia and international transport.

**For Requests**: `prohibitedItemsDeclared` boolean — required `true` before submission.

**For Trip Preferences**: `preferences.prohibitedItems` lists what is NOT accepted.

**Prohibited Items List** (displayed in app, i18n required):
- Flammable materials and explosives
- Narcotics and controlled substances
- Weapons and ammunition
- Perishable food items (without proper packaging declaration)
- Items violating Saudi customs regulations
- Live animals

**Liability**: LuggageShare is a marketplace platform, not a shipping carrier. Users are responsible for compliance with local laws. Terms of Service must include liability disclaimer. The declaration checkbox creates a legal record.

### Item Declaration Flow

Every booking (whether from Trip offer or Request offer) requires item declaration:
- Item name, description, weight, declared value
- Image upload (existing `Item.imageUrls` field)
- The existing `Item` model handles this — no schema changes needed

---

## API Endpoints

### Trips Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/trips` | Yes | Post a new trip |
| `GET` | `/api/v1/trips` | No | Search trips (from, to, date, minWeight, transportType) |
| `GET` | `/api/v1/trips/:id` | No | Trip detail (poster profile, offer count) |
| `PATCH` | `/api/v1/trips/:id` | Yes | Update trip (poster only, no accepted offers) |
| `PATCH` | `/api/v1/trips/:id/cancel` | Yes | Cancel trip (poster, cascades) |
| `GET` | `/api/v1/trips/my` | Yes | My posted trips with offer counts |

### Requests Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/requests` | Yes | Post a sender request |
| `GET` | `/api/v1/requests` | No | Search requests (from, to, date, maxWeight) |
| `GET` | `/api/v1/requests/:id` | No | Request detail (poster profile, offer count) |
| `PATCH` | `/api/v1/requests/:id` | Yes | Update request (poster only, no accepted offers) |
| `PATCH` | `/api/v1/requests/:id/cancel` | Yes | Cancel request (poster, cascades) |
| `GET` | `/api/v1/requests/my` | Yes | My posted requests with offer counts |

### Offers Module (Shared for Trips and Requests)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/trips/:tripId/offers` | Yes | Sender offers on a trip |
| `POST` | `/api/v1/requests/:requestId/offers` | Yes | Traveler offers on a request |
| `GET` | `/api/v1/trips/:tripId/offers` | Yes | List offers on trip (poster only) |
| `GET` | `/api/v1/requests/:requestId/offers` | Yes | List offers on request (poster only) |
| `GET` | `/api/v1/offers/my` | Yes | My submitted offers (all types) |
| `PATCH` | `/api/v1/offers/:id/accept` | Yes | Accept → creates Booking (poster, transactional) |
| `PATCH` | `/api/v1/offers/:id/reject` | Yes | Reject (poster only) |
| `PATCH` | `/api/v1/offers/:id/withdraw` | Yes | Withdraw (offer maker, pending only) |

---

## Real-Time WebSocket Events

The existing Socket.IO gateway (`/chat` namespace) is extended for real-time updates.

### New Events

| Event | Emitted When | Payload | Recipients |
|-------|-------------|---------|------------|
| `offer:new` | New offer submitted | `{ offerId, tripId?, requestId?, weight, price }` | Trip/Request poster |
| `offer:accepted` | Offer accepted | `{ offerId, bookingId }` | Offer maker |
| `offer:rejected` | Offer rejected | `{ offerId, reason? }` | Offer maker |
| `offer:expired` | Offer expired by cron | `{ offerId }` | Offer maker |
| `offer:auto_rejected` | Cascading rejection | `{ offerId, reason: 'insufficient_capacity' }` | Offer maker |
| `trip:updated` | Trip remainingWeight changes | `{ tripId, remainingWeight, status }` | All users viewing trip detail |
| `trip:cancelled` | Trip cancelled | `{ tripId }` | All offer makers on that trip |
| `request:fulfilled` | Request fulfilled | `{ requestId }` | All offer makers on that request |

### Room Strategy

- `trip:{tripId}` — joined by anyone viewing trip detail (for live remainingWeight)
- `offer:{offerId}` — joined by both parties (for chat + status updates)
- `user:{userId}` — joined by authenticated user (for personal notifications)

---

## Mobile Screens Impact

| Current Route | Change | New Route |
|---------------|--------|-----------|
| `(tabs)/` | Home shows **two tabs**: Trips feed + Requests feed | Same route, tabbed data |
| `listing/[id]` | **Trip detail** + "Make Offer" CTA | `trip/[id]` |
| `listing/create` | **Post a Trip** wizard | `trip/create` |
| — (new) | **Request detail** + "Offer to Carry" CTA | `request/[id]` |
| — (new) | **Post a Request** wizard | `request/create` |
| — (new) | **Make Offer** sheet (on trip or request detail) | `trip/[id]/offer` or `request/[id]/offer` |
| — (new) | **Offer chat** (pre-booking negotiation) | `chat/offer/[offerId]` |
| `(tabs)/trips` | Segmented: "My Trips" / "My Requests" / "My Offers" | Same route, 3 segments |
| `booking/[id]` | Unchanged — created when offer accepted | Same |
| `chat/[bookingId]` | Unchanged — post-acceptance chat | Same |

### Home Screen Layout

```
┌─────────────────────────────────┐
│  [Trips]  [Requests]            │  ← Segment control
├─────────────────────────────────┤
│  🔍 From: ___  To: ___  Date:  │  ← Search/filter bar
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │ 🚗 JED → RUH  Mar 15   │    │  ← Trip/Request card
│  │ 10kg available  ~8 SAR  │    │
│  │ Ahmed ★4.8  ✓ Verified  │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ ✈️ JED → DXB  Mar 18   │    │
│  │ 5kg available  ~12 SAR  │    │
│  │ Sara ★4.5               │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

### i18n Keys Required

All new UI strings must have `en` and `ar` translations:
- Trip posting wizard: titles, labels, placeholders, validation messages
- Request posting wizard: titles, labels, description, budget fields
- Offer submission: form labels, confirmation dialogs
- Transport type labels: flight, car, bus, train
- Prohibited items declaration text and checkbox label
- Notification messages: 10+ new notification templates
- Status labels: trip statuses, request statuses, offer statuses
- Tab labels: "Trips", "Requests", "My Trips", "My Requests", "My Offers"
- Home segment labels, search filter labels

---

## Business Rules

### Core Rules

1. **Cannot offer on own post** — poster cannot submit offers on their own trip/request
2. **One pending offer per user per post** — enforced in `OffersService` (application logic, not DB constraint). After rejection/withdrawal/expiry, user can submit a new offer
3. **Weight validation (Trips)** — `offer.offeredWeight` must be ≤ `trip.remainingWeight` at submission AND at acceptance
4. **Weight validation (Requests)** — `offer.offeredWeight` must match `request.weight` (traveler carries exactly what sender needs)
5. **Minimum lead time** — offers cannot be submitted less than 24 hours before trip `departureDate` or request `neededByDate`
6. **Post update restrictions** — trip/request details cannot be modified once any offer has been accepted

### Transactional Acceptance (Trip Offers)

Offer acceptance on trips MUST run inside `$transaction` with row-level locking:
1. Lock Trip row (`SELECT ... FOR UPDATE` via raw query or Prisma interactive transaction)
2. Re-validate `remainingWeight >= offeredWeight`
3. Update `remainingWeight -= offeredWeight`
4. Create Booking (sender = offer.userId, carrier = trip.posterId)
5. Update offer status → accepted
6. Auto-reject pending offers where `offeredWeight > new remainingWeight`
7. If `remainingWeight === 0`, set trip status → `full`

### Transactional Acceptance (Request Offers)

Simpler — requests are one-to-one:
1. Validate request status is `active`
2. Create Booking (sender = request.posterId, carrier = offer.userId)
3. Update offer status → accepted
4. Update request status → fulfilled
5. Auto-reject all other pending offers on this request

### Auto-Status Rules

- Trip becomes `full` when `remainingWeight` reaches 0
- Trip reverts to `active` if a booking is cancelled and weight is freed
- Request becomes `fulfilled` when any offer is accepted (one booking per request)
- Request reverts to `active` if the booking is cancelled

### Expiry & Cron

- Daily cron at 02:00 UTC
- Expire pending offers on trips past `departureDate`
- Expire pending offers on requests past `neededByDate`
- Expire active requests past `neededByDate` (status → expired)
- Weight reconciliation: compare `remainingWeight` vs computed value, log drift

### Cancellation Cascading

- **Trip cancelled** → all pending offers rejected, all active bookings cancelled, notifications sent
- **Request cancelled** → all pending offers rejected, active booking cancelled (if exists), notifications sent
- **Booking cancelled** → if trip-based: `remainingWeight` increased, trip status re-evaluated. If request-based: request status → active

### Notification Triggers

| Event | Push To | Message |
|-------|---------|---------|
| New offer on trip | Trip poster | "New offer on your {from}→{to} trip" |
| New offer on request | Request poster | "New offer on your delivery request" |
| Offer accepted | Offer maker | "Your offer was accepted! Booking created." |
| Offer rejected | Offer maker | "Your offer was not accepted" |
| Offer auto-rejected | Offer maker | "Your offer was rejected — insufficient capacity" |
| Offer expired | Offer maker | "Your offer expired — trip/request has passed" |
| Trip cancelled | All offer makers | "Trip cancelled by poster" |
| Request cancelled | All offer makers | "Request cancelled by poster" |
| Booking cancelled | Both parties | "Booking cancelled" |
| New chat message (offer) | Recipient | "New message from {name}" |

---

## Migration Strategy

### Phase 1: Schema Migration (with rollback plan)

1. Create `trips` table
2. Create `requests` table
3. Update `offers` table — add `tripId`, `requestId` columns (nullable)
4. Add `tripId`, `requestId` nullable columns to `bookings`
5. Add `offerId` nullable column to `messages`
6. Migrate data:
   - Each `Listing` row → `Trip` row (carrierId → posterId, transportType: 'flight')
   - Each `Booking` row → create corresponding `Offer` row (status: accepted, tripId set) + set booking.offerId and booking.tripId
   - Set message.offerId for messages linked to migrated bookings
7. After validation: make `offerId` non-nullable on bookings
8. Drop `listingId` from bookings
9. Drop `listings` table

**Rollback**: Steps 7-9 are destructive. Keep `listings` table and `listingId` column for 2 weeks after go-live. If issues arise, revert by reading from old columns.

### Phase 2: API Migration

1. Build `TripsModule`, `RequestsModule`, `OffersModule`
2. Register in [app.module.ts](apps/api/src/app.module.ts)
3. Move booking creation logic into `OffersService.accept()`
4. Update `MessagesService` — support `offerId` for pre-booking chat
5. Update `MessagesGateway` — new WebSocket events + room strategy
6. Add cron job for offer/request expiry + weight reconciliation
7. Deprecate `ListingsModule` — 301 redirect proxy for 2 weeks
8. Update Swagger docs

### Phase 3: Mobile Migration

1. Update home screen: tabbed Trips + Requests feeds
2. Build `trip/[id]` and `request/[id]` detail screens
3. Build trip and request creation wizards
4. Add offer submission modals
5. Add offer chat screen (`chat/offer/[offerId]`)
6. Update `(tabs)/trips` to 3-segment view (My Trips / My Requests / My Offers)
7. Update all i18n files (en.json, ar.json)
8. Update React Query hooks (`useTrips`, `useRequests`, `useOffers`) and Zustand stores
9. Add WebSocket listeners for real-time offer/trip/request events

---

## Open Questions

- [ ] Should trips support **multiple accepted offers** (partial capacity fills)?
  - Current spec: YES (remainingWeight decreases per acceptance)
  - Alternative: one offer per trip, simpler but less flexible
- [ ] **Platform fee**: percentage or flat fee on accepted offers? Deducted from carrier payout?
- [ ] Should posters see **offer maker verification status and ratings** before accepting?
- [ ] **Escrow**: hold payment until delivery confirmed, or direct sender→carrier payment?
- [ ] When a booking is cancelled after payment, what's the **refund policy**?
- [ ] Should requests be limited to **one accepted offer** (current spec) or allow partial fulfillment from multiple travelers?

---

## Post-MVP Roadmap

| Feature | Description | Blocked By |
|---------|-------------|------------|
| Carrier-to-carrier offers | Capacity pooling, subcontracting | Business model validation |
| Instant Book | Fast path at suggested price, skip negotiation | User feedback on friction |
| Cancellation penalties | Tiered fees based on timing | Real cancellation data |
| Price suggestions | ML-based price recommendations per route | Historical transaction data |
| Insurance integration | Optional item insurance for high-value shipments | Partner negotiation |
| Round trips | Post outbound + return trip as a pair | UX research |
| Traveler verification | Boarding pass / ticket upload to prove trip | Trust & safety roadmap |
