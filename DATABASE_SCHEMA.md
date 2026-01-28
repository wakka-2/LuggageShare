# LuggageShare Database Schema

> **Database**: PostgreSQL (via Supabase)
> **ORM**: TypeORM (NestJS) / Prisma (alternative)

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │───┐   │  listings   │───┐   │  bookings   │
│             │   │   │             │   │   │             │
│ id          │   │   │ id          │   │   │ id          │
│ phone       │   └──▶│ carrier_id  │   └──▶│ listing_id  │
│ email       │       │ flight_id   │       │ sender_id   │
│ name        │       │ available_kg│       │ carrier_id  │
│ avatar_url  │       │ price_per_kg│       │ status      │
│ is_verified │       │ status      │       │ total_price │
└─────────────┘       └─────────────┘       └─────────────┘
       │                    │                     │
       │              ┌─────┴─────┐               │
       │              ▼           ▼               │
       │        ┌─────────┐ ┌─────────┐          │
       │        │ flights │ │  items  │          │
       │        └─────────┘ └─────────┘          │
       │                                          │
       ▼                                          ▼
┌─────────────┐                          ┌─────────────┐
│  messages   │                          │  reviews    │
│             │                          │             │
│ sender_id   │                          │ booking_id  │
│ receiver_id │                          │ reviewer_id │
│ content     │                          │ rating      │
└─────────────┘                          └─────────────┘
```

---

## Core Tables

### 1. Users

```sql
CREATE TABLE users (
    -- Primary Key
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Authentication
    phone           VARCHAR(20) UNIQUE,
    phone_verified  BOOLEAN DEFAULT FALSE,
    email           VARCHAR(255) UNIQUE,
    email_verified  BOOLEAN DEFAULT FALSE,
    password_hash   VARCHAR(255),  -- NULL if social auth only

    -- Profile
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    display_name    VARCHAR(100),
    avatar_url      TEXT,
    bio             TEXT,

    -- Location
    country_code    CHAR(2) DEFAULT 'SA',  -- ISO country code
    city            VARCHAR(100),
    preferred_language VARCHAR(5) DEFAULT 'ar',  -- 'ar' or 'en'

    -- Verification
    is_verified     BOOLEAN DEFAULT FALSE,
    verification_level INTEGER DEFAULT 0,  -- 0=none, 1=phone, 2=ID, 3=full
    id_document_url TEXT,  -- Encrypted/private storage
    id_verified_at  TIMESTAMP,

    -- Stats (denormalized for performance)
    total_trips_as_carrier  INTEGER DEFAULT 0,
    total_trips_as_sender   INTEGER DEFAULT 0,
    avg_rating_as_carrier   DECIMAL(2,1) DEFAULT 0,
    avg_rating_as_sender    DECIMAL(2,1) DEFAULT 0,
    total_reviews_received  INTEGER DEFAULT 0,

    -- Credit Balance System (Commission tracking)
    balance                 DECIMAL(10,2) DEFAULT 0,  -- Negative = owes platform
    balance_threshold       DECIMAL(10,2) DEFAULT -10, -- Restriction threshold (SAR)
    is_balance_restricted   BOOLEAN DEFAULT FALSE,    -- TRUE when balance < threshold
    last_balance_update     TIMESTAMP,

    -- Settings
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    sms_notifications_enabled BOOLEAN DEFAULT TRUE,

    -- Status
    is_active       BOOLEAN DEFAULT TRUE,
    is_banned       BOOLEAN DEFAULT FALSE,
    ban_reason      TEXT,
    banned_at       TIMESTAMP,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    last_login_at   TIMESTAMP,
    deleted_at      TIMESTAMP  -- Soft delete
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_country ON users(country_code);
CREATE INDEX idx_users_verified ON users(is_verified) WHERE is_verified = TRUE;
```

### 2. User Auth Sessions

```sql
CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Token
    refresh_token   VARCHAR(500) UNIQUE NOT NULL,

    -- Device Info
    device_type     VARCHAR(20),  -- 'ios', 'android', 'web'
    device_name     VARCHAR(100),
    device_id       VARCHAR(255),
    ip_address      INET,
    user_agent      TEXT,

    -- Status
    is_active       BOOLEAN DEFAULT TRUE,
    expires_at      TIMESTAMP NOT NULL,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    last_used_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(refresh_token);
```

### 3. Flights

```sql
CREATE TABLE flights (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Flight Info
    flight_number   VARCHAR(10) NOT NULL,  -- e.g., 'SV123'
    airline_code    CHAR(2) NOT NULL,       -- e.g., 'SV' for Saudia
    airline_name    VARCHAR(100),

    -- Route
    departure_airport   CHAR(3) NOT NULL,   -- IATA code, e.g., 'RUH'
    departure_city      VARCHAR(100),
    departure_country   CHAR(2),
    arrival_airport     CHAR(3) NOT NULL,
    arrival_city        VARCHAR(100),
    arrival_country     CHAR(2),

    -- Schedule
    departure_date      DATE NOT NULL,
    departure_time      TIME NOT NULL,
    arrival_date        DATE NOT NULL,
    arrival_time        TIME NOT NULL,

    -- Status (from flight API)
    status              VARCHAR(20) DEFAULT 'scheduled',  -- scheduled, delayed, cancelled
    actual_departure    TIMESTAMP,
    actual_arrival      TIMESTAMP,

    -- Cache management
    last_updated_at     TIMESTAMP DEFAULT NOW(),

    -- Timestamps
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Composite unique constraint
CREATE UNIQUE INDEX idx_flights_unique ON flights(
    flight_number, departure_date
);

CREATE INDEX idx_flights_route ON flights(
    departure_airport, arrival_airport, departure_date
);
CREATE INDEX idx_flights_date ON flights(departure_date);
```

### 4. Listings

```sql
CREATE TABLE listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Owner
    carrier_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Flight Reference
    flight_id       UUID REFERENCES flights(id),

    -- Manual flight entry (if no flight_id)
    flight_number   VARCHAR(10),
    departure_airport CHAR(3),
    arrival_airport CHAR(3),
    departure_date  DATE,

    -- Capacity
    total_allowance_kg  DECIMAL(5,2) NOT NULL,  -- Carrier's total allowance
    used_kg             DECIMAL(5,2) NOT NULL,  -- What carrier is using
    available_kg        DECIMAL(5,2) NOT NULL,  -- Available for sharing
    min_booking_kg      DECIMAL(5,2) DEFAULT 1, -- Minimum per booking

    -- Pricing
    price_per_kg        DECIMAL(10,2) NOT NULL,
    currency            CHAR(3) DEFAULT 'SAR',

    -- Preferences
    accepts_documents   BOOLEAN DEFAULT TRUE,
    accepts_clothing    BOOLEAN DEFAULT TRUE,
    accepts_electronics BOOLEAN DEFAULT TRUE,
    accepts_gifts       BOOLEAN DEFAULT TRUE,
    accepts_other       BOOLEAN DEFAULT FALSE,
    notes               TEXT,  -- Additional carrier notes

    -- Status
    status              VARCHAR(20) DEFAULT 'active',
    -- active, booked_full, expired, cancelled, completed

    -- Stats
    total_bookings      INTEGER DEFAULT 0,
    booked_kg           DECIMAL(5,2) DEFAULT 0,

    -- Timestamps
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    expires_at          TIMESTAMP,  -- Auto-expire after flight
    deleted_at          TIMESTAMP
);

-- Indexes
CREATE INDEX idx_listings_carrier ON listings(carrier_id);
CREATE INDEX idx_listings_flight ON listings(flight_id);
CREATE INDEX idx_listings_route ON listings(departure_airport, arrival_airport, departure_date);
CREATE INDEX idx_listings_status ON listings(status) WHERE status = 'active';
CREATE INDEX idx_listings_available ON listings(available_kg) WHERE status = 'active';
```

### 5. Bookings

```sql
CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference Number (human-readable)
    booking_ref     VARCHAR(10) UNIQUE NOT NULL,  -- e.g., 'LS-A1B2C3'

    -- Parties
    listing_id      UUID NOT NULL REFERENCES listings(id),
    carrier_id      UUID NOT NULL REFERENCES users(id),
    sender_id       UUID NOT NULL REFERENCES users(id),

    -- Booking Details
    weight_kg       DECIMAL(5,2) NOT NULL,

    -- Pricing
    price_per_kg    DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    platform_fee    DECIMAL(10,2) DEFAULT 0,  -- Our commission
    insurance_fee   DECIMAL(10,2) DEFAULT 0,
    total_amount    DECIMAL(10,2) NOT NULL,
    currency        CHAR(3) DEFAULT 'SAR',

    -- Insurance
    insurance_tier  INTEGER DEFAULT 0,  -- 0=basic free, 1=standard, 2=premium
    insurance_coverage DECIMAL(10,2) DEFAULT 200,

    -- Status Flow
    status          VARCHAR(30) DEFAULT 'pending',
    /*
    Status flow:
    pending → accepted/rejected
    accepted → items_listed
    items_listed → items_approved/items_rejected
    items_approved → payment_pending
    payment_pending → payment_completed
    payment_completed → pickup_scheduled
    pickup_scheduled → picked_up
    picked_up → in_transit
    in_transit → delivered
    delivered → completed

    Any stage can go to: cancelled, disputed
    */

    -- Timeline tracking
    accepted_at         TIMESTAMP,
    items_listed_at     TIMESTAMP,
    items_approved_at   TIMESTAMP,
    payment_completed_at TIMESTAMP,
    picked_up_at        TIMESTAMP,
    delivered_at        TIMESTAMP,
    completed_at        TIMESTAMP,
    cancelled_at        TIMESTAMP,

    -- Cancellation
    cancelled_by        UUID REFERENCES users(id),
    cancellation_reason TEXT,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_ref := 'LS-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 6));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_ref
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_ref();

-- Indexes
CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_carrier ON bookings(carrier_id);
CREATE INDEX idx_bookings_sender ON bookings(sender_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_ref ON bookings(booking_ref);
```

### 6. Booking Items

```sql
CREATE TABLE booking_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

    -- Item Details
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) NOT NULL,
    -- categories: documents, clothing, electronics, gifts, other

    quantity        INTEGER DEFAULT 1,
    estimated_weight_kg DECIMAL(5,2),
    declared_value  DECIMAL(10,2),  -- For insurance purposes
    currency        CHAR(3) DEFAULT 'SAR',

    -- Verification
    status          VARCHAR(20) DEFAULT 'pending',
    -- pending, approved, rejected
    rejection_reason TEXT,
    approved_by     UUID REFERENCES users(id),  -- Carrier who approved
    approved_at     TIMESTAMP,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_booking_items_booking ON booking_items(booking_id);
```

### 7. Item Photos

```sql
CREATE TABLE item_photos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES booking_items(id) ON DELETE CASCADE,

    -- Photo
    photo_url       TEXT NOT NULL,
    thumbnail_url   TEXT,

    -- Metadata
    photo_type      VARCHAR(20) DEFAULT 'item',
    -- item, packaging, handoff_pickup, handoff_delivery
    uploaded_by     UUID NOT NULL REFERENCES users(id),

    -- Verification data
    captured_at     TIMESTAMP,  -- When photo was taken
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_item_photos_item ON item_photos(item_id);
```

### 8. Messages

```sql
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID REFERENCES bookings(id),  -- Optional, can be pre-booking

    -- Participants
    user_1_id       UUID NOT NULL REFERENCES users(id),
    user_2_id       UUID NOT NULL REFERENCES users(id),

    -- Status
    is_active       BOOLEAN DEFAULT TRUE,

    -- Last message cache
    last_message_at     TIMESTAMP,
    last_message_preview TEXT,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_conversations_users ON conversations(
    LEAST(user_1_id, user_2_id),
    GREATEST(user_1_id, user_2_id)
);
CREATE INDEX idx_conversations_booking ON conversations(booking_id);

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Message
    sender_id       UUID NOT NULL REFERENCES users(id),
    content         TEXT NOT NULL,
    message_type    VARCHAR(20) DEFAULT 'text',
    -- text, image, location, system

    -- Attachments
    attachment_url  TEXT,
    attachment_type VARCHAR(20),  -- image, document

    -- Location (for handoff coordination)
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    location_name   VARCHAR(200),

    -- Read status
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMP,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    deleted_at      TIMESTAMP  -- Soft delete
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(conversation_id, created_at DESC);
```

### 9. Reviews

```sql
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id),

    -- Parties
    reviewer_id     UUID NOT NULL REFERENCES users(id),
    reviewee_id     UUID NOT NULL REFERENCES users(id),

    -- Type
    review_type     VARCHAR(20) NOT NULL,  -- 'carrier' or 'sender'

    -- Rating
    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

    -- Detailed ratings (optional)
    communication_rating    INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    punctuality_rating      INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    item_condition_rating   INTEGER CHECK (item_condition_rating >= 1 AND item_condition_rating <= 5),

    -- Content
    comment         TEXT,

    -- Moderation
    is_visible      BOOLEAN DEFAULT TRUE,
    is_flagged      BOOLEAN DEFAULT FALSE,
    flag_reason     TEXT,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Prevent duplicate reviews
CREATE UNIQUE INDEX idx_reviews_unique ON reviews(booking_id, reviewer_id, review_type);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
```

### 10. Payments

```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id),

    -- Payment Details
    amount          DECIMAL(10,2) NOT NULL,
    currency        CHAR(3) DEFAULT 'SAR',
    payment_type    VARCHAR(20) NOT NULL,
    -- types: booking_payment, carrier_payout, refund, insurance_claim

    -- Direction
    payer_id        UUID REFERENCES users(id),
    payee_id        UUID REFERENCES users(id),

    -- Gateway
    payment_gateway VARCHAR(20),  -- moyasar, tap, stripe
    gateway_reference VARCHAR(255),
    gateway_response JSONB,

    -- Status
    status          VARCHAR(20) DEFAULT 'pending',
    -- pending, processing, completed, failed, refunded

    -- Escrow tracking
    escrow_held     BOOLEAN DEFAULT FALSE,
    escrow_released_at TIMESTAMP,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    completed_at    TIMESTAMP
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_payee ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 11. Notifications

```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Content
    title           VARCHAR(200) NOT NULL,
    title_ar        VARCHAR(200),  -- Arabic title
    body            TEXT NOT NULL,
    body_ar         TEXT,          -- Arabic body

    -- Type & Action
    notification_type VARCHAR(50) NOT NULL,
    -- types: booking_request, booking_accepted, booking_rejected,
    --        items_approved, payment_received, pickup_reminder,
    --        delivery_confirmed, review_request, message, system

    -- Deep link
    action_type     VARCHAR(50),
    action_data     JSONB,  -- { "booking_id": "...", "screen": "booking_detail" }

    -- Status
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMP,

    -- Push notification tracking
    push_sent       BOOLEAN DEFAULT FALSE,
    push_sent_at    TIMESTAMP,
    push_token_used VARCHAR(255),

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read)
    WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(user_id, created_at DESC);
```

### 12. Push Tokens

```sql
CREATE TABLE push_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Token
    token           TEXT NOT NULL,
    platform        VARCHAR(20) NOT NULL,  -- ios, android, web

    -- Status
    is_active       BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    last_used_at    TIMESTAMP
);

CREATE UNIQUE INDEX idx_push_tokens_unique ON push_tokens(user_id, token);
CREATE INDEX idx_push_tokens_user ON push_tokens(user_id) WHERE is_active = TRUE;
```

### 13. Disputes

```sql
CREATE TABLE disputes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id),

    -- Parties
    raised_by       UUID NOT NULL REFERENCES users(id),
    against_user    UUID NOT NULL REFERENCES users(id),

    -- Dispute Details
    dispute_type    VARCHAR(50) NOT NULL,
    -- types: item_not_received, item_damaged, item_different,
    --        carrier_no_show, sender_no_show, payment_issue, other

    description     TEXT NOT NULL,

    -- Evidence
    evidence_urls   TEXT[],  -- Array of photo/document URLs

    -- Resolution
    status          VARCHAR(20) DEFAULT 'open',
    -- open, under_review, resolved, escalated, closed

    resolution      TEXT,
    resolved_by     UUID REFERENCES users(id),  -- Admin who resolved
    resolution_type VARCHAR(30),
    -- full_refund, partial_refund, carrier_paid, no_action, other

    refund_amount   DECIMAL(10,2),

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    resolved_at     TIMESTAMP
);

CREATE INDEX idx_disputes_booking ON disputes(booking_id);
CREATE INDEX idx_disputes_raised ON disputes(raised_by);
CREATE INDEX idx_disputes_status ON disputes(status) WHERE status = 'open';
```

### 14. Airports (Reference Data)

```sql
CREATE TABLE airports (
    iata_code       CHAR(3) PRIMARY KEY,
    icao_code       CHAR(4),

    -- Names
    name            VARCHAR(200) NOT NULL,
    name_ar         VARCHAR(200),

    -- Location
    city            VARCHAR(100) NOT NULL,
    city_ar         VARCHAR(100),
    country_code    CHAR(2) NOT NULL,
    country_name    VARCHAR(100),

    -- Coordinates
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),

    -- Timezone
    timezone        VARCHAR(50),

    -- Status
    is_active       BOOLEAN DEFAULT TRUE,
    is_popular      BOOLEAN DEFAULT FALSE  -- For quick selection
);

-- Pre-populate with key Saudi airports
INSERT INTO airports (iata_code, name, name_ar, city, city_ar, country_code, is_popular) VALUES
('RUH', 'King Khalid International Airport', 'مطار الملك خالد الدولي', 'Riyadh', 'الرياض', 'SA', TRUE),
('JED', 'King Abdulaziz International Airport', 'مطار الملك عبدالعزيز الدولي', 'Jeddah', 'جدة', 'SA', TRUE),
('DMM', 'King Fahd International Airport', 'مطار الملك فهد الدولي', 'Dammam', 'الدمام', 'SA', TRUE),
('MED', 'Prince Mohammad bin Abdulaziz Airport', 'مطار الأمير محمد بن عبدالعزيز', 'Medina', 'المدينة المنورة', 'SA', TRUE),
('CAI', 'Cairo International Airport', 'مطار القاهرة الدولي', 'Cairo', 'القاهرة', 'EG', TRUE),
('MNL', 'Ninoy Aquino International Airport', NULL, 'Manila', NULL, 'PH', TRUE),
('KHI', 'Jinnah International Airport', NULL, 'Karachi', NULL, 'PK', TRUE),
('BOM', 'Chhatrapati Shivaji Maharaj Airport', NULL, 'Mumbai', NULL, 'IN', TRUE);
```

### 15. App Configuration (Feature Flags)

```sql
CREATE TABLE app_config (
    key             VARCHAR(100) PRIMARY KEY,
    value           JSONB NOT NULL,
    description     TEXT,
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Initial configuration
INSERT INTO app_config (key, value, description) VALUES
('commission_rate', '{"sender": 0, "carrier": 0}', 'Platform commission rates (Phase 1: 0%)'),
('min_booking_kg', '1', 'Minimum weight per booking'),
('max_booking_kg', '23', 'Maximum weight per booking'),
('max_item_value', '500', 'Maximum declared value per item (SAR)'),
('supported_currencies', '["SAR", "USD", "EUR"]', 'Supported currencies'),
('maintenance_mode', 'false', 'Enable maintenance mode'),
('required_app_version', '{"ios": "1.0.0", "android": "1.0.0"}', 'Minimum app versions'),
('balance_threshold', '-10', 'Default balance restriction threshold (SAR)'),
('commission_rate_carrier', '0.05', 'Commission rate for carriers (5%)');
```

### 16. Balance Transactions (Credit Balance System)

```sql
CREATE TABLE balance_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Transaction Details
    amount          DECIMAL(10,2) NOT NULL,  -- Positive = credit, Negative = debit
    balance_before  DECIMAL(10,2) NOT NULL,
    balance_after   DECIMAL(10,2) NOT NULL,

    -- Transaction Type
    transaction_type VARCHAR(30) NOT NULL,
    /*
    Types:
    - commission_charge: Platform deducts commission after trip completion
    - top_up: User pays platform to clear negative balance
    - adjustment: Admin manual adjustment
    - refund: Platform returns commission (dispute resolution)
    - bonus: Platform rewards (promotional)
    */

    -- Reference
    booking_id      UUID REFERENCES bookings(id),  -- For commission charges
    reference_note  TEXT,

    -- Payment Details (for top-ups)
    payment_method  VARCHAR(30),  -- bank_transfer, card, etc.
    payment_proof_url TEXT,       -- Screenshot of bank transfer

    -- Status
    status          VARCHAR(20) DEFAULT 'completed',
    -- pending (awaiting verification), completed, rejected

    -- Verification (for top-ups)
    verified_by     UUID REFERENCES users(id),  -- Admin who verified
    verified_at     TIMESTAMP,
    rejection_reason TEXT,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_balance_transactions_user ON balance_transactions(user_id);
CREATE INDEX idx_balance_transactions_booking ON balance_transactions(booking_id);
CREATE INDEX idx_balance_transactions_status ON balance_transactions(status)
    WHERE status = 'pending';
CREATE INDEX idx_balance_transactions_created ON balance_transactions(user_id, created_at DESC);
```

### Balance Management Functions

```sql
-- Function to charge commission and update user balance
CREATE OR REPLACE FUNCTION charge_commission(
    p_user_id UUID,
    p_booking_id UUID,
    p_amount DECIMAL(10,2)
)
RETURNS UUID AS $$
DECLARE
    v_balance_before DECIMAL(10,2);
    v_balance_after DECIMAL(10,2);
    v_threshold DECIMAL(10,2);
    v_transaction_id UUID;
BEGIN
    -- Get current balance and threshold
    SELECT balance, balance_threshold
    INTO v_balance_before, v_threshold
    FROM users WHERE id = p_user_id FOR UPDATE;

    -- Calculate new balance
    v_balance_after := v_balance_before - p_amount;

    -- Update user balance
    UPDATE users SET
        balance = v_balance_after,
        is_balance_restricted = (v_balance_after < v_threshold),
        last_balance_update = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Record transaction
    INSERT INTO balance_transactions (
        user_id, amount, balance_before, balance_after,
        transaction_type, booking_id, status
    ) VALUES (
        p_user_id, -p_amount, v_balance_before, v_balance_after,
        'commission_charge', p_booking_id, 'completed'
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process top-up (clears negative balance)
CREATE OR REPLACE FUNCTION process_top_up(
    p_user_id UUID,
    p_amount DECIMAL(10,2),
    p_payment_method VARCHAR(30),
    p_payment_proof_url TEXT,
    p_admin_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_balance_before DECIMAL(10,2);
    v_balance_after DECIMAL(10,2);
    v_threshold DECIMAL(10,2);
    v_transaction_id UUID;
BEGIN
    -- Get current balance
    SELECT balance, balance_threshold
    INTO v_balance_before, v_threshold
    FROM users WHERE id = p_user_id FOR UPDATE;

    -- Calculate new balance
    v_balance_after := v_balance_before + p_amount;

    -- Update user balance
    UPDATE users SET
        balance = v_balance_after,
        is_balance_restricted = (v_balance_after < v_threshold),
        last_balance_update = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Record transaction
    INSERT INTO balance_transactions (
        user_id, amount, balance_before, balance_after,
        transaction_type, payment_method, payment_proof_url,
        verified_by, verified_at, status
    ) VALUES (
        p_user_id, p_amount, v_balance_before, v_balance_after,
        'top_up', p_payment_method, p_payment_proof_url,
        p_admin_id, CASE WHEN p_admin_id IS NOT NULL THEN NOW() ELSE NULL END,
        CASE WHEN p_admin_id IS NOT NULL THEN 'completed' ELSE 'pending' END
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can post/accept (not restricted)
CREATE OR REPLACE FUNCTION can_user_transact(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_restricted BOOLEAN;
BEGIN
    SELECT is_balance_restricted INTO v_is_restricted
    FROM users WHERE id = p_user_id;

    RETURN NOT COALESCE(v_is_restricted, FALSE);
END;
$$ LANGUAGE plpgsql;
```

---

## Database Views

### Active Listings View

```sql
CREATE VIEW v_active_listings AS
SELECT
    l.*,
    u.display_name AS carrier_name,
    u.avatar_url AS carrier_avatar,
    u.avg_rating_as_carrier AS carrier_rating,
    u.total_trips_as_carrier AS carrier_trips,
    u.is_verified AS carrier_verified,
    f.airline_name,
    f.departure_time,
    f.arrival_time,
    dep.name AS departure_airport_name,
    arr.name AS arrival_airport_name
FROM listings l
JOIN users u ON l.carrier_id = u.id
LEFT JOIN flights f ON l.flight_id = f.id
LEFT JOIN airports dep ON l.departure_airport = dep.iata_code
LEFT JOIN airports arr ON l.arrival_airport = arr.iata_code
WHERE l.status = 'active'
  AND l.deleted_at IS NULL
  AND l.available_kg > 0
  AND (l.expires_at IS NULL OR l.expires_at > NOW());
```

### User Stats View

```sql
CREATE VIEW v_user_stats AS
SELECT
    u.id,
    u.display_name,
    u.avatar_url,
    u.is_verified,
    u.verification_level,
    u.created_at AS member_since,

    -- Carrier stats
    COUNT(DISTINCT CASE WHEN b.carrier_id = u.id AND b.status = 'completed' THEN b.id END) AS completed_as_carrier,
    COALESCE(AVG(CASE WHEN r.reviewee_id = u.id AND r.review_type = 'carrier' THEN r.rating END), 0) AS avg_carrier_rating,

    -- Sender stats
    COUNT(DISTINCT CASE WHEN b.sender_id = u.id AND b.status = 'completed' THEN b.id END) AS completed_as_sender,
    COALESCE(AVG(CASE WHEN r.reviewee_id = u.id AND r.review_type = 'sender' THEN r.rating END), 0) AS avg_sender_rating,

    -- Response rate (accepted / total received)
    CASE
        WHEN COUNT(CASE WHEN b.carrier_id = u.id THEN 1 END) > 0
        THEN COUNT(CASE WHEN b.carrier_id = u.id AND b.status != 'rejected' THEN 1 END)::FLOAT /
             COUNT(CASE WHEN b.carrier_id = u.id THEN 1 END)
        ELSE 0
    END AS acceptance_rate

FROM users u
LEFT JOIN bookings b ON b.carrier_id = u.id OR b.sender_id = u.id
LEFT JOIN reviews r ON r.reviewee_id = u.id
WHERE u.is_active = TRUE AND u.deleted_at IS NULL
GROUP BY u.id;
```

---

## Indexes Summary

```sql
-- Performance indexes for common queries

-- Search listings by route and date
CREATE INDEX idx_listings_search ON listings(
    departure_airport, arrival_airport, departure_date, status
) WHERE status = 'active' AND deleted_at IS NULL;

-- User's active bookings
CREATE INDEX idx_bookings_user_active ON bookings(carrier_id, status)
WHERE status NOT IN ('completed', 'cancelled');

CREATE INDEX idx_bookings_sender_active ON bookings(sender_id, status)
WHERE status NOT IN ('completed', 'cancelled');

-- Unread messages count
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read)
WHERE is_read = FALSE AND deleted_at IS NULL;

-- Recent notifications
CREATE INDEX idx_notifications_recent ON notifications(user_id, created_at DESC)
WHERE is_read = FALSE;
```

---

## Migrations Strategy

### Initial Migration (V1)

```bash
# Using TypeORM migrations
npm run migration:generate -- -n InitialSchema
npm run migration:run

# Or using Supabase
supabase db push
```

### Migration Naming Convention

```
V001__create_users_table.sql
V002__create_flights_table.sql
V003__create_listings_table.sql
V004__create_bookings_table.sql
V005__create_messages_table.sql
V006__create_reviews_table.sql
V007__create_payments_table.sql
V008__create_notifications_table.sql
V009__create_disputes_table.sql
V010__create_views.sql
V011__create_indexes.sql
V012__seed_airports.sql
V013__seed_config.sql
V014__add_balance_system.sql
V015__create_balance_transactions.sql
V016__create_balance_functions.sql
```

---

## TypeORM Entity Example

```typescript
// src/modules/users/entities/user.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Listing } from '../../listings/entities/listing.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true, nullable: true })
  phone: string;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ length: 255, unique: true, nullable: true })
  email: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 100, nullable: true })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string;

  @Column({ length: 2, default: 'SA' })
  countryCode: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: 0 })
  verificationLevel: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  avgRatingAsCarrier: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  avgRatingAsSender: number;

  // Credit Balance System
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: -10 })
  balanceThreshold: number;

  @Column({ default: false })
  isBalanceRestricted: boolean;

  @Column({ nullable: true })
  lastBalanceUpdate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Listing, (listing) => listing.carrier)
  listings: Listing[];

  @OneToMany(() => Booking, (booking) => booking.carrier)
  bookingsAsCarrier: Booking[];

  @OneToMany(() => Booking, (booking) => booking.sender)
  bookingsAsSender: Booking[];
}
```

---

## Prisma Schema Alternative

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(uuid())
  phone             String?   @unique
  phoneVerified     Boolean   @default(false)
  email             String?   @unique
  emailVerified     Boolean   @default(false)
  firstName         String
  lastName          String
  displayName       String?
  avatarUrl         String?
  countryCode       String    @default("SA")
  isVerified        Boolean   @default(false)
  verificationLevel Int       @default(0)
  avgRatingAsCarrier Decimal  @default(0) @db.Decimal(2, 1)
  avgRatingAsSender  Decimal  @default(0) @db.Decimal(2, 1)

  // Credit Balance System
  balance            Decimal  @default(0) @db.Decimal(10, 2)
  balanceThreshold   Decimal  @default(-10) @db.Decimal(10, 2)
  isBalanceRestricted Boolean @default(false)
  lastBalanceUpdate  DateTime?

  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  listings          Listing[]
  balanceTransactions BalanceTransaction[]
  bookingsAsCarrier Booking[] @relation("CarrierBookings")
  bookingsAsSender  Booking[] @relation("SenderBookings")
  sentMessages      Message[] @relation("SentMessages")
  reviews           Review[]  @relation("ReviewsGiven")
  reviewsReceived   Review[]  @relation("ReviewsReceived")

  @@map("users")
}

model Listing {
  id              String    @id @default(uuid())
  carrierId       String
  carrier         User      @relation(fields: [carrierId], references: [id])
  flightId        String?
  departureAirport String
  arrivalAirport  String
  departureDate   DateTime
  availableKg     Decimal   @db.Decimal(5, 2)
  pricePerKg      Decimal   @db.Decimal(10, 2)
  currency        String    @default("SAR")
  status          String    @default("active")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  bookings        Booking[]

  @@map("listings")
}

model BalanceTransaction {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  amount          Decimal   @db.Decimal(10, 2)
  balanceBefore   Decimal   @db.Decimal(10, 2)
  balanceAfter    Decimal   @db.Decimal(10, 2)
  transactionType String
  bookingId       String?
  booking         Booking?  @relation(fields: [bookingId], references: [id])
  referenceNote   String?
  paymentMethod   String?
  paymentProofUrl String?
  status          String    @default("completed")
  verifiedBy      String?
  verifiedAt      DateTime?
  rejectionReason String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
  @@index([bookingId])
  @@map("balance_transactions")
}

// ... continue for other models
```

---

*Schema version: 1.1*
*Last updated: January 2026*
