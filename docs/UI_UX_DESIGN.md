# LuggageShare UI/UX Design Specification

> **Status**: REFERENCE ONLY - See [ROADMAP.md](ROADMAP.md) for current implementation status.
>
> **Design System**: Modern, Trust-focused, Arabic-first (RTL)
> **Platforms**: iOS, Android, Web
> **Framework**: React Native (mobile), Next.js (web)

---

## Implementation Notes

- **Onboarding Flow (Flow 4)**: Shows phone + OTP verification. For MVP, authentication is **Google + Apple Sign-In only**. Phone OTP will be added in Phase 3 (Trust & Safety).
- **41 Screens Documented**: The web MVP implements 14 pages covering the core flows. Mobile screens are Phase 2.
- **Listing Card (Section 8)**: Shows per-kg pricing. Actual implementation uses **tiered pricing (S/M/L)**.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [User Personas](#2-user-personas)
3. [User Flows](#3-user-flows)
4. [Information Architecture](#4-information-architecture)
5. [Screen Inventory](#5-screen-inventory)
6. [Wireframes](#6-wireframes)
7. [Design System](#7-design-system)
8. [Component Library](#8-component-library)
9. [Accessibility](#9-accessibility)
10. [Animations & Micro-interactions](#10-animations--micro-interactions)

---

## 1. Design Principles

### Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Trust First** | Every element builds confidence | Verification badges, reviews visible, clear processes |
| **Arabic First** | RTL is default, not afterthought | Native RTL design, Arabic typography priority |
| **Simplicity** | Complex flow made simple | Progressive disclosure, clear CTAs |
| **Transparency** | No hidden fees or surprises | All costs visible, clear terms |
| **Accessibility** | Usable by everyone | WCAG 2.1 AA compliance |

### Design Goals

1. **Reduce friction** in the booking process
2. **Build trust** between strangers
3. **Make Arabic feel native**, not translated
4. **Guide users** through complex flows
5. **Celebrate success** moments (completed trips, positive reviews)

---

## 2. User Personas

### Persona 1: Carrier (Traveler with Extra Space)

```
┌─────────────────────────────────────────────────────────────┐
│  👤 AHMED - The Frequent Traveler                           │
├─────────────────────────────────────────────────────────────┤
│  Age: 32 | Occupation: Business Consultant                  │
│  Location: Riyadh, Saudi Arabia                             │
│  Travel Frequency: 4-6 trips/month                          │
├─────────────────────────────────────────────────────────────┤
│  GOALS                          │  FRUSTRATIONS             │
│  • Earn extra money while       │  • Never uses full        │
│    traveling anyway             │    luggage allowance      │
│  • Help fellow travelers        │  • Wasted space every     │
│  • Easy, passive income         │    trip                   │
├─────────────────────────────────────────────────────────────┤
│  NEEDS FROM APP                                             │
│  • Quick listing creation (under 2 minutes)                 │
│  • Automated matching                                       │
│  • Easy communication with senders                          │
│  • Clear pickup/handoff process                             │
│  • Fast, reliable payouts                                   │
└─────────────────────────────────────────────────────────────┘
```

### Persona 2: Sender (Person with Excess Luggage)

```
┌─────────────────────────────────────────────────────────────┐
│  👩 SARA - The Family Gift Sender                           │
├─────────────────────────────────────────────────────────────┤
│  Age: 28 | Occupation: Marketing Manager                    │
│  Location: Riyadh, Saudi Arabia                             │
│  Travel Frequency: 2-3 trips/year                           │
├─────────────────────────────────────────────────────────────┤
│  GOALS                          │  FRUSTRATIONS             │
│  • Send gifts to family in      │  • Excess baggage fees    │
│    Egypt                        │    are expensive (500+    │
│  • Avoid airline overweight     │    SAR)                   │
│    fees                         │  • Shipping takes weeks   │
│  • Safe, tracked delivery       │  • Can't trust random     │
│                                 │    people                 │
├─────────────────────────────────────────────────────────────┤
│  NEEDS FROM APP                                             │
│  • Find trusted carriers easily                             │
│  • See ratings and verification status                      │
│  • Clear pricing (no surprises)                             │
│  • Photo verification of items                              │
│  • Real-time tracking                                       │
│  • Insurance for peace of mind                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. User Flows

### Flow 1: Carrier - Create Listing

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      CARRIER: CREATE LISTING FLOW                         │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Home   │───▶│ Enter Flight│───▶│ Set Space & │───▶│  Review &   │
│  Screen │    │   Details   │    │   Pricing   │    │   Confirm   │
└─────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                     │                   │                  │
                     ▼                   ▼                  ▼
              ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
              │ • Flight #  │    │ • Available │    │ • Summary   │
              │ • Date      │    │   kg        │    │ • Total     │
              │ • From/To   │    │ • Price/kg  │    │   earnings  │
              │ • Auto-fill │    │ • Item types│    │ • Publish!  │
              └─────────────┘    │ • Notes     │    └─────────────┘
                                 └─────────────┘
                                                           │
                                                           ▼
                                                    ┌─────────────┐
                                                    │  LISTING    │
                                                    │   ACTIVE    │
                                                    │  ✅ Success │
                                                    └─────────────┘

Total Steps: 4
Estimated Time: 2-3 minutes
```

### Flow 2: Sender - Book Space

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      SENDER: BOOKING FLOW                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Search  │───▶│   Browse    │───▶│   View      │───▶│   Request   │
│ Route   │    │  Listings   │    │   Listing   │    │   Booking   │
└─────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                │                  │                  │
     ▼                ▼                  ▼                  ▼
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ • From  │    │ • Cards     │    │ • Carrier   │    │ • Weight    │
│ • To    │    │ • Filters   │    │   profile   │    │ • Message   │
│ • Date  │    │ • Sort      │    │ • Reviews   │    │ • Send      │
│ • Kg    │    │ • Price     │    │ • Details   │    │   request   │
└─────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Wait for  │───▶│  Add Items  │───▶│   Submit    │───▶│    Pay      │
│   Accept    │    │  + Photos   │    │ for Review  │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                  │                  │                  │
     ▼                  ▼                  ▼                  ▼
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Wait or │    │ • Item name │    │ • Review    │    │ • Choose    │
│ Chat    │    │ • Category  │    │   all items │    │   method    │
│ with    │    │ • Photos    │    │ • Wait for  │    │ • Apple Pay │
│ carrier │    │ • Value     │    │   approval  │    │ • Card      │
└─────────┘    └─────────────┘    └─────────────┘    │ • STC Pay   │
                                                     └─────────────┘
                                                           │
                                                           ▼
                                                    ┌─────────────┐
                                                    │  BOOKING    │
                                                    │  CONFIRMED  │
                                                    │  ✅ Success │
                                                    └─────────────┘

Total Steps: 8
Estimated Time: 5-10 minutes
```

### Flow 3: Handoff Process

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      HANDOFF FLOW (BOTH USERS)                           │
└──────────────────────────────────────────────────────────────────────────┘

PICKUP (Airport Origin)
─────────────────────────

SENDER                              CARRIER
───────                             ────────
│                                   │
▼                                   ▼
┌─────────────┐                    ┌─────────────┐
│ Go to       │                    │ Go to       │
│ meeting     │◀──── CHAT ────────▶│ meeting     │
│ point       │      LOCATION      │ point       │
└─────────────┘                    └─────────────┘
       │                                  │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ Hand over   │ ─────────────────▶ │ Verify      │
│ items       │                    │ items       │
└─────────────┘                    └─────────────┘
       │                                  │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ Confirm     │                    │ Take        │
│ handoff     │                    │ photos      │
│ in app      │                    │ Confirm     │
└─────────────┘                    └─────────────┘


DELIVERY (Airport Destination)
──────────────────────────────

CARRIER                             RECEIVER
────────                            ─────────
│                                   │
▼                                   ▼
┌─────────────┐                    ┌─────────────┐
│ Arrive at   │                    │ Go to       │
│ destination │◀──── NOTIFY ──────▶│ meeting     │
│             │                    │ point       │
└─────────────┘                    └─────────────┘
       │                                  │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ Hand over   │ ─────────────────▶ │ Verify      │
│ items       │                    │ items       │
└─────────────┘                    └─────────────┘
       │                                  │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ Mark as     │                    │ Confirm     │
│ delivered   │                    │ receipt     │
└─────────────┘                    └─────────────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  COMPLETE   │
                                   │  ✅ Success │
                                   │  + Review   │
                                   └─────────────┘
```

### Flow 4: Onboarding

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      ONBOARDING FLOW                                      │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Welcome   │───▶│   Phone     │───▶│   Verify    │───▶│   Profile   │
│   Screens   │    │   Number    │    │    OTP      │    │   Setup     │
│   (3)       │    │   Entry     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                  │                  │                  │
     ▼                  ▼                  ▼                  ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ • Save on   │   │ • Phone     │   │ • 6-digit   │   │ • Name      │
│   luggage   │   │   with      │   │   code      │   │ • Photo     │
│ • Earn      │   │   country   │   │ • Resend    │   │ • City      │
│   while     │   │   picker    │   │   option    │   │ • Language  │
│   traveling │   │ • +966      │   │ • Auto-     │   │   (ar/en)   │
│ • Safe &    │   │   default   │   │   submit    │   │             │
│   trusted   │   │             │   │             │   │             │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
                                                            │
                                                            ▼
                                                     ┌─────────────┐
                                                     │   Choose    │
                                                     │    Role     │
                                                     │ ┌─────────┐ │
                                                     │ │ Carrier │ │
                                                     │ │   or    │ │
                                                     │ │ Sender  │ │
                                                     │ └─────────┘ │
                                                     └─────────────┘
                                                            │
                                                            ▼
                                                     ┌─────────────┐
                                                     │    HOME     │
                                                     │   SCREEN    │
                                                     └─────────────┘

Total Steps: 5 (excluding welcome screens)
Estimated Time: 2-3 minutes
```

---

### Flow 5: Credit Balance & Restriction (Carrier)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                 CREDIT BALANCE FLOW (CARRIER)                             │
└──────────────────────────────────────────────────────────────────────────┘

NORMAL OPERATION:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Booking   │───▶│    Trip     │───▶│  Commission │───▶│   Balance   │
│  Completed  │    │  Payment    │    │   Charged   │    │  Decreased  │
│             │    │  Received   │    │    (5%)     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                               │
     Example: Sender pays 100 SAR → Carrier receives 100 SAR   │
              → Platform charges 5 SAR commission              │
              → Carrier balance: 0 → -5 SAR                    │
                                                               ▼
RESTRICTION TRIGGER (Balance < -10 SAR):
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Balance   │───▶│  Account    │───▶│  Restricted │───▶│   Top-Up    │
│   < -10     │    │ Restricted  │    │   Screen    │    │   Request   │
│   SAR       │    │   Modal     │    │  (Blocking) │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                  │                  │                  │
     ▼                  ▼                  ▼                  ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Tries to:   │   │ • Clear     │   │ • Can't     │   │ • View bank │
│ • Post      │   │   message   │   │   post      │   │   details   │
│   listing   │   │ • Shows     │   │ • Can't     │   │ • Enter     │
│ • Accept    │   │   amount    │   │   accept    │   │   amount    │
│   booking   │   │   owed      │   │ • CAN chat  │   │ • Upload    │
│             │   │ • CTA to    │   │ • CAN       │   │   receipt   │
│             │   │   top-up    │   │   complete  │   │             │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
                                                            │
TOP-UP VERIFICATION:                                        ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Submit    │───▶│   Pending   │───▶│   Admin     │───▶│   Balance   │
│   Top-Up    │    │   Review    │    │  Verifies   │    │  Credited   │
│   Request   │    │  (24 hrs)   │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                               │
                                                               ▼
                                                        ┌─────────────┐
                                                        │ Restriction │
                                                        │   Lifted    │
                                                        │ (if > -10)  │
                                                        └─────────────┘

Entry Points:
• Profile → Wallet
• Booking completion notification
• Restriction modal (automatic)
• My Trips → Trip completion

Success Criteria:
• Clear balance visibility
• Easy top-up process
• 24-hour verification SLA
• Non-blocking for existing trips
```

---

## 4. Information Architecture

### Navigation Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      BOTTOM TAB NAVIGATION                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   🏠 Home      📦 My Trips      💬 Messages      👤 Profile              │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

🏠 HOME
├── Search (Sender view)
│   ├── Search Results
│   │   └── Listing Detail
│   │       └── Request Booking
│   └── Filters
├── Create Listing (Carrier view)
│   ├── Flight Details
│   ├── Space & Pricing
│   └── Review & Publish
└── Popular Routes

📦 MY TRIPS
├── As Carrier (Tab)
│   ├── Active Listings
│   ├── Booking Requests
│   └── Completed
├── As Sender (Tab)
│   ├── Active Bookings
│   └── Completed
└── Trip Detail
    ├── Items
    ├── Chat
    ├── Tracking
    └── Actions (Pickup/Deliver)

💬 MESSAGES
├── Conversations List
└── Chat Screen
    ├── Text Messages
    ├── Images
    └── Location Share

👤 PROFILE
├── My Profile
│   ├── Edit Profile
│   └── Avatar Upload
├── Verification
│   └── Document Upload
├── Wallet (Carrier) ★ NEW
│   ├── Balance Overview
│   ├── Transaction History
│   ├── Top-Up Request
│   └── Bank Details
├── Payments
│   ├── Earnings (Carrier)
│   ├── Payment Methods
│   └── Transaction History
├── Reviews
├── Settings
│   ├── Notifications
│   ├── Language
│   └── Privacy
├── Help & Support
└── Logout
```

---

## 5. Screen Inventory

### Total Screens: 41

| # | Screen | Priority | User |
|---|--------|----------|------|
| **Onboarding** | | | |
| 1 | Welcome Screen 1 | P0 | All |
| 2 | Welcome Screen 2 | P0 | All |
| 3 | Welcome Screen 3 | P0 | All |
| 4 | Phone Entry | P0 | All |
| 5 | OTP Verification | P0 | All |
| 6 | Profile Setup | P0 | All |
| 7 | Role Selection | P0 | All |
| **Home** | | | |
| 8 | Home - Search (Sender) | P0 | Sender |
| 9 | Home - Dashboard (Carrier) | P0 | Carrier |
| 10 | Search Results | P0 | Sender |
| 11 | Filters | P1 | Sender |
| 12 | Listing Detail | P0 | Sender |
| **Create Listing** | | | |
| 13 | Create - Flight Details | P0 | Carrier |
| 14 | Create - Space & Pricing | P0 | Carrier |
| 15 | Create - Review & Publish | P0 | Carrier |
| 16 | Listing Created Success | P0 | Carrier |
| **Booking** | | | |
| 17 | Request Booking | P0 | Sender |
| 18 | Booking Requested Success | P0 | Sender |
| 19 | Booking Detail | P0 | Both |
| 20 | Add Items | P0 | Sender |
| 21 | Item Detail / Photo | P0 | Sender |
| 22 | Items Review | P0 | Sender |
| 23 | Approve Items (Carrier) | P0 | Carrier |
| 24 | Payment | P0 | Sender |
| 25 | Payment Success | P0 | Sender |
| **Handoff** | | | |
| 26 | Pickup Confirmation | P0 | Carrier |
| 27 | Delivery Confirmation | P0 | Sender |
| **My Trips** | | | |
| 28 | My Trips - Tabs | P0 | Both |
| 29 | Trip Detail | P0 | Both |
| **Messages** | | | |
| 30 | Conversations List | P0 | Both |
| 31 | Chat Screen | P0 | Both |
| **Profile** | | | |
| 32 | Profile Screen | P0 | Both |
| 33 | Edit Profile | P1 | Both |
| 34 | Verification | P1 | Both |
| 35 | Settings | P1 | Both |
| **Reviews** | | | |
| 36 | Leave Review | P0 | Both |
| 37 | My Reviews | P1 | Both |
| **Wallet/Balance** | | | |
| 38 | Wallet Overview | P0 | Carrier |
| 39 | Transaction History | P0 | Carrier |
| 40 | Top-Up Request | P0 | Carrier |
| 41 | Account Restricted | P0 | Carrier |

---

## 6. Wireframes

### Screen 1: Home - Search (Sender View)

```
┌─────────────────────────────────────┐
│ ☰                    🔔    🌐 AR   │  ← Header
├─────────────────────────────────────┤
│                                     │
│  أين تريد أن ترسل؟                  │  ← "Where do you want to send?"
│  Where do you want to send?         │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📍 From        🔄    📍 To     ││  ← Route Selector
│  │ ───────────────────────────────││
│  │ الرياض                القاهرة  ││
│  │ Riyadh                 Cairo   ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📅 Date            ⚖️ Weight   ││  ← Date & Weight
│  │ ───────────────────────────────││
│  │ Feb 15, 2026          5 kg     ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         🔍 Search               ││  ← CTA Button
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│  🔥 Popular Routes                  │  ← Section
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │ RUH→CAI │ │ JED→MNL │ │ DMM→KHI││  ← Horizontal scroll
│  │ 24 trips│ │ 18 trips│ │ 12 trip││
│  │ ~25 SAR │ │ ~35 SAR │ │ ~30 SAR││
│  └─────────┘ └─────────┘ └────────┘│
│                                     │
│  ─────────────────────────────────  │
│  ⭐ Top Carriers                    │  ← Section
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👤 Ahmed A.  ⭐ 4.8 (45 trips)  ││
│  │ ✅ Verified   Next: RUH→CAI     ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 👤 Fatima M. ⭐ 4.9 (32 trips)  ││
│  │ ✅ Verified   Next: JED→MNL     ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠      📦      💬      👤        │  ← Bottom Nav
│  Home    Trips   Chat    Profile    │
└─────────────────────────────────────┘
```

### Screen 2: Search Results

```
┌─────────────────────────────────────┐
│ ←  RUH → CAI  •  Feb 15  •  5kg    │  ← Header with route
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ 💰 Price │  │ ⭐ Rating │        │  ← Sort tabs
│  └──────────┘  └──────────┘        │
│                                     │
│  12 carriers available              │  ← Results count
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ┌────┐                          ││
│  │ │ 👤 │  Ahmed A.      ⭐ 4.8   ││  ← Carrier card
│  │ │    │  ✅ Verified             ││
│  │ └────┘                          ││
│  │ ─────────────────────────────── ││
│  │ ✈️ SV123  •  14:30 → 16:45      ││
│  │ 18 kg available                 ││
│  │ ─────────────────────────────── ││
│  │ 👕 👜 🎁   │   25 SAR/kg        ││  ← Item types + Price
│  │                                 ││
│  │           [ View Details ]      ││  ← CTA
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ┌────┐                          ││
│  │ │ 👤 │  Sara M.       ⭐ 4.6   ││
│  │ │    │  ✅ Verified             ││
│  │ └────┘                          ││
│  │ ─────────────────────────────── ││
│  │ ✈️ MS701  •  10:00 → 12:15      ││
│  │ 10 kg available                 ││
│  │ ─────────────────────────────── ││
│  │ 👕 📄      │   30 SAR/kg        ││
│  │                                 ││
│  │           [ View Details ]      ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │        ... more results ...     ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠      📦      💬      👤        │
└─────────────────────────────────────┘
```

### Screen 3: Listing Detail

```
┌─────────────────────────────────────┐
│ ←  Listing Details         ♡       │  ← Header + favorite
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │         ✈️ FLIGHT INFO          ││  ← Flight card
│  │  ─────────────────────────────  ││
│  │  SV123  •  Saudia              ││
│  │                                 ││
│  │  🛫 RUH          🛬 CAI        ││
│  │  Riyadh          Cairo         ││
│  │  14:30           16:45         ││
│  │                                 ││
│  │  📅 Feb 15, 2026   ⏱️ 2h 15m   ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  ┌────┐                         ││
│  │  │ 👤 │  Ahmed Al-Rashid        ││  ← Carrier card
│  │  │    │  ⭐ 4.8 (45 reviews)    ││
│  │  └────┘  ✅ ID Verified         ││
│  │          Member since Jan 2026  ││
│  │                                 ││
│  │  "Frequent traveler, happy to   ││
│  │   help with gifts and..."       ││
│  │                                 ││
│  │        [ View Profile ]         ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  📦 AVAILABLE SPACE             ││
│  │  ─────────────────────────────  ││
│  │                                 ││
│  │  18 kg          25 SAR/kg      ││
│  │  available      price          ││
│  │                                 ││
│  │  Min: 2 kg      Max: 18 kg     ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  ✅ ACCEPTS                     ││
│  │  ─────────────────────────────  ││
│  │  👕 Clothing   📄 Documents    ││
│  │  🎁 Gifts      📱 Electronics  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  💬 CARRIER'S NOTE              ││
│  │  ─────────────────────────────  ││
│  │  "Will be at airport 3 hours    ││
│  │   early. Happy to meet at       ││
│  │   Terminal 1 Starbucks."        ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │  5 kg  ×  25 SAR  =  125 SAR   ││  ← Price calculator
│  │                                 ││
│  │       [ Request Booking ]       ││  ← CTA
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Screen 4: Booking Detail (After Accepted)

```
┌─────────────────────────────────────┐
│ ←  Booking #LS-X1Y2Z3              │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │  STATUS: ITEMS PENDING          ││  ← Status banner
│  │  ━━━━━━━━━━○────────────────    ││  ← Progress bar
│  │  Requested → Accepted → Items   ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  📦 YOUR ITEMS  (0/5 kg used)   ││
│  │  ─────────────────────────────  ││
│  │                                 ││
│  │  No items added yet             ││
│  │                                 ││
│  │  ┌───────────────────────────┐  ││
│  │  │    ➕ Add Your Items      │  ││  ← CTA
│  │  └───────────────────────────┘  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  ✈️ FLIGHT                      ││
│  │  ─────────────────────────────  ││
│  │  SV123  •  Feb 15, 2026        ││
│  │  RUH 14:30 → CAI 16:45         ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  👤 CARRIER                     ││
│  │  ─────────────────────────────  ││
│  │  Ahmed A.  ⭐ 4.8  ✅ Verified  ││
│  │                                 ││
│  │  [ 💬 Message ]  [ 📞 Call ]   ││  ← Actions
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  💰 PRICING                     ││
│  │  ─────────────────────────────  ││
│  │  5 kg × 25 SAR/kg    125 SAR   ││
│  │  Insurance (Basic)       0 SAR  ││
│  │  Platform fee            0 SAR  ││
│  │  ─────────────────────────────  ││
│  │  TOTAL                 125 SAR  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  ❌ Cancel Booking              ││  ← Secondary action
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠      📦      💬      👤        │
└─────────────────────────────────────┘
```

### Screen 5: Add Items

```
┌─────────────────────────────────────┐
│ ←  Add Items              5/5 kg   │  ← Weight tracker
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │  📦 Item 1                  ✏️  ││  ← Item card
│  │  ─────────────────────────────  ││
│  │  Winter jacket for brother      ││
│  │  👕 Clothing  •  1.5 kg        ││
│  │  Value: 150 SAR                 ││
│  │                                 ││
│  │  📷 ┌────┐ ┌────┐              ││  ← Photos
│  │     │    │ │    │              ││
│  │     └────┘ └────┘              ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  📦 Item 2                  ✏️  ││
│  │  ─────────────────────────────  ││
│  │  Gifts for family               ││
│  │  🎁 Gifts  •  2 kg             ││
│  │  Value: 200 SAR                 ││
│  │                                 ││
│  │  📷 ┌────┐ ┌────┐ ┌────┐       ││
│  │     │    │ │    │ │    │       ││
│  │     └────┘ └────┘ └────┘       ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │       ➕ Add Another Item       ││  ← Add more
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ⚠️ Remember:                       │  ← Guidelines
│  • Take clear photos of each item  │
│  • Declare accurate values         │
│  • No prohibited items             │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │  Items: 2  •  Weight: 3.5 kg   ││
│  │                                 ││
│  │     [ Submit for Approval ]     ││  ← CTA
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Screen 6: Chat Screen

```
┌─────────────────────────────────────┐
│ ← Ahmed A.              🔵 Online  │  ← Header with status
│   Booking #LS-X1Y2Z3               │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────┐        │
│  │ Hi! Thanks for booking │  14:30 │  ← Received message
│  │ with me. Looking       │        │
│  │ forward to helping!    │        │
│  └────────────────────────┘        │
│                                     │
│         ┌────────────────────────┐  │
│   14:32 │ Thank you Ahmed! I'm  │  │  ← Sent message
│         │ sending some gifts    │  │
│         │ for my family.        │  │
│         └────────────────────────┘  │
│                                     │
│  ┌────────────────────────┐        │
│  │ Great! Can you add the │  14:35 │
│  │ items with photos so   │        │
│  │ I can review them?     │        │
│  └────────────────────────┘        │
│                                     │
│         ┌────────────────────────┐  │
│   14:40 │ Done! I've added 2    │  │
│         │ items. Please check.  │  │
│         └────────────────────────┘  │
│                                     │
│  ┌────────────────────────┐        │
│  │ Perfect! All approved  │  14:45 │
│  │ ✅ Let's meet at       │        │
│  │ Terminal 1 Starbucks   │        │
│  │ at 12:00?              │        │
│  └────────────────────────┘        │
│                                     │
│  ┌────────────────────────┐        │
│  │ 📍 Location shared     │  14:46 │
│  │ ┌──────────────────┐   │        │
│  │ │   [Map Preview]  │   │        │
│  │ │   Starbucks T1   │   │        │
│  │ └──────────────────┘   │        │
│  └────────────────────────┘        │
│                                     │
│                    Ahmed is typing… │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 📷  📍  │  Type message...  ➤  ││  ← Input
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### Screen 38: Wallet Overview (Carrier)

```
┌─────────────────────────────────────┐
│ ←        المحفظة / Wallet          │  ← Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │         رصيدك الحالي            ││  ← "Your Current Balance"
│  │         Your Balance            ││
│  │                                 ││
│  │    ┌─────────────────────┐     ││
│  │    │   -7.50 SAR         │     ││  ← Balance Amount
│  │    │   ريال              │     ││
│  │    └─────────────────────┘     ││
│  │                                 ││
│  │    ━━━━━━━━━━━━━━━━━━━━━━━     ││  ← Progress bar
│  │    ██████████░░░░░░░░░░░░     ││     to threshold
│  │                                 ││
│  │    متاح قبل التقييد: 2.50 ريال  ││  ← "Available before restriction"
│  │    Available: 2.50 SAR          ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         💳 شحن الرصيد           ││  ← CTA "Top Up Balance"
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│  📊 آخر المعاملات / Recent          │  ← Section Header
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📤 رسوم عمولة / Commission      ││  ← Transaction Item
│  │ Booking LS-A1B2C3               ││
│  │ -5.00 SAR          28 Jan 2026  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📥 شحن رصيد / Top-up    ✅      ││
│  │ Bank Transfer                   ││
│  │ +50.00 SAR         27 Jan 2026  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📤 رسوم عمولة / Commission      ││
│  │ Booking LS-X7Y8Z9               ││
│  │ -3.50 SAR          25 Jan 2026  ││
│  └─────────────────────────────────┘│
│                                     │
│      عرض الكل / View All →          │
│                                     │
├─────────────────────────────────────┤
│  🏠     ✈️      💬      👤          │  ← Tab Bar
└─────────────────────────────────────┘
```

**Design Notes:**
- Balance shown prominently with color coding (green positive, red negative)
- Progress bar shows how close to restriction threshold
- Recent transactions with clear icons for type
- Arabic RTL layout supported

---

### Screen 39: Transaction History

```
┌─────────────────────────────────────┐
│ ←      سجل المعاملات               │  ← Header "Transaction History"
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │ الكل   عمولات   شحن   تعديلات  ││  ← Filter Tabs
│  │ All    Fees    Top-up  Adjust  ││
│  │ ───────────────────────────────││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  يناير 2026 / January 2026          │  ← Month Header
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📤 رسوم عمولة                   ││
│  │    Commission - LS-A1B2C3       ││
│  │    28 Jan, 10:00 AM             ││
│  │                       -5.00 SAR ││
│  │    الرصيد: -7.50 / Bal: -7.50  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📥 شحن رصيد        ✅ مكتمل     ││
│  │    Top-up - Bank Transfer       ││
│  │    27 Jan, 15:00 PM             ││
│  │                      +50.00 SAR ││
│  │    الرصيد: -2.50 / Bal: -2.50  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📤 رسوم عمولة                   ││
│  │    Commission - LS-X7Y8Z9       ││
│  │    25 Jan, 14:30 PM             ││
│  │                       -3.50 SAR ││
│  │    الرصيد: -52.50 / Bal: -52.50││
│  └─────────────────────────────────┘│
│                                     │
│  ديسمبر 2025 / December 2025        │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📥 شحن رصيد        ✅ مكتمل     ││
│  │    Top-up - Bank Transfer       ││
│  │    20 Dec, 09:15 AM             ││
│  │                      +30.00 SAR ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠     ✈️      💬      👤          │
└─────────────────────────────────────┘
```

---

### Screen 40: Top-Up Request

```
┌─────────────────────────────────────┐
│ ←       شحن الرصيد / Top Up        │  ← Header
├─────────────────────────────────────┤
│                                     │
│  الرصيد الحالي / Current Balance:   │
│  -15.00 SAR                         │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📋 تفاصيل الحساب البنكي            │  ← "Bank Account Details"
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🏦 مصرف الراجحي                 ││
│  │    Al Rajhi Bank                ││
│  │                                 ││
│  │    IBAN:                        ││
│  │    SA1234567890123456789012     ││
│  │                          📋    ││  ← Copy button
│  │                                 ││
│  │    اسم الحساب:                  ││
│  │    LuggageShare Platform        ││
│  └─────────────────────────────────┘│
│                                     │
│  ⓘ أضف رقم جوالك في ملاحظات        │  ← Instruction
│    التحويل                          │
│    Add your phone number in         │
│    transfer notes                   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  المبلغ / Amount:                   │
│  ┌─────────────────────────────────┐│
│  │ 15.00              SAR ريال    ││  ← Input (min 10 SAR)
│  └─────────────────────────────────┘│
│                                     │
│  إثبات التحويل / Payment Proof:     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │     📷 رفع صورة الإيصال         ││  ← Upload receipt
│  │        Upload Receipt           ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ملاحظات / Notes (optional):        │
│  ┌─────────────────────────────────┐│
│  │ Transferred from Al Rajhi...    ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │       ✓ إرسال طلب الشحن         ││  ← Submit CTA
│  │         Submit Top-Up           ││
│  └─────────────────────────────────┘│
│                                     │
│  ⓘ سيتم التحقق خلال 24 ساعة        │  ← "Verified within 24 hours"
│                                     │
└─────────────────────────────────────┘
```

**Design Notes:**
- Pre-filled with amount owed if user is restricted
- Bank details with easy copy functionality
- Clear instructions in both Arabic and English
- Photo upload for transfer receipt

---

### Screen 41: Account Restricted

```
┌─────────────────────────────────────┐
│                                     │  ← No back button (modal)
├─────────────────────────────────────┤
│                                     │
│                                     │
│           ⚠️                        │
│                                     │
│     الحساب مقيد مؤقتاً              │  ← "Account Temporarily Restricted"
│     Account Restricted              │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  رصيدك الحالي أقل من الحد المسموح   │  ← Explanation
│  Your balance is below the          │
│  allowed threshold.                 │
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │    الرصيد الحالي: -15.00 SAR   ││  ← Current balance
│  │    Current Balance              ││
│  │                                 ││
│  │    الحد المسموح: -10.00 SAR    ││  ← Threshold
│  │    Threshold                    ││
│  │                                 ││
│  │    ━━━━━━━━━━━━━━━━━━━━━━━     ││
│  │    المطلوب سداده: 5.00 SAR     ││  ← Amount needed
│  │    Amount Due                   ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ❌ لا يمكنك:                       │  ← "You cannot:"
│     • نشر عروض جديدة                │
│       Post new listings             │
│     • قبول طلبات الحجز             │
│       Accept booking requests       │
│                                     │
│  ✅ يمكنك:                          │  ← "You can:"
│     • إكمال الرحلات الحالية         │
│       Complete current trips        │
│     • التواصل مع المستخدمين         │
│       Message users                 │
│                                     │
│  ┌─────────────────────────────────┐│
│  │       💳 شحن الرصيد الآن         ││  ← Primary CTA
│  │          Top Up Now             ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │       📞 تواصل مع الدعم          ││  ← Secondary CTA
│  │          Contact Support        ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**Design Notes:**
- Modal/blocking screen - cannot dismiss without action
- Clear explanation of restrictions
- Shows exactly how much is needed to restore access
- Primary CTA to top-up, secondary for support

---

## 7. Design System

### Color Palette

```
┌─────────────────────────────────────────────────────────────┐
│                    COLOR PALETTE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PRIMARY                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ #1E3A5F  │ │ #2E5A8F  │ │ #4A7AB8  │ │ #7FA8D3  │        │
│  │ Primary  │ │ Primary  │ │ Primary  │ │ Primary  │        │
│  │ Dark     │ │ Default  │ │ Light    │ │ Lighter  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│  SECONDARY (Accent)                                          │
│  ┌──────────┐ ┌──────────┐                                  │
│  │ #E8B923  │ │ #F5D456  │  Gold/Yellow for CTAs            │
│  │ Accent   │ │ Accent   │                                  │
│  │ Default  │ │ Light    │                                  │
│  └──────────┘ └──────────┘                                  │
│                                                              │
│  SEMANTIC                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ #22C55E  │ │ #EF4444  │ │ #F59E0B  │ │ #3B82F6  │        │
│  │ Success  │ │ Error    │ │ Warning  │ │ Info     │        │
│  │ Green    │ │ Red      │ │ Orange   │ │ Blue     │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│  NEUTRALS                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ #0F172A  │ │ #334155  │ │ #64748B  │ │ #94A3B8  │        │
│  │ Gray 900 │ │ Gray 700 │ │ Gray 500 │ │ Gray 400 │        │
│  │ Text     │ │ Text Sec │ │ Text Ter │ │ Disabled │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ #CBD5E1  │ │ #E2E8F0  │ │ #F1F5F9  │ │ #FFFFFF  │        │
│  │ Gray 300 │ │ Gray 200 │ │ Gray 100 │ │ White    │        │
│  │ Border   │ │ Divider  │ │ BG Light │ │ BG       │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Typography

```
┌─────────────────────────────────────────────────────────────┐
│                    TYPOGRAPHY                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FONT FAMILIES                                               │
│  ─────────────                                               │
│  Arabic:  IBM Plex Sans Arabic (Google Fonts)                │
│  English: Inter (Google Fonts)                               │
│  Monospace: IBM Plex Mono                                    │
│                                                              │
│  TYPE SCALE                                                  │
│  ──────────                                                  │
│                                                              │
│  Display    32px / 40px LH / Bold                           │
│  أهلاً بك في حصتي                                            │
│  Welcome to LuggageShare                                     │
│                                                              │
│  H1         28px / 36px LH / Bold                           │
│  البحث عن رحلات                                              │
│  Search Trips                                                │
│                                                              │
│  H2         24px / 32px LH / SemiBold                       │
│  الرحلات المتاحة                                              │
│  Available Trips                                             │
│                                                              │
│  H3         20px / 28px LH / SemiBold                       │
│  تفاصيل الحجز                                                │
│  Booking Details                                             │
│                                                              │
│  Body Large 18px / 28px LH / Regular                        │
│  هذا النص للعرض فقط                                          │
│  This is sample body text                                    │
│                                                              │
│  Body       16px / 24px LH / Regular                        │
│  نص عادي للمحتوى                                             │
│  Regular body content                                        │
│                                                              │
│  Body Small 14px / 20px LH / Regular                        │
│  نص صغير للتفاصيل                                            │
│  Small text for details                                      │
│                                                              │
│  Caption    12px / 16px LH / Regular                        │
│  تسمية توضيحية                                               │
│  Caption text                                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Spacing System

```
4px  (xs)    - Tight spacing within components
8px  (sm)    - Default internal padding
12px (md)    - Between related elements
16px (lg)    - Standard spacing
24px (xl)    - Section spacing
32px (2xl)   - Large section breaks
48px (3xl)   - Page section breaks
```

### Border Radius

```
4px  (sm)    - Buttons, small inputs
8px  (md)    - Cards, inputs
12px (lg)    - Large cards, modals
16px (xl)    - Bottom sheets
Full (9999px) - Pills, avatars
```

---

## 8. Component Library

### Buttons

```
┌─────────────────────────────────────────────────────────────┐
│  PRIMARY BUTTON                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Request Booking                         │    │
│  │              طلب الحجز                               │    │
│  └─────────────────────────────────────────────────────┘    │
│  BG: Primary Blue  |  Text: White  |  Radius: 8px           │
│  Height: 48px (mobile) / 44px (web)                         │
│                                                              │
│  SECONDARY BUTTON                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              View Details                            │    │
│  └─────────────────────────────────────────────────────┘    │
│  BG: Transparent  |  Border: Primary  |  Text: Primary      │
│                                                              │
│  GHOST BUTTON                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Cancel                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│  BG: Transparent  |  Text: Gray 700                         │
│                                                              │
│  ICON BUTTON                                                 │
│  ┌────┐  ┌────┐  ┌────┐                                    │
│  │ ← │  │ ♡ │  │ ⚙️ │                                    │
│  └────┘  └────┘  └────┘                                    │
│  Size: 40×40px  |  Radius: Full                             │
└─────────────────────────────────────────────────────────────┘
```

### Cards

```
┌─────────────────────────────────────────────────────────────┐
│  LISTING CARD                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ┌────┐                                             │    │
│  │  │ 👤 │  Ahmed A.              ⭐ 4.8 (45)         │    │
│  │  │    │  ✅ Verified                               │    │
│  │  └────┘                                             │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  ✈️ SV123  •  Feb 15  •  14:30                     │    │
│  │  RUH → CAI                                          │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  18 kg available          25 SAR/kg                │    │
│  │                                                     │    │
│  │  👕 👜 🎁                  [ View Details ]        │    │
│  └─────────────────────────────────────────────────────┘    │
│  BG: White  |  Border: Gray 200  |  Radius: 12px            │
│  Shadow: 0 2px 8px rgba(0,0,0,0.08)                         │
└─────────────────────────────────────────────────────────────┘
```

### Input Fields

```
┌─────────────────────────────────────────────────────────────┐
│  TEXT INPUT                                                  │
│                                                              │
│  رقم الرحلة                                                  │
│  Flight Number                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✈️  SV123                                           │    │
│  └─────────────────────────────────────────────────────┘    │
│  Height: 48px  |  Padding: 16px  |  Radius: 8px             │
│                                                              │
│  ERROR STATE                                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✈️  SV                                     ⚠️      │    │
│  └─────────────────────────────────────────────────────┘    │
│  رقم الرحلة غير صحيح                                        │
│  Invalid flight number                                       │
│  Border: Error Red                                          │
│                                                              │
│  SEARCH INPUT                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔍  Search...                                       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Status Badges

```
┌─────────────────────────────────────────────────────────────┐
│  VERIFICATION BADGE                                          │
│  ┌──────────────┐                                           │
│  │ ✅ Verified  │  BG: Green 100  |  Text: Green 700        │
│  └──────────────┘                                           │
│                                                              │
│  STATUS BADGES                                               │
│  ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐     │
│  │ Pending  │ │ Accepted  │ │ Completed │ │ Cancelled│     │
│  └──────────┘ └───────────┘ └───────────┘ └──────────┘     │
│  Yellow BG    Green BG      Blue BG       Red BG           │
│                                                              │
│  ITEM TYPE BADGES                                            │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │
│  │ 👕 │ │ 📄 │ │ 🎁 │ │ 📱 │ │ 📦 │                        │
│  └────┘ └────┘ └────┘ └────┘ └────┘                        │
│  Clothes Docs  Gifts  Elec  Other                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Accessibility

### Requirements (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|----------------|
| **Color Contrast** | Minimum 4.5:1 for text, 3:1 for large text |
| **Touch Targets** | Minimum 44×44px for all interactive elements |
| **Focus States** | Visible focus ring on all interactive elements |
| **Screen Readers** | All images have alt text, form labels |
| **RTL Support** | Full RTL layout for Arabic |
| **Font Scaling** | Support up to 200% text scaling |

### RTL Considerations

```
┌─────────────────────────────────────────────────────────────┐
│  LTR (English)                 RTL (Arabic)                 │
│  ─────────────                 ────────────                 │
│  ┌─────────────────┐           ┌─────────────────┐         │
│  │ 👤 Ahmed  ⭐4.8 │           │ 4.8⭐  أحمد 👤 │         │
│  │ ✅ Verified     │           │     موثق ✅   │         │
│  │ [ View → ]      │           │      [ ← عرض ] │         │
│  └─────────────────┘           └─────────────────┘         │
│                                                              │
│  - Icons flip where semantically appropriate                │
│  - Navigation arrows flip                                   │
│  - Text alignment flips                                     │
│  - Shadows may flip                                         │
│  - Progress bars fill from right                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Animations & Micro-interactions

### Transition Durations

```
Fast:     150ms  - Button hover, toggle
Normal:   250ms  - Card interactions, page elements
Slow:     350ms  - Modal open/close, page transitions
```

### Key Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Button press | Scale to 0.98 | 150ms | ease-out |
| Card tap | Slight lift + shadow | 200ms | ease-in-out |
| Modal open | Fade + slide up | 300ms | ease-out |
| Tab switch | Indicator slide | 250ms | ease-in-out |
| Pull to refresh | Rotate spinner | 1000ms | linear |
| Success | Checkmark draw | 400ms | ease-out |
| Page transition | Slide + fade | 300ms | ease-in-out |

### Success Celebrations

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ┌─────────────┐                         │
│                     │             │                         │
│                     │     ✅      │  ← Animated checkmark   │
│                     │             │    with scale bounce    │
│                     └─────────────┘                         │
│                                                              │
│               Booking Confirmed!                             │
│               تم تأكيد الحجز!                                │
│                                                              │
│          🎉 Confetti animation (subtle)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Figma Resources

### Recommended Setup

```
Figma File Structure:
├── 📁 Cover
├── 📁 Design System
│   ├── Colors
│   ├── Typography
│   ├── Icons
│   ├── Components
│   └── Patterns
├── 📁 Wireframes
│   ├── User Flows
│   └── Lo-Fi Screens
├── 📁 Screens
│   ├── Onboarding
│   ├── Home
│   ├── Listings
│   ├── Bookings
│   ├── Messages
│   └── Profile
├── 📁 Prototypes
└── 📁 Handoff
```

### Figma Plugins Recommended

1. **Stark** - Accessibility checker
2. **RTL Support** - Mirror designs for RTL
3. **Iconify** - Icon library
4. **Content Reel** - Arabic placeholder text
5. **Autoflow** - User flow diagrams

---

*UI/UX Specification v1.0*
*Last Updated: January 2026*
