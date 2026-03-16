# Feature: Flights & Offers (Core Business Model Refactor)

> **Status**: Design (Panel-Reviewed)
> **Date**: 2026-03-04
> **Impact**: HIGH — refactors `Listing` → `Flight` + `Offer`
> **Panel Review**: Wiegers, Fowler, Adzic, Nygard, Cockburn — 2026-03-04

---

## Business Model

LuggageShare is a **two-sided marketplace** where travelers monetize their spare luggage capacity.

**The core loop:**
1. A traveler posts their **Flight** (route + date + available capacity)
2. **Senders** browse flights and submit **Offers** (price + weight + items)
3. Sender and poster **negotiate via chat**, then the poster **accepts or rejects**
4. Once accepted, a **Booking** is auto-created and proceeds through the delivery lifecycle

### User Flows (MVP)

| Flow | Actor | Action | Result |
|------|-------|--------|--------|
| **Post Flight** | Traveler with spare capacity | Posts flight details (JED→RUH, March 15, 10kg free) | Receives offers from senders |
| **Make Offer** | Sender who needs luggage carried | Browses flights, submits an offer (5kg, 50 SAR) | Poster notified, negotiation begins via chat |

> **Deferred (post-MVP)**: Carrier-to-carrier offers (capacity pooling, subcontracting). The sender→poster flow is the MVP scope. Carrier offers add significant complexity with unclear value proposition — will revisit once sender flow is validated.

### Pricing & Negotiation

- Flight poster sets a **suggested price** (optional, per kg)
- Sender proposes their **own price + weight** in the offer
- **Negotiation happens via chat** — no structured counter-offer mechanism
- Once terms are agreed in chat, poster **accepts** the offer → Booking created
- Poster can **reject** outright without negotiation

---

## Data Model

### Current Model (Being Replaced)

```
Listing (conflates flight + offer into one entity)
├── carrierId, departureCity, arrivalCity, departureDate
├── flightNumber, availableWeight, price, currency
├── preferences, notes, status
└── → Booking[] (sender books a listing)
```

### New Model

```
Flight (the trip itself — posted by a traveler)
├── posterId         → User who posted the flight
├── departureCity, departureCode
├── arrivalCity, arrivalCode
├── departureDate
├── flightNumber?
├── availableWeight  → total spare capacity (kg)
├── remainingWeight  → decreases as offers are accepted
├── suggestedPrice?  → optional price per kg hint
├── currency
├── preferences      → JSON (acceptsFragile, electronics, etc.)
├── notes
├── status           → 'active' | 'full' | 'completed' | 'cancelled'
└── → Offer[], Booking[]

Offer (a sender's proposal on a flight)
├── flightId         → Flight this offer is for
├── senderId         → Sender making the offer
├── offeredWeight    → kg they want carried
├── offeredPrice     → their proposed total price
├── currency
├── message?         → initial note to poster
├── status           → 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'
└── → Booking? (created on acceptance), Message[]
```

### Proposed Prisma Schema

```prisma
model Flight {
  id              String   @id @default(cuid())
  posterId        String
  departureCity   String
  departureCode   String?
  arrivalCity     String
  arrivalCode     String?
  departureDate   DateTime
  flightNumber    String?
  availableWeight Decimal  @db.Decimal(5, 2)
  remainingWeight Decimal  @db.Decimal(5, 2)
  suggestedPrice  Decimal? @db.Decimal(8, 2)  // per kg hint
  currency        String   @default("SAR")
  preferences     Json?
  notes           String?
  status          String   @default("active") // active, full, completed, cancelled
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  poster   User      @relation("UserFlights", fields: [posterId], references: [id])
  offers   Offer[]
  bookings Booking[]

  @@index([departureCity, arrivalCity, departureDate])
  @@index([posterId])
  @@index([status, departureDate])
  @@map("flights")
}

model Offer {
  id            String   @id @default(cuid())
  flightId      String
  senderId      String
  offeredWeight Decimal  @db.Decimal(5, 2)
  offeredPrice  Decimal  @db.Decimal(8, 2)
  currency      String   @default("SAR")
  message       String?
  status        String   @default("pending") // pending, accepted, rejected, expired, withdrawn
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  flight   Flight    @relation(fields: [flightId], references: [id])
  sender   User      @relation("UserOffers", fields: [senderId], references: [id])
  booking  Booking?
  messages Message[]

  @@unique([flightId, senderId]) // one active offer per sender per flight
  @@index([flightId, status])
  @@index([senderId])
  @@map("offers")
}
```

### Booking Model Update

```prisma
model Booking {
  id              String    @id @default(cuid())
  offerId         String    @unique
  flightId        String
  senderId        String
  carrierId       String    // always the flight poster
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
  flight   Flight   @relation(fields: [flightId], references: [id])
  sender   User     @relation("SenderBookings", fields: [senderId], references: [id])
  carrier  User     @relation("CarrierBookings", fields: [carrierId], references: [id])
  items    Item[]
  messages Message[]
  review   Review?
  dispute  Dispute?

  @@index([senderId])
  @@index([carrierId])
  @@index([flightId])
  @@map("bookings")
}
```

### Message Model Update (Pre-Booking Chat)

```prisma
model Message {
  id        String   @id @default(cuid())
  bookingId String?  // nullable — messages can exist before booking
  offerId   String?  // new — for pre-booking negotiation chat
  senderId  String
  content   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  booking Booking? @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  offer   Offer?   @relation(fields: [offerId], references: [id], onDelete: Cascade)
  sender  User     @relation(fields: [senderId], references: [id])

  @@index([bookingId, createdAt])
  @@index([offerId, createdAt])
  @@map("messages")
}
```

### User Model Updates

```prisma
model User {
  // ... existing fields ...

  flights         Flight[]  @relation("UserFlights")     // flights they posted
  offers          Offer[]   @relation("UserOffers")       // offers they made
  senderBookings  Booking[] @relation("SenderBookings")
  carrierBookings Booking[] @relation("CarrierBookings")

  // REMOVED: carrierListings Listing[] @relation("CarrierListings")
}
```

---

## State Machines

### Flight Status

```
active ──→ full           (remainingWeight reaches 0)
  │          │
  │          ↓
  │       active           (capacity freed if booking cancelled)
  │
  ├──→ completed           (departure date passed + all bookings delivered)
  └──→ cancelled           (poster cancels → all pending offers auto-rejected)
```

### Offer Status

```
pending ──→ accepted ──→ Booking auto-created
  │
  ├──→ rejected            (poster declines)
  ├──→ expired             (departureDate passed while still pending)
  └──→ withdrawn           (sender cancels their offer)
```

### Booking Status (unchanged from current)

```
pending → accepted → picked_up → in_transit → delivered
  │          │
  └──→ cancelled ←──┘
```

---

## Concrete Scenarios

### Scenario 1: Happy Path — Sender Makes Offer, Poster Accepts

```
Given: Ahmed posts flight JED→RUH on March 15, 10kg available, suggested 80 SAR/kg
 When: Sara submits offer (5kg, 50 SAR total, message: "Perfume set for my sister")
 Then: Offer created (status: pending)
  And: Ahmed receives push notification: "New offer on your JED→RUH flight"
  And: Flight remainingWeight stays at 10kg (unchanged until acceptance)

 When: Ahmed and Sara chat via the offer's message thread
  And: Ahmed accepts Sara's offer
 Then: Offer status → accepted
  And: Booking auto-created (sender: Sara, carrier: Ahmed, weight: 5kg, price: 50 SAR)
  And: Flight remainingWeight → 5kg
  And: Sara receives notification: "Your offer was accepted! Booking created."
```

### Scenario 2: Poster Rejects Offer

```
Given: Ahmed's flight JED→RUH has a pending offer from Sara (5kg, 20 SAR)
 When: Ahmed rejects the offer
 Then: Offer status → rejected
  And: Sara receives notification: "Your offer was not accepted"
  And: Flight remainingWeight unchanged
  And: Sara can submit a new offer (@@unique constraint allows after rejection)
```

### Scenario 3: Capacity Overflow — Cascading Rejection

```
Given: Ahmed's flight has 10kg remaining
  And: Offer A from Sara (7kg, 70 SAR) — pending
  And: Offer B from Khalid (6kg, 60 SAR) — pending
 When: Ahmed accepts Offer A (7kg)
 Then: remainingWeight → 3kg
  And: Offer B auto-rejected (6kg > 3kg remaining)
  And: Khalid receives notification: "Your offer was rejected — insufficient capacity"
```

### Scenario 4: Flight Cancelled with Pending Offers

```
Given: Ahmed's flight has 3 pending offers
 When: Ahmed cancels his flight
 Then: Flight status → cancelled
  And: All pending offers → rejected
  And: All offer makers receive notification: "Flight cancelled by poster"
```

### Scenario 5: Flight Cancelled with Active Bookings

```
Given: Ahmed's flight has 1 accepted offer with an active booking (status: accepted)
  And: 2 pending offers
 When: Ahmed cancels his flight
 Then: Flight status → cancelled
  And: Pending offers → rejected
  And: Active booking → cancelled (cancelledBy: Ahmed)
  And: Sender receives notification: "Flight cancelled — your booking has been cancelled"
  And: If payment was confirmed → refund process triggered
```

### Scenario 6: Offer Expiry

```
Given: Ahmed's flight departs March 15
  And: Sara's offer is still pending on March 16
 When: Expiry cron job runs daily
 Then: Sara's offer status → expired
  And: Sara receives notification: "Your offer expired — flight has departed"
```

### Scenario 7: Pre-Booking Chat

```
Given: Sara submitted an offer on Ahmed's flight
 When: Ahmed opens the offer detail
 Then: Chat thread is available (linked to offerId, no bookingId yet)
  And: Ahmed can ask: "Is the perfume set in original packaging?"
  And: Sara can reply within the same thread
 When: Ahmed accepts the offer and booking is created
 Then: Chat thread migrates — new messages link to bookingId
  And: Existing offer messages remain accessible in the thread history
```

---

## API Endpoints

### Flights Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/flights` | Yes | Post a new flight |
| `GET` | `/api/v1/flights` | No | Search flights (from, to, date, minWeight filters) |
| `GET` | `/api/v1/flights/:id` | No | Flight detail (includes poster profile, offer count) |
| `PATCH` | `/api/v1/flights/:id` | Yes | Update flight (poster only, only if no accepted offers) |
| `PATCH` | `/api/v1/flights/:id/cancel` | Yes | Cancel flight (poster only, cascades to offers/bookings) |
| `GET` | `/api/v1/flights/my` | Yes | My posted flights with offer counts |

### Offers Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/flights/:flightId/offers` | Yes | Submit offer (sender only) |
| `GET` | `/api/v1/flights/:flightId/offers` | Yes | List offers on a flight (poster only) |
| `GET` | `/api/v1/offers/my` | Yes | My submitted offers across all flights |
| `PATCH` | `/api/v1/offers/:id/accept` | Yes | Accept offer → creates Booking (poster only, transactional) |
| `PATCH` | `/api/v1/offers/:id/reject` | Yes | Reject offer (poster only) |
| `PATCH` | `/api/v1/offers/:id/withdraw` | Yes | Withdraw offer (sender only, only if pending) |

---

## Mobile Screens Impact

| Current Route | Change | New Route |
|---------------|--------|-----------|
| `(tabs)/` | Home shows **Flights** feed | Same route, data source changes |
| `listing/[id]` | **Flight detail** + offer count + "Make Offer" CTA | `flight/[id]` |
| `listing/create` | **Post a Flight** wizard | `flight/create` |
| — (new) | **Make Offer** sheet on flight detail | `flight/[id]/offer` |
| — (new) | **Offer chat** (pre-booking negotiation) | `chat/offer/[offerId]` |
| `(tabs)/trips` | Shows "My Flights" + "My Offers" tabs | Same route, segmented |
| `booking/[id]` | Unchanged — created when offer accepted | Same |
| `chat/[bookingId]` | Unchanged — post-acceptance chat | Same |

### i18n Keys Required

All new UI strings must have `en` and `ar` translations:
- Flight posting wizard: titles, labels, placeholders, validation messages
- Offer submission: form labels, confirmation dialogs
- Notification messages: 7 new notification templates (see Business Rules)
- Status labels: flight statuses, offer statuses
- Tab labels: "My Flights", "My Offers"

---

## Business Rules

1. **Cannot offer on own flight** — poster cannot submit offers to themselves
2. **One active offer per sender per flight** — enforced by `@@unique([flightId, senderId])`. After rejection/withdrawal, sender can submit a new offer
3. **Weight validation** — `offer.offeredWeight` must be ≤ `flight.remainingWeight` at time of submission AND at time of acceptance
4. **Transactional acceptance** — offer acceptance MUST run inside `$transaction` with row-level locking on Flight to prevent race conditions. Steps:
   - Lock Flight row
   - Re-validate `remainingWeight >= offeredWeight`
   - Update `remainingWeight -= offeredWeight`
   - Create Booking (sender = offer.senderId, carrier = flight.posterId)
   - Update offer status → accepted
   - Auto-reject pending offers where `offeredWeight > new remainingWeight`
5. **Auto-status** — Flight becomes `full` when `remainingWeight` reaches 0; reverts to `active` if a booking is cancelled and weight is freed
6. **Offer expiry** — pending offers auto-expire when `departureDate` passes (daily cron job)
7. **Minimum lead time** — offers cannot be submitted less than 24 hours before `departureDate`
8. **Flight update restrictions** — flight details cannot be modified once any offer has been accepted
9. **Cancellation cascading**:
   - Flight cancelled → all pending offers rejected, all active bookings cancelled
   - Booking cancelled → `remainingWeight` increased, flight status re-evaluated
10. **Notification triggers**:
    - New offer on your flight → push to poster
    - Offer accepted → push to sender
    - Offer rejected → push to sender
    - Offer expired → push to sender
    - Flight cancelled → push to all offer makers
    - Booking cancelled → push to both parties
    - New chat message on offer → push to recipient

---

## Migration Strategy

### Phase 1: Schema Migration (with rollback plan)

1. Create `flights` table (new)
2. Create `offers` table (new)
3. Add `offerId` and `flightId` nullable columns to `bookings`
4. Add `offerId` nullable column to `messages`
5. Migrate data:
   - Each `Listing` row → `Flight` row (carrierId → posterId)
   - Each `Booking` row → create corresponding `Offer` row (status: accepted) + set booking.offerId and booking.flightId
   - Set message.offerId for messages linked to migrated bookings
6. After validation: make `offerId` and `flightId` non-nullable on bookings
7. Drop `listingId` column from bookings
8. Drop `listings` table

**Rollback**: Steps 6-8 are destructive. Keep `listings` table and `listingId` column for 2 weeks after migration. If issues arise, revert by reading from old columns.

### Phase 2: API Migration

1. Build `FlightsModule` and `OffersModule`
2. Add `FlightsModule` to [app.module.ts](apps/api/src/app.module.ts)
3. Update `BookingsService` — booking creation moves into `OffersService.accept()`
4. Update `MessagesService` — support `offerId` for pre-booking chat
5. Update `MessagesGateway` — WebSocket rooms for offer chats
6. Deprecate `ListingsModule` — keep as 301 redirect proxy for 2 weeks
7. Update Swagger docs

### Phase 3: Mobile Migration

1. Update home feed query: `useListings()` → `useFlights()`
2. Replace `listing/[id]` screen with `flight/[id]` screen
3. Replace listing creation wizard with flight posting wizard
4. Add offer submission modal on flight detail
5. Add offer chat screen (`chat/offer/[offerId]`)
6. Update `(tabs)/trips` to show segmented "My Flights" / "My Offers"
7. Update all i18n files (en.json, ar.json) with new keys
8. Update React Query hooks and Zustand stores

---

## Open Questions (Reduced)

- [ ] Should flights support **multiple accepted offers** (partial capacity fills from different senders)?
  - Current spec assumes YES (remainingWeight decreases per acceptance)
  - If NO, simplify to one offer per flight
- [ ] **Platform fee**: percentage or flat fee on accepted offers? Deducted from carrier payout?
- [ ] Should flight posters see **sender verification status and ratings** before accepting?
- [ ] **Escrow**: hold payment until delivery confirmed, or direct sender→carrier payment?
- [ ] When a booking is cancelled after payment, what's the **refund policy**?

---

## Post-MVP: Carrier Offers (Deferred)

Future consideration: allowing carriers to make offers on other carriers' flights. Possible models:
- **Capacity pooling**: Two travelers on the same flight combine spare luggage space
- **Subcontracting**: Carrier takes on partial load from another carrier
- Requires defining: who pays whom, commission splits, liability assignment
- Will revisit after sender→poster flow is validated in production
