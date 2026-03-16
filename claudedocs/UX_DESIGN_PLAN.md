# LuggageShare UX Design Plan

**Created**: 2026-03-02
**Style**: Premium Minimal (Apple/Airbnb quality)
**Flow Model**: Typeform-style one-question-at-a-time wizard
**Matching**: Browse & Request (Airbnb model)
**Animations**: Full — transitions, celebrations, micro-interactions, status progress

---

## 1. Design System Foundation

### 1.1 Color Palette

```
Primary:       #2E5A8F  (Navy Blue — trust, reliability)
Primary Light: #4A7BB5  (Hover/active states)
Primary Dark:  #1E3D62  (Headers, dark text)

Success:       #10B981  (Emerald — confirmations, online)
Warning:       #F59E0B  (Amber — pending states)
Error:         #EF4444  (Red — errors, cancellations)
Info:          #3B82F6  (Blue — informational badges)

Background:    #FFFFFF  (Primary)
Surface:       #F9FAFB  (Cards, input backgrounds)
Border:        #E5E7EB  (Subtle dividers)

Text Primary:  #111827  (Near black — headings)
Text Secondary:#6B7280  (Gray — descriptions)
Text Muted:    #9CA3AF  (Placeholders)
```

### 1.2 Typography

```
English:       System (SF Pro on iOS, Roboto on Android)
Arabic:        IBM Plex Arabic (installed via expo-font)

Heading 1:     28px / Bold / line-height 1.3
Heading 2:     22px / SemiBold / line-height 1.35
Heading 3:     18px / SemiBold / line-height 1.4
Body:          16px / Regular / line-height 1.5
Caption:       14px / Regular / line-height 1.5
Small:         12px / Regular / line-height 1.4

Arabic Adjustments:
  - +2px font size for all levels
  - line-height 1.7x (Arabic needs more vertical space)
  - Use Regular weight where English uses SemiBold
```

### 1.3 Spacing & Radius

```
Spacing:       4, 8, 12, 16, 20, 24, 32, 40, 48, 64
Card Radius:   16px
Button Radius: 12px
Input Radius:  12px
Badge Radius:  20px (pill shape)
Avatar Radius: 50% (circle)
```

### 1.4 Shadows

```
Shadow S:      0 1px 2px rgba(0,0,0,0.05)         — inputs, subtle cards
Shadow M:      0 4px 6px -1px rgba(0,0,0,0.07)     — cards, elevated elements
Shadow L:      0 10px 15px -3px rgba(0,0,0,0.08)    — modals, bottom sheets
Shadow XL:     0 20px 25px -5px rgba(0,0,0,0.10)    — dropdowns, overlays
```

---

## 2. Animation Specifications

### 2.1 Core Animation Config (Reanimated)

```typescript
// Shared animation presets
export const ANIM = {
  // Spring configs
  spring: {
    gentle:  { damping: 20, stiffness: 150, mass: 1 },
    bouncy:  { damping: 12, stiffness: 180, mass: 0.8 },
    snappy:  { damping: 15, stiffness: 300, mass: 0.5 },
  },
  // Timing configs
  timing: {
    fast:    { duration: 150, easing: Easing.ease },
    normal:  { duration: 250, easing: Easing.inOut(Easing.ease) },
    slow:    { duration: 400, easing: Easing.inOut(Easing.ease) },
  },
  // Standard values
  pressScale: 0.97,
  cardScale:  1.02,
  fadeIn:     { from: 0, to: 1, duration: 200 },
  slideUp:    { from: 50, to: 0, duration: 300 },
};
```

### 2.2 Page Transitions

| Transition | Animation | Duration | Easing |
|-----------|-----------|----------|--------|
| Stack push | Slide from right (LTR) / left (RTL) | 300ms | spring.gentle |
| Modal present | Slide from bottom | 350ms | spring.bouncy |
| Modal dismiss | Slide down + fade | 250ms | timing.normal |
| Tab switch | Crossfade | 200ms | timing.fast |
| Wizard next | Current slides up + fades out, next slides up + fades in | 300ms | spring.gentle |
| Wizard back | Reverse of next | 250ms | timing.normal |

### 2.3 Micro-Interactions

| Element | Trigger | Animation |
|---------|---------|-----------|
| Button press | onPressIn | Scale to 0.97, darken bg 5% |
| Button release | onPressOut | Spring back to 1.0 |
| Card press | onPressIn | Scale to 0.98, elevate shadow |
| Card release | onPressOut | Spring back to 1.0 |
| Input focus | onFocus | Border color transition to primary (200ms) |
| Input error | validation fail | Horizontal shake (3x oscillation, 150ms) |
| Toggle switch | onPress | Thumb slides with spring.snappy |
| Checkbox | onPress | Scale pop from 0→1.2→1.0 with checkmark draw |
| Pull to refresh | onPull | Custom airplane animation rotating |
| Skeleton loader | loading state | Shimmer gradient left→right (1.5s loop) |
| Number change | value update | Count-up / count-down over 400ms |

### 2.4 Success Celebrations

| Event | Animation | Implementation |
|-------|-----------|----------------|
| Listing created | Checkmark draw (circle + check) → confetti burst | Lottie: `listing-created.json` |
| Booking confirmed | Airplane flies across screen → success card slides up | Lottie: `booking-confirmed.json` |
| Delivery complete | Package opens → star burst → rating prompt slides in | Lottie: `delivery-complete.json` |
| Payment sent | Coins flow animation → "Sent!" text scale pop | Lottie: `payment-sent.json` |
| Review submitted | Stars fill → thank you message | Lottie: `review-submitted.json` |
| Profile verified | Shield animation with checkmark | Lottie: `verified.json` |

### 2.5 Status / Progress Animations

| Element | Animation |
|---------|-----------|
| Booking timeline stepper | Active dot pulses (scale 1.0→1.3→1.0, 2s loop). Completed segments fill with color sweep left→right. |
| Progress bar (wizard) | Smooth width transition (300ms ease-in-out) on step change |
| Loading state | Skeleton shimmer (gray gradient sweep, 1.5s infinite) |
| Real-time status | "Live" dot pulses green (opacity 0.5→1.0, 1s loop) |
| Countdown timer | Number rolls down (digit transition like an odometer) |
| Weight slider | Suitcase icon scales with value (small→large interpolation) |

---

## 3. Wizard Flow: Create Listing (Carrier)

**Total screens: 6** | **Estimated time: 45 seconds**

### Screen 1: Route
```
┌─────────────────────────────┐
│  ━━━━━━░░░░░░░░░░ Step 1/6  │
│                              │
│  ✈️                          │
│  Where are you               │
│  traveling?                  │
│                              │
│  ┌─────────────────────────┐ │
│  │ 🛫 From                 │ │
│  │ ┌─────────────────────┐ │ │
│  │ │ Search city...      │ │ │
│  │ └─────────────────────┘ │ │
│  │                         │ │
│  │ 🛬 To                   │ │
│  │ ┌─────────────────────┐ │ │
│  │ │ Search city...      │ │ │
│  │ └─────────────────────┘ │ │
│  └─────────────────────────┘ │
│                              │
│  Popular Routes:             │
│  [Riyadh→Jeddah] [RUH→DXB]  │
│  [Jeddah→Cairo] [RUH→AMM]   │
│                              │
│  ┌─────────────────────────┐ │
│  │        Next →           │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

**Animations**:
- City search: Results slide in as user types (staggered 50ms delay per item)
- Popular route chips: Fade in with stagger on mount
- "Next" button: Appears with slide-up when both cities are filled

### Screen 2: Date & Flight
```
┌─────────────────────────────┐
│  ━━━━━━━━━░░░░░░░ Step 2/6  │
│                              │
│  📅                          │
│  When are you                │
│  traveling?                  │
│                              │
│  ┌─────────────────────────┐ │
│  │  < March 2026 >        │ │
│  │  Su Mo Tu We Th Fr Sa  │ │
│  │      1  2  3  4  5  6  │ │
│  │   7  8  9 10 11 12 13  │ │
│  │  14 [15] 16 17 18 19 20│ │
│  │  21 22 23 24 25 26 27  │ │
│  │  28 29 30 31           │ │
│  └─────────────────────────┘ │
│                              │
│  Flight number (optional)    │
│  ┌─────────────────────────┐ │
│  │ SV 123                  │ │
│  └─────────────────────────┘ │
│                              │
│  [← Back]       [Next →]    │
└─────────────────────────────┘
```

**Animations**:
- Calendar: Selected date gets a circle scale pop (0→1) with primary color fill
- Past dates: Grayed out with cross-hatch opacity
- Flight number input: Airplane icon micro-rotates on focus

### Screen 3: Available Weight
```
┌─────────────────────────────┐
│  ━━━━━━━━━━━━░░░░ Step 3/6  │
│                              │
│  ⚖️                          │
│  How much weight             │
│  can you carry?              │
│                              │
│         🧳                   │
│    (suitcase scales with     │
│     slider value)            │
│                              │
│  ┌─────────────────────────┐ │
│  │ ●━━━━━━━━━━━━○         │ │
│  │      5.0 kg             │ │
│  └─────────────────────────┘ │
│                              │
│  Quick select:               │
│  [ 2kg ] [ 5kg ] [10kg]     │
│  [15kg ] [20kg ] [23kg]     │
│                              │
│  💡 Average carry: 5-10kg    │
│                              │
│  [← Back]       [Next →]    │
└─────────────────────────────┘
```

**Animations**:
- Suitcase icon: Interpolates size with slider (small at 1kg → large at 23kg)
- Slider thumb: Spring physics on drag
- Quick select chips: Selected chip scales to 1.05 with border color change
- Hint text: Fades in after 1s delay

### Screen 4: Pricing
```
┌─────────────────────────────┐
│  ━━━━━━━━━━━━━━━░ Step 4/6  │
│                              │
│  💰                          │
│  Set your price              │
│  per kilogram                │
│                              │
│  ┌─────────────────────────┐ │
│  │                         │ │
│  │      SAR  15            │ │
│  │      ─────              │ │
│  │      per kg             │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
│  ┌─────────────────────────┐ │
│  │  [-]  ━━━━●━━━━━  [+]  │ │
│  └─────────────────────────┘ │
│                              │
│  📊 Average: SAR 12-20/kg    │
│  💡 Estimated total:         │
│     SAR 75 (for 5kg)        │
│                              │
│  Currency: [SAR ▼]          │
│                              │
│  [← Back]       [Next →]    │
└─────────────────────────────┘
```

**Animations**:
- Price number: Count-up/down animation (odometer style) as slider moves
- Estimated total: Recalculates with number roll effect
- Average range: Subtle highlight pulse when price is within range

### Screen 5: Preferences (Optional)
```
┌─────────────────────────────┐
│  ━━━━━━━━━━━━━━━━░ Step 5/6 │
│                              │
│  📦                          │
│  What can you                │
│  carry?                      │
│                              │
│  Tap all that apply:         │
│                              │
│  ┌───────────┐ ┌───────────┐│
│  │ 📄        │ │ 👗        ││
│  │ Documents │ │ Clothing  ││
│  │     ✓     │ │           ││
│  └───────────┘ └───────────┘│
│  ┌───────────┐ ┌───────────┐│
│  │ 📱        │ │ 🎁        ││
│  │Electronics│ │ Gifts     ││
│  │           │ │     ✓     ││
│  └───────────┘ └───────────┘│
│  ┌───────────┐ ┌───────────┐│
│  │ 💊        │ │ 🍫        ││
│  │ Medicine  │ │ Food/     ││
│  │           │ │ Snacks    ││
│  └───────────┘ └───────────┘│
│                              │
│  Notes (optional):           │
│  ┌─────────────────────────┐ │
│  │ No liquids please...   │ │
│  └─────────────────────────┘ │
│                              │
│  [← Back]       [Next →]    │
│          Skip →              │
└─────────────────────────────┘
```

**Animations**:
- Category cards: Checkmark pops in (scale 0→1.2→1.0) on select
- Selected card: Border color + subtle background tint transition
- Grid mount: Staggered fade-in (50ms delay per card)

### Screen 6: Review & Publish
```
┌─────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━ Step 6/6 │
│                              │
│  ✨                          │
│  Review your                 │
│  listing                     │
│                              │
│  ┌─────────────────────────┐ │
│  │  ✈️ Riyadh → Jeddah     │ │
│  │  📅 March 15, 2026      │ │
│  │  🛫 SV 123              │ │
│  │  ⚖️  5.0 kg available    │ │
│  │  💰 SAR 15/kg           │ │
│  │  📦 Documents, Gifts    │ │
│  │                  [Edit] │ │
│  └─────────────────────────┘ │
│                              │
│  Estimated earnings:         │
│  ┌─────────────────────────┐ │
│  │     SAR 75.00           │ │
│  │  (if fully booked)      │ │
│  └─────────────────────────┘ │
│                              │
│  ┌─────────────────────────┐ │
│  │   ✈️ Publish Listing    │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

**Animations**:
- Summary card: Slides up with staggered line items (50ms each)
- Earnings: Number count-up animation from 0 to final value
- "Publish" button: Gentle pulse animation (scale 1.0→1.02→1.0, 3s loop) to draw attention
- On publish: Full-screen Lottie celebration (airplane + confetti, 2s)

---

## 4. Wizard Flow: Create Booking (Sender)

**Total screens: 5** | **Estimated time: 30 seconds**

Context: Sender is viewing a carrier's listing and taps "Book Now"

### Screen 1: Item Details
```
┌─────────────────────────────┐
│  ━━━━━░░░░░░░░░░░ Step 1/5  │
│                              │
│  📦                          │
│  What are you                │
│  sending?                    │
│                              │
│  Item name:                  │
│  ┌─────────────────────────┐ │
│  │ iPhone 15 Pro Max       │ │
│  └─────────────────────────┘ │
│                              │
│  Category:                   │
│  [📱 Electronics] [👗 Cloth] │
│  [📄 Docs] [🎁 Gift]        │
│  [💊 Medicine] [Other]       │
│                              │
│  Description (optional):     │
│  ┌─────────────────────────┐ │
│  │ New, sealed in box...   │ │
│  └─────────────────────────┘ │
│                              │
│  [Next →]                    │
└─────────────────────────────┘
```

### Screen 2: Weight & Value
```
┌─────────────────────────────┐
│  ━━━━━━━━░░░░░░░░ Step 2/5  │
│                              │
│  ⚖️                          │
│  How heavy is                │
│  your item?                  │
│                              │
│  Visual size picker:         │
│  ┌────┐ ┌─────┐ ┌──────┐   │
│  │ 📨 │ │ 📦  │ │ 📦📦 │   │
│  │Enve│ │Small│ │Medium│    │
│  │lope│ │ Box │ │ Box  │    │
│  │<1kg│ │1-3kg│ │3-7kg │    │
│  └────┘ └─────┘ └──────┘   │
│                              │
│  Exact weight: [ 2.5 ] kg   │
│                              │
│  Declared value:             │
│  [ SAR ] [ 4,500 ]          │
│  (for insurance purposes)    │
│                              │
│  [← Back]       [Next →]    │
└─────────────────────────────┘
```

**Animations**:
- Size cards: Selected card lifts (translateY -4px) + border color + scale 1.03
- Weight auto-fills from size selection, number rolls to estimated value
- Package illustrations animate (small bounce) on selection

### Screen 3: Photos
```
┌─────────────────────────────┐
│  ━━━━━━━━━━━━░░░░ Step 3/5  │
│                              │
│  📸                          │
│  Add photos of               │
│  your item                   │
│                              │
│  ┌─────┐ ┌─────┐ ┌─────┐   │
│  │     │ │     │ │  +  │   │
│  │ 📷  │ │ 📷  │ │ Add │   │
│  │     │ │     │ │     │   │
│  └─────┘ └─────┘ └─────┘   │
│                              │
│  💡 Clear photos help        │
│     carriers feel confident  │
│                              │
│  [← Back]       [Next →]    │
│          Skip →              │
└─────────────────────────────┘
```

**Animations**:
- Photo upload: Progress circle animation around thumbnail
- Photo added: Scale pop from 0.8→1.0 with fade in
- Remove photo: Scale down + fade out (200ms)

### Screen 4: Pickup Details
```
┌─────────────────────────────┐
│  ━━━━━━━━━━━━━━━░ Step 4/5  │
│                              │
│  📍                          │
│  Where should the            │
│  carrier pick up?            │
│                              │
│  ┌─────────────────────────┐ │
│  │                         │ │
│  │      [ 📍 Map ]         │ │
│  │      Drop pin on map    │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
│  Or describe meeting point:  │
│  ┌─────────────────────────┐ │
│  │ King Khalid Airport,    │ │
│  │ Terminal 1, Gate 3      │ │
│  └─────────────────────────┘ │
│                              │
│  [← Back]       [Next →]    │
└─────────────────────────────┘
```

### Screen 5: Review & Book
```
┌─────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━ Step 5/5 │
│                              │
│  ✨                          │
│  Review your                 │
│  booking                     │
│                              │
│  Carrier:                    │
│  ┌─────────────────────────┐ │
│  │ 👤 Ahmed M.  ⭐4.8 ✓   │ │
│  │ ✈️ RUH → JED  Mar 15    │ │
│  └─────────────────────────┘ │
│                              │
│  Your item:                  │
│  ┌─────────────────────────┐ │
│  │ 📱 iPhone 15 Pro Max    │ │
│  │ ⚖️  0.5 kg               │ │
│  │ 📍 Airport T1, Gate 3   │ │
│  └─────────────────────────┘ │
│                              │
│  Price breakdown:            │
│  ┌─────────────────────────┐ │
│  │ 0.5 kg × SAR 15    7.50│ │
│  │ Service fee          1.50│ │
│  │ ───────────────────────│ │
│  │ Total           SAR 9.00│ │
│  └─────────────────────────┘ │
│                              │
│  ┌─────────────────────────┐ │
│  │  📦 Confirm Booking     │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

**Animations**:
- Price breakdown: Lines appear with stagger (100ms each), total has count-up
- On confirm: Full-screen Lottie celebration (package + checkmark, 2s)
- Then auto-navigates to booking detail page

---

## 5. Card Designs

### 5.1 Listing Card (Home Feed)

```
┌─────────────────────────────────┐
│  👤 Ahmed M.  ⭐4.8  ✓ Verified│
│                                 │
│  ✈️ Riyadh → Jeddah             │
│  📅 Mar 15, 2026   🛫 SV 123   │
│                                 │
│  ┌──────────────────┐ ┌──────┐ │
│  │ ⚖️ 5.0 kg avail. │ │ SAR  │ │
│  │                  │ │  15  │ │
│  │                  │ │ /kg  │ │
│  └──────────────────┘ └──────┘ │
│                                 │
│  📦 Documents, Gifts, Clothing  │
│                                 │
│  ┌─────────────────────────────┐│
│  │       Book Now              ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

**Animations**:
- Card mount: Fade in + slide up (staggered 100ms in list)
- Card press: Scale 0.98 + shadow elevation
- Verified badge: Subtle shimmer on first view
- "Book Now" button: Appears with slide-up when card is fully visible

### 5.2 Booking / Trip Card

```
┌─────────────────────────────────┐
│  ✈️ Riyadh → Jeddah             │
│  📅 Mar 15   👤 Ahmed M.        │
│                                 │
│  Status:                        │
│  ●━━━━━●━━━━━●━━━━━○━━━━━○     │
│  Booked  Paid  Picked  Transit  │
│          up                     │
│                                 │
│  📦 iPhone 15 Pro Max           │
│  ⚖️ 0.5 kg  💰 SAR 9.00        │
│                                 │
│  ┌────────────┐ ┌─────────────┐ │
│  │ 💬 Chat   │ │ View Detail │ │
│  └────────────┘ └─────────────┘ │
└─────────────────────────────────┘
```

**Animations**:
- Status stepper: Completed dots have fill animation (left→right color sweep)
- Active step: Pulsing dot (scale 1.0→1.3→1.0, 2s loop)
- Progress line: Animated dash pattern flowing toward next step

---

## 6. Key Screen Redesigns

### 6.1 Home Screen (Marketplace)

```
┌──────────────────────────────────┐
│  ┌──────────────────────────┐    │
│  │  LuggageShare      🔔 👤│    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ 🔍 Where to send?       │    │
│  └──────────────────────────┘    │
│                                  │
│  [📤 Send items] [📥 Carry items]│
│                                  │
│  ── Available Carriers ──        │
│                                  │
│  [🗺️ Map] [📋 List]  Sort ▼     │
│                                  │
│  ┌──────────────────────────┐    │
│  │  Card 1                  │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │  Card 2                  │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │  Card 3                  │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │  + Create Listing  (FAB)│    │
│  └──────────────────────────┘    │
│                                  │
│  [🏠Home] [✈️Trips] [💬Chat] [👤]│
└──────────────────────────────────┘
```

**Animations**:
- Search bar: Expands with spring on tap → full-screen search overlay
- Tab toggle (Send/Carry): Underline slides with spring.snappy
- Cards: Staggered fade-in on load, skeleton shimmer while loading
- FAB: Scale-in on mount (0→1 with spring.bouncy)
- Map/List toggle: Crossfade transition (200ms)
- Pull to refresh: Custom airplane animation that rotates and flies up

### 6.2 Booking Detail (Status Tracking)

```
┌──────────────────────────────────┐
│  [← Back]     Booking #A4F2     │
│                                  │
│  ┌──────────────────────────┐    │
│  │  ✈️ Riyadh → Jeddah      │    │
│  │  📅 March 15, 2026       │    │
│  └──────────────────────────┘    │
│                                  │
│  ── Status Timeline ──           │
│                                  │
│  ● Booking Created    Feb 28     │
│  │  Waiting for carrier...       │
│  │                               │
│  ● Accepted           Mar 1      │
│  │  Ahmed confirmed your booking │
│  │                               │
│  ● Payment Confirmed  Mar 5      │
│  │  SAR 9.00 received            │
│  │                               │
│  ◉ Picked Up          Mar 15     │
│  ┆  Item collected at airport    │
│  ┆                               │
│  ○ In Transit                    │
│  ┆                               │
│  ○ Delivered                     │
│                                  │
│  ── Carrier ──                   │
│  ┌──────────────────────────┐    │
│  │ 👤 Ahmed M.  ⭐4.8  ✓   │    │
│  │ [💬 Message] [📞 Call]   │    │
│  └──────────────────────────┘    │
│                                  │
│  ── Item ──                      │
│  ┌──────────────────────────┐    │
│  │ 📱 iPhone 15 Pro Max     │    │
│  │ ⚖️ 0.5 kg  💰 SAR 9.00   │    │
│  │ [📷 Photo] [📷 Photo]    │    │
│  └──────────────────────────┘    │
└──────────────────────────────────┘
```

**Animations**:
- Timeline: Completed steps fill sequentially on mount (200ms each)
- Active step: Green pulsing dot + "Live" indicator
- Future steps: Subtle fade (opacity 0.4)
- Photo thumbnails: Scale pop on mount

---

## 7. Lottie Animation Inventory

Create or source these Lottie animations:

| Animation | File | Usage | Duration | Loop |
|-----------|------|-------|----------|------|
| Airplane flying | `airplane-flight.json` | Pull-to-refresh, loading | 2s | yes |
| Listing created | `listing-created.json` | After publish | 2.5s | no |
| Booking confirmed | `booking-confirmed.json` | After booking | 2s | no |
| Delivery complete | `delivery-complete.json` | Status = delivered | 3s | no |
| Payment sent | `payment-sent.json` | Payment confirmation | 1.5s | no |
| Review submitted | `review-stars.json` | After review | 2s | no |
| Profile verified | `shield-verified.json` | Verification success | 1.5s | no |
| Empty state - no listings | `empty-suitcase.json` | Empty search results | 3s | yes |
| Empty state - no messages | `empty-chat.json` | No messages yet | 3s | yes |
| Empty state - no trips | `empty-plane.json` | No bookings | 3s | yes |
| Searching/matching | `radar-search.json` | Finding carriers | 2s | yes |
| Skeleton shimmer | `shimmer.json` | OR use Reanimated | 1.5s | yes |
| Confetti burst | `confetti.json` | Success celebrations | 2s | no |
| Typing indicator | `typing-dots.json` | Chat typing state | 1s | yes |

**Source**: [LottieFiles.com](https://lottiefiles.com) — search "airplane", "delivery", "package", "confetti", "success"

---

## 8. Trust & Safety UI Elements

### 8.1 Verification Badge System

| Badge | Criteria | Icon | Color |
|-------|----------|------|-------|
| Email Verified | Email confirmed | ✉️ | Gray |
| Phone Verified | SMS verified | 📱 | Gray |
| ID Verified | Government ID uploaded | 🪪 | Blue |
| Trusted Carrier | 5+ successful deliveries | ⭐ | Gold |
| Super Carrier | 20+ deliveries, 4.8+ rating | 🏆 | Gold gradient |

### 8.2 Avatar Badge Display

```
  ┌─────┐
  │     │ ← User avatar (circle, 48px)
  │ 👤  │
  │     │
  └──✓──┘ ← Verification badge overlay (bottom-right, 16px circle)
           Blue checkmark = ID verified
           Gold star = Trusted/Super carrier
```

### 8.3 Review Display Pattern

```
┌─────────────────────────────────┐
│  ⭐ 4.8  (24 reviews)           │
│                                  │
│  Communication  ████████░░  4.5  │
│  Punctuality    █████████░  4.8  │
│  Item Care      █████████░  4.9  │
│  Reliability    ████████░░  4.6  │
│                                  │
│  ── Recent Reviews ──            │
│  ┌──────────────────────────┐    │
│  │ 👤 Sara K.  ⭐⭐⭐⭐⭐     │    │
│  │ "Very reliable, item     │    │
│  │  arrived in perfect..."  │    │
│  │ 2 weeks ago              │    │
│  └──────────────────────────┘    │
└─────────────────────────────────┘
```

**Animations**:
- Rating bars: Fill from 0% to actual value (staggered, 150ms each)
- Star rating: Stars pop in sequentially (100ms stagger)
- Review cards: Fade in on scroll visibility

---

## 9. RTL Considerations

### 9.1 What to Mirror (Arabic mode)
- Navigation arrows → flip direction
- Slide transitions → from left instead of right
- Progress bars → fill right-to-left
- Text alignment → right-aligned
- Timeline dots → move to right side
- FAB position → bottom-left
- Chat bubbles → swap sides
- Swipe gestures → reverse direction
- Wizard slide direction → reverse

### 9.2 What NOT to Mirror
- Tab bar icons → keep centered
- Map content → never mirror
- Numbers/prices → keep left-to-right (Western numerals)
- Media controls (play/pause)
- Checkmarks, stars, hearts
- Brand logo/name

### 9.3 Arabic Typography
- Use IBM Plex Arabic as primary
- All font sizes +2px vs English
- Line height: 1.7x (vs 1.5x English)
- Use Regular weight where English uses SemiBold

---

## 10. Implementation Priority

### Phase 1: Core Wizard Flows (Highest Impact)
1. Create Listing wizard (6 screens)
2. Create Booking wizard (5 screens)
3. Shared `WizardContainer` component with progress bar + transitions
4. Shared animation presets module

### Phase 2: Card & List Redesign
5. New ListingCard component with updated design
6. New TripCard/BookingCard with status stepper
7. Skeleton loading components
8. Pull-to-refresh animation

### Phase 3: Celebrations & Feedback
9. Lottie integration + animation files
10. Success celebration screens
11. Empty state illustrations
12. Micro-interactions (button press, input focus, toggle)

### Phase 4: Status & Trust
13. Booking detail timeline redesign
14. Verification badge system
15. Review display with category bars
16. Profile completeness indicator

### Phase 5: Polish
17. Shared element transitions (card → detail)
18. RTL animation adjustments
19. Dark mode support for all new components
20. Performance optimization (shouldComponentUpdate, useMemo for animations)

---

## 11. Technical Dependencies

```bash
# Already installed
expo-router          # Navigation
react-native-reanimated  # Animations
@tanstack/react-query    # Data fetching

# Need to install
lottie-react-native      # Lottie animations
@gorhom/bottom-sheet     # Bottom sheets with spring physics
react-native-gesture-handler  # Should already be installed via expo

# Consider for Phase 5
react-native-shared-element  # Shared element transitions
```

---

## 12. File Structure for New Components

```
apps/mobile/
├── components/
│   ├── wizard/
│   │   ├── WizardContainer.tsx     # Progress bar + step transitions
│   │   ├── WizardStep.tsx          # Single step wrapper with animation
│   │   ├── WizardProgress.tsx      # Animated progress bar
│   │   ├── QuestionTitle.tsx       # Emoji + heading + subtitle
│   │   ├── OptionGrid.tsx          # Tappable card grid
│   │   ├── OptionChips.tsx         # Horizontal chip selector
│   │   └── index.ts
│   ├── animations/
│   │   ├── AnimatedButton.tsx      # Press scale + haptics
│   │   ├── AnimatedCard.tsx        # Press scale + shadow
│   │   ├── SkeletonLoader.tsx      # Shimmer effect
│   │   ├── SuccessCelebration.tsx  # Full-screen Lottie overlay
│   │   ├── CountUpText.tsx         # Animated number counter
│   │   ├── StaggeredList.tsx       # FlatList with staggered item entry
│   │   └── index.ts
│   ├── status/
│   │   ├── StatusTimeline.tsx      # Animated vertical timeline
│   │   ├── StatusStepper.tsx       # Horizontal dot stepper
│   │   ├── LiveIndicator.tsx       # Pulsing green dot
│   │   └── index.ts
│   └── trust/
│       ├── VerificationBadge.tsx   # Badge overlay on avatar
│       ├── RatingBars.tsx          # Category rating bar chart
│       ├── ReviewCard.tsx          # Individual review display
│       └── index.ts
├── lib/
│   └── animations.ts              # Shared animation presets (ANIM config)
└── assets/
    └── lottie/
        ├── airplane-flight.json
        ├── listing-created.json
        ├── booking-confirmed.json
        ├── delivery-complete.json
        ├── confetti.json
        ├── empty-suitcase.json
        ├── empty-chat.json
        ├── empty-plane.json
        └── typing-dots.json
```

---

*Inspired by: Airbnb (wizard flows), Uber (progressive disclosure), Grabr (P2P shipping), Bounce (instant booking), Careem (Middle East RTL), Typeform (survey UX)*
