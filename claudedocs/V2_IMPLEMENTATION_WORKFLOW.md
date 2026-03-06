# LuggageShare V2 Implementation Workflow

> **Created**: 2026-03-06
> **Source Docs**: [DESIGN_SYSTEM_V2.md](DESIGN_SYSTEM_V2.md) | [V2_REDESIGN_PLAN.md](V2_REDESIGN_PLAN.md)
> **Prototype**: `apps/mobile/app/home-v2-test.tsx`
> **Rule**: Visual-only changes. No logic, hooks, API, or routing modifications.
> **Branch**: `feature/v2-redesign` (create from `sprint-7-8-polish-launch`)

---

## Workflow Overview

```
Phase 1 ─► Phase 2 ─► Phase 3 ─► Phase 4 ─► Phase 5 ─► Phase 6
Foundation   Home       Core       Secondary  Wizards     Web
(7 tasks)   (7 tasks)  (7 tasks)  (8 tasks)  (7 tasks)  (6 tasks)

Total: 42 tasks across 6 phases
Dependency: Each phase depends on Phase 1 completion.
            Phases 2-5 can partially overlap after Phase 1.
            Phase 6 is independent (web app).
```

---

## Phase 1: Foundation — Theme + Shared Components

**Goal**: Build the V2 design system primitives that every screen depends on.
**Blockers for all other phases**: This must complete first.
**Files created/modified**: ~12 files

### 1.1 Update ThemeProvider

**File**: `apps/mobile/providers/ThemeProvider.tsx`
**Action**: MODIFY

**Changes**:
- [ ] Add V2 color palette tokens to `ThemeColors` interface and `lightColors`:
  ```
  bg: '#F8F5FF', primary: '#7C6AFF', primaryMid: '#9D8FFF',
  primaryLight: '#B4ABFF', secondary: '#FF6B9D', accent1: '#56D8B1',
  accent2: '#FFBE5C', accent3: '#5CB8FF', text: '#2D2B55',
  textSoft: '#6E6B8A', textMuted: '#A8A5C0',
  blob1: '#EDE7FF', blob2: '#FFE5ED', blob3: '#E0F7EE', blob4: '#FFF3D6',
  cardShadow: 'rgba(124,106,255,0.12)'
  ```
- [ ] Update dark mode equivalents in `darkColors`
- [ ] Update `RADIUS` object:
  ```
  card: 22, button: 50, input: 50, badge: 50, pill: 50, heroCard: 28, avatar: 9999
  ```
- [ ] Add `BUBBLE_SHADOWS` object (xs, sm, md, lg, glow) per DESIGN_SYSTEM_V2.md Section 6.2
- [ ] Update `TYPOGRAPHY` to V2 scale (hero, h1, h2, h3, body, bodyBold, caption, captionBold, small, micro, label)
- [ ] Keep `BLUR` and `SHADOWS` exports for backward compatibility during migration (mark deprecated)
- [ ] Add `V2_COLORS` export for direct access to accent/blob tokens
- [ ] Export `GRADIENTS` with V2 values: `primary: ['#7C6AFF', '#9D8FFF', '#B4ABFF']`

**Acceptance**: TypeScript compiles. Existing screens still render (backward compat).

---

### 1.2 Create BackgroundBlobs

**File**: `apps/mobile/components/common/BackgroundBlobs.tsx` (NEW)
**Action**: CREATE

**Implementation** (extract from prototype):
- [ ] SVG component using `react-native-svg` (Circle, Ellipse)
- [ ] Props: `variant: 'full' | 'subtle'`, `height: number` (default 900)
- [ ] `pointerEvents: 'none'`, `StyleSheet.absoluteFill`
- [ ] 5-6 shapes: blob1-blob4 colors, opacity 0.3-0.6, r=60-160
- [ ] `subtle` variant: 3 shapes, opacity 0.2-0.4
- [ ] Export from `components/common/index.ts`

**Acceptance**: Renders behind content on any screen without intercepting touches.

---

### 1.3 Create BubbleCard

**File**: `apps/mobile/components/common/BubbleCard.tsx` (NEW)
**Action**: CREATE

**Props**: `children`, `style`, `tint` (default #FFFFFF), `noPadding` (default false), `shadow` ('xs'|'sm'|'md'|'lg', default 'lg')

**Implementation**:
- [ ] `backgroundColor: tint`, `borderRadius: 22`, `padding: noPadding ? 0 : 18`
- [ ] Apply `BUBBLE_SHADOWS[shadow]` from ThemeProvider
- [ ] No border (shadow only)
- [ ] Export from `components/common/index.ts`

**Acceptance**: Matches prototype listing card appearance.

---

### 1.4 Create BubbleButton

**File**: `apps/mobile/components/common/BubbleButton.tsx` (NEW)
**Action**: CREATE

**Props**: `label`, `onPress`, `icon?`, `variant` ('filled'|'outline'|'gradient'), `color`, `textColor`, `size` ('sm'|'md'|'lg'), `fullWidth`, `loading`, `disabled`

**Implementation**:
- [ ] `borderRadius: 50` (always pill)
- [ ] Three variants: filled (solid bg), outline (2px border, transparent bg), gradient (LinearGradient)
- [ ] Size scale: sm (14H/10V/13font), md (20H/14V/14font), lg (28H/18V/16font)
- [ ] Press animation: `scale(0.96)`, `opacity(0.9)` via Reanimated spring
- [ ] Loading state: ActivityIndicator replacing label
- [ ] Disabled: 50% opacity, non-interactive
- [ ] `accessibilityRole="button"`
- [ ] Export from `components/common/index.ts`

**Acceptance**: Matches prototype `BubbleButton` style. All three variants render correctly.

---

### 1.5 Create BubbleInput

**File**: `apps/mobile/components/common/BubbleInput.tsx` (NEW)
**Action**: CREATE

**Props**: `value`, `onChangeText`, `placeholder`, `dotColor?`, `icon?`, `error?`, `multiline`, `editable`

**Implementation**:
- [ ] `borderRadius: 50` (capsule). If `multiline`: `borderRadius: 22`
- [ ] White bg, `BUBBLE_SHADOWS.xs`
- [ ] Left side: colored dot (10px circle) OR Ionicons icon
- [ ] Focus state: `1.5px` border in primary color
- [ ] Error state: red text below, coral border
- [ ] RTL: `I18nManager.isRTL` — flip dot/icon to right side
- [ ] Export from `components/common/index.ts`

**Acceptance**: Capsule shape with colored dot matches prototype search inputs.

---

### 1.6 Create BubblePill

**File**: `apps/mobile/components/common/BubblePill.tsx` (NEW)
**Action**: CREATE

**Props**: `label`, `active`, `onPress`, `icon?`, `count?`, `color`

**Implementation**:
- [ ] `borderRadius: 50`
- [ ] Inactive: white bg, `1.5px` border `rgba(124,106,255,0.08)`, text = textSoft
- [ ] Active: `color` bg (filled), no border, text = white
- [ ] Optional icon left, optional count badge right
- [ ] Press: `scale(0.95)` spring
- [ ] Export from `components/common/index.ts`

**Acceptance**: Matches prototype category pills (All/Carriers/Senders/Express).

---

### 1.7 Create StatBubble, IconButton, MetaChip, SectionHeader

**Files**: 4 new files in `apps/mobile/components/common/` (NEW)
**Action**: CREATE

**StatBubble** (`StatBubble.tsx`):
- [ ] Props: `value`, `label`, `icon`, `color`
- [ ] Icon circle 44x44 with `color + '18'` bg
- [ ] Value: 22px/800, Label: 11px/600 uppercase
- [ ] BubbleCard wrapper (md shadow)
- [ ] Extract from prototype `StatBubble` component

**IconButton** (`IconButton.tsx`):
- [ ] Props: `icon`, `onPress`, `size` (default 44), `badge?`, `badgeColor?`
- [ ] Circular white button, `BUBBLE_SHADOWS.sm`
- [ ] Optional red notification dot (top-right)
- [ ] Extract from prototype `iconBtn` style

**MetaChip** (`MetaChip.tsx`):
- [ ] Props: `icon`, `label`, `color?`, `bold?`
- [ ] Pill-shaped, bg = `color + '12'` or default bg
- [ ] 12px/600 text

**SectionHeader** (`SectionHeader.tsx`):
- [ ] Props: `title`, `actionLabel?`, `onAction?`
- [ ] Row: h2 title (left) + action link (right, primary color, captionBold)
- [ ] Extract from prototype `sectionHeader` style

**All exported from** `components/common/index.ts`

**Acceptance**: All four components render correctly in isolation.

---

### Phase 1 Completion Checklist

- [ ] `ThemeProvider.tsx` updated with V2 tokens + backward compat
- [ ] 10 new component files created in `components/common/`
- [ ] All exports added to `components/common/index.ts`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Existing screens still render (no regressions)
- [ ] Prototype page (`/home-v2-test`) can import new components

---

## Phase 2: Tab Bar + Home Screen

**Goal**: Apply V2 to the most visible surface — the tab bar and home screen.
**Depends on**: Phase 1 (all foundation components)
**Files modified**: ~10 files

### 2.1 Update Tab Bar

**File**: `apps/mobile/app/(tabs)/_layout.tsx`
**Action**: MODIFY

- [ ] Remove `GlassTabBarBackground` component entirely
- [ ] Remove `expo-blur` import and usage
- [ ] Remove web `backdropFilter` styles
- [ ] Set `tabBarStyle.backgroundColor: '#FFFFFF'`
- [ ] Add top shadow: `shadowColor: 'rgba(124,106,255,0.12)', shadowOffset: {width:0, height:-2}, shadowOpacity: 1, shadowRadius: 8`
- [ ] Active tint: `#7C6AFF`, inactive: `#A8A5C0`
- [ ] Tab label weight: `'600'`
- [ ] Keep `CreateTabButton` gradient circle (add `BUBBLE_SHADOWS.glow`)

**Acceptance**: Solid white tab bar, no blur, purple shadow on top edge.

---

### 2.2 Update ScreenHeader

**File**: `apps/mobile/components/common/ScreenHeader.tsx`
**Action**: MODIFY

- [ ] Back button: `IconButton` component (circular white, soft shadow)
- [ ] Title: V2 h1 style (24px/800)
- [ ] Clean layout, no border bottom
- [ ] Right actions: `IconButton` slots

**Acceptance**: All screens using ScreenHeader get bubbly back button.

---

### 2.3 Redesign HomeHeader

**File**: `apps/mobile/components/home/HomeHeader.tsx`
**Action**: MODIFY

- [ ] Replace any card wrappers with clean layout
- [ ] Greeting: caption style (14px/500, textSoft)
- [ ] Name: h1 style (24px/800, text)
- [ ] Right icons: `IconButton` components with notification dot badge
- [ ] Match prototype header layout exactly

---

### 2.4 Redesign SearchBar / SearchBox

**Files**: `apps/mobile/components/listings/SearchBar.tsx`, `components/home/SearchBox.tsx`
**Action**: MODIFY

- [ ] Replace text inputs with `BubbleInput` (dotColor: accent1 for "from", secondary for "to")
- [ ] Swap button: Circular blob1 bg, swap-horizontal icon
- [ ] Date input: `BubbleInput` with amber dot or calendar icon
- [ ] Search button: Gradient pill (`BubbleButton` variant='gradient', fullWidth)
- [ ] Section title: "Where are you sending?" (h2 style)

---

### 2.5 Update Home Screen

**File**: `apps/mobile/app/(tabs)/index.tsx`
**Action**: MODIFY

- [ ] Container bg: `#F8F5FF`
- [ ] Add `<BackgroundBlobs />` as first child (absolute fill)
- [ ] Hero card: `LinearGradient` with V2 colors, `borderRadius: 28`, decorative circles inside, pill CTA buttons
- [ ] Stats row: 3x `StatBubble` components
- [ ] Section headers: `SectionHeader` component
- [ ] Replace any `SolidCard`/`GlassCard` → `BubbleCard`
- [ ] Entrance animations: `FadeInDown` for header/hero, `FadeInUp` staggered for content

---

### 2.6 Update ListingCard, PostTypeTabs, ViewToggle

**Files**: `components/listings/ListingCard.tsx`, `PostTypeTabs.tsx`, `ViewToggle.tsx`
**Action**: MODIFY

**ListingCard**:
- [ ] `borderRadius: 22`, white bg, `BUBBLE_SHADOWS.lg`
- [ ] Remove any 3D bottom border
- [ ] Route: colored origin/destination dots (mint/coral) + city names
- [ ] Metadata: `MetaChip` components for date, price
- [ ] User row: avatar circle, name, pill "View" button

**PostTypeTabs**:
- [ ] `BubblePill` for each tab (All, Carriers, Senders)
- [ ] Active = filled primary, inactive = white with subtle border

**ViewToggle**:
- [ ] Pill-shaped toggle, `borderRadius: 50`
- [ ] Filled primary for active, white for inactive

---

### 2.7 Update Home Sub-Components

**Files**: `components/home/CarrierDashboard.tsx`, `PopularRoutes.tsx`, `RecentTrips.tsx`, `RoleSwitcher.tsx`, `TopCarriers.tsx`
**Action**: MODIFY

- [ ] All cards → `BubbleCard`
- [ ] `RoleSwitcher`: Pill-shaped toggle (not rectangular segment)
- [ ] `PopularRoutes`: Bubble route cards with colored dots
- [ ] `RecentTrips`: Bubble cards with pill metadata chips
- [ ] `TopCarriers`: Bubble cards with avatar + pill rating badge
- [ ] `CarrierDashboard`: Bubble cards with pill stat values

---

### Phase 2 Completion Checklist

- [ ] Tab bar is solid white with purple shadow
- [ ] Home screen has lavender bg + blob backgrounds
- [ ] Hero gradient card renders with decorative circles
- [ ] Search inputs are capsule-shaped with colored dots
- [ ] Stats are StatBubble cards
- [ ] Category pills are BubblePill components
- [ ] Listing cards are rounded-22 with purple shadows
- [ ] TypeScript compiles, no regression on other screens

---

## Phase 3: Core Screens

**Goal**: Redesign the 5 main navigation targets + supporting components.
**Depends on**: Phase 1, Phase 2 (for shared component patterns)
**Files modified**: ~15 files

### 3.1 Trips Screen + Components

**Files**: `app/(tabs)/trips.tsx`, `components/trips/TripCard.tsx`, `TripFilters.tsx`

**Trips Screen**:
- [ ] bg `#F8F5FF` + `BackgroundBlobs`
- [ ] Segment control → pill toggle (BubblePill group)
- [ ] Filter chips → `BubblePill` components

**TripCard**:
- [ ] `BubbleCard` wrapper
- [ ] Colored icon circle for status (instead of left strip)
- [ ] Pill-shaped status badges with pastel tints
- [ ] `MetaChip` for date, weight, price

**TripFilters**:
- [ ] `BubblePill` filter chips, filled active state

---

### 3.2 Messages Screen

**File**: `app/(tabs)/messages.tsx`

- [ ] bg `#F8F5FF` + `BackgroundBlobs`
- [ ] Header: clean text + `IconButton` search
- [ ] Conversation items: `BubbleCard` per conversation
- [ ] Unread: soft purple dot (not ring)
- [ ] Route pill: pastel blue bg
- [ ] Unread badge: pill-shaped, primary
- [ ] Empty state: bubbly illustration + pill CTA

---

### 3.3 Profile Screen

**File**: `app/(tabs)/profile.tsx`

- [ ] bg `#F8F5FF` + `BackgroundBlobs`
- [ ] Header banner: gradient purple card (rounded 28) with decorative circles
- [ ] Profile card: `BubbleCard` overlapping banner
- [ ] Stats: 3x `StatBubble`
- [ ] Bio: `BubbleCard` with amber tint
- [ ] Menu items: pill-rounded rows, colored icon circles, gap separation (no dividers)
- [ ] Verification badge: pill with mint bg
- [ ] Sign out: coral outline pill

---

### 3.4 Listing Detail

**File**: `app/listing/[id].tsx`

- [ ] bg `#F8F5FF` + `BackgroundBlobs`
- [ ] Route card: `BubbleCard` with colored dots + dashed line
- [ ] Date/flight: `MetaChip` capsules
- [ ] Weight & price: side-by-side `BubbleCard`s with colored icon circles
- [ ] Notes: `BubbleCard` with amber tint
- [ ] Carrier: `BubbleCard` with avatar + pill rating
- [ ] Bottom bar: solid white + shadow, outline pill "Message" + gradient pill "Book Now"

---

### 3.5 Booking Detail

**File**: `app/booking/[id].tsx`

- [ ] bg `#F8F5FF` + `BackgroundBlobs`
- [ ] Status card: `BubbleCard` with colored tint + pill badge
- [ ] Status timeline: vertical line + colored bubble dots
- [ ] Price summary: `BubbleCard` with primary-highlighted total
- [ ] User card: `BubbleCard` with pill "Chat" button
- [ ] Action buttons: gradient/outline pill buttons

---

### 3.6 Update Status Components

**Files**: `components/status/LiveIndicator.tsx`, `MiniStepper.tsx`, `StatusStepper.tsx`, `StatusTimeline.tsx`

- [ ] `LiveIndicator`: pulsing colored dot, pill wrapper
- [ ] `MiniStepper`: colored bubble dots connected by line
- [ ] `StatusStepper`: colored dots, completed=filled, future=outlined
- [ ] `StatusTimeline`: vertical line with bubble dots

---

### 3.7 Update Trust Components

**Files**: `components/trust/RatingBars.tsx`, `ReviewCard.tsx`, `VerificationBadge.tsx`

- [ ] `RatingBars`: rounded bar fills with colored fills
- [ ] `ReviewCard`: `BubbleCard`, star pills, no borders
- [ ] `VerificationBadge`: pill with mint green bg + checkmark

---

### Phase 3 Completion Checklist

- [ ] Trips, Messages, Profile screens fully V2 styled
- [ ] Listing Detail and Booking Detail redesigned
- [ ] All status components use bubble dots
- [ ] All trust components use pill shapes
- [ ] No regressions on Home screen

---

## Phase 4: Secondary Screens

**Goal**: Apply V2 to all remaining screens and common components.
**Depends on**: Phase 1. Can overlap with Phase 3.
**Files modified**: ~18 files

### 4.1 Chat Screen

**File**: `app/chat/[bookingId].tsx`

- [ ] bg `#F8F5FF` (no blobs — readability)
- [ ] Sender bubbles: gradient purple, larger radius
- [ ] Receiver bubbles: white + soft shadow
- [ ] Input bar: capsule input + circular gradient send button
- [ ] Header: `IconButton` back + avatar + name

---

### 4.2 Notifications

**File**: `app/notifications.tsx`

- [ ] bg `#F8F5FF` + `BackgroundBlobs`
- [ ] `ScreenHeader` with bubble back button
- [ ] Notification cards: `BubbleCard` with colored icon circles per type
- [ ] Unread: left-side dot or primary tint bg
- [ ] Timestamps: pill chips

---

### 4.3 Profile Edit

**File**: `app/profile/edit.tsx`

- [ ] bg `#F8F5FF` + subtle blobs
- [ ] Avatar: gradient ring + circular camera overlay
- [ ] Inputs: `BubbleInput` capsule fields
- [ ] Bio textarea: `BubbleInput` multiline (radius 22)
- [ ] Save: gradient pill fullWidth

---

### 4.4 Wallet

**File**: `app/profile/wallet.tsx`

- [ ] bg `#F8F5FF` + `BackgroundBlobs`
- [ ] Balance card: gradient purple `BubbleCard` with decorative circles
- [ ] Transaction list: `BubbleCard` per transaction, colored icon + pill amount
- [ ] Withdrawal modal: rounded-28 bottom sheet with capsule inputs

---

### 4.5 Settings, Help, Terms, Verification

**Files**: `app/profile/settings.tsx`, `help.tsx`, `terms.tsx`, `verification.tsx`

**Settings**: Grouped `BubbleCard` sections, pill toggles, colored icon circles
**Help**: `BubbleCard` FAQ items, capsule search
**Terms**: `BubbleCard` content wrapper, colored section dots
**Verification**: Progress bar, `BubbleCard` steps, dashed upload areas

---

### 4.6 Auth Login

**File**: `app/(auth)/login.tsx`

- [ ] bg `#F8F5FF` + subtle `BackgroundBlobs`
- [ ] OAuth buttons: pill-shaped (radius 50)
- [ ] Dev login: outline pill
- [ ] Logo: centered with glow shadow

---

### 4.7 Update Common Components

**Files**: `components/common/DatePickerInput.tsx`, `EmptyState.tsx`, `OfflineBanner.tsx`, `StarRating.tsx`

- [ ] `DatePickerInput`: capsule shape, amber dot
- [ ] `EmptyState`: bubbly illustration + pill CTA
- [ ] `OfflineBanner`: pill shape, coral tint bg
- [ ] `StarRating`: amber stars, pill wrapper

---

### 4.8 Update Animation Components

**Files**: `components/animations/AnimatedButton.tsx`, `AnimatedCard.tsx`, `SkeletonLoader.tsx`

- [ ] `AnimatedButton`: pill shape, update spring values
- [ ] `AnimatedCard`: purple-tinted shadow
- [ ] `SkeletonLoader`: borderRadius 22, purple-tinted shimmer

---

### Phase 4 Completion Checklist

- [ ] All secondary screens V2 styled
- [ ] Chat has gradient/white message bubbles
- [ ] Auth login is pill-shaped
- [ ] All common components updated
- [ ] All animation components updated

---

## Phase 5: Wizards & Flows

**Goal**: Redesign all multi-step wizard flows.
**Depends on**: Phase 1. Can overlap with Phase 3/4.
**Files modified**: ~25 files

### 5.1 Update Wizard Shell Components

**Files**: `components/wizard/StepIndicator.tsx`, `WizardContainer.tsx`, `WizardProgress.tsx`, `WizardStep.tsx`, `OptionChips.tsx`, `OptionGrid.tsx`, `QuestionTitle.tsx`

- [ ] `StepIndicator`: Colored dots connected by line, active = primary filled + glow
- [ ] `WizardContainer`: bg `#F8F5FF`, add subtle `BackgroundBlobs`
- [ ] `WizardProgress`: colored progress bar, pill percentage badge
- [ ] `WizardStep`: `BubbleCard` wrapper
- [ ] `OptionChips`: `BubblePill` components, filled when selected
- [ ] `OptionGrid`: `BubbleCard` items in grid
- [ ] `QuestionTitle`: bold text with colored accent dot

---

### 5.2 Create Listing Wizard Steps

**Files**: `wizard/listing/RouteStep.tsx`, `DateFlightStep.tsx`, `WeightStep.tsx`, `PricingStep.tsx`, `PreferencesStep.tsx`, `ReviewStep.tsx`

- [ ] All inputs → `BubbleInput`
- [ ] All option chips → `BubblePill`
- [ ] Continue buttons → `BubbleButton` gradient fullWidth
- [ ] Review cards → `BubbleCard` per section

---

### 5.3 Booking Creation Wizard Steps

**Files**: `wizard/booking/ItemDetailsStep.tsx`, `PhotosStep.tsx`, `PickupStep.tsx`, `WeightValueStep.tsx`, `ReviewBookStep.tsx`

- [ ] Same treatment as listing wizard
- [ ] Photo upload: rounded-22 dashed-border `BubbleCard`

---

### 5.4 Request Wizard Steps

**Files**: `wizard/request/WeightDescriptionStep.tsx`, `BudgetStep.tsx`, `ProhibitedItemsStep.tsx`, `RequestReviewStep.tsx`

- [ ] Same treatment as listing wizard

---

### 5.5 Trip Wizard Steps

**Files**: `wizard/trip/TransportStep.tsx`, `TripDateStep.tsx`, `TripPricingStep.tsx`, `TripReviewStep.tsx`

- [ ] Same treatment as listing wizard
- [ ] Transport selection: pill-shaped option chips with icons

---

### 5.6 Chat Offer Flow

**File**: `app/chat/offer/[offerId].tsx`

- [ ] Offer card: `BubbleCard` with gradient top accent
- [ ] Price input: `BubbleInput` capsule with currency pill
- [ ] Accept/Reject: mint pill / coral outline pill
- [ ] Counter offer: amber tint `BubbleCard`
- [ ] Status badges: pill-shaped

---

### 5.7 Booking Payment + Request/Trip Detail & Offer Screens

**Files**: `app/booking/payment.tsx`, `app/request/[id].tsx`, `request/[id]/offer.tsx`, `app/trip/[id].tsx`, `trip/[id]/offer.tsx`

**Payment**:
- [ ] Amount card: gradient purple `BubbleCard`
- [ ] Payment selector: `BubbleCard` with radio
- [ ] Inputs: `BubbleInput`
- [ ] Pay button: gradient pill fullWidth

**Request Detail**: `BubbleCard` sections, route dots, pill offer cards
**Request Offer**: `BubbleInput` price, `BubbleInput` multiline message, gradient pill submit
**Trip Detail**: Same treatment as Request Detail
**Trip Offer**: Same treatment as Request Offer

---

### Phase 5 Completion Checklist

- [ ] All wizard shell components use V2 step indicators
- [ ] All 19 wizard step screens use BubbleInput + BubblePill
- [ ] Chat offer flow has gradient/pill styling
- [ ] Payment screen fully V2
- [ ] Request/Trip detail and offer screens V2

---

## Phase 6: Web App (Next.js)

**Goal**: Apply V2 to the Next.js web app.
**Depends on**: Phase 1 (design tokens only — web has its own component implementations).
**Independent of**: Phases 2-5 (can run in parallel).
**Files modified**: ~8 files

### 6.1 CSS Blob Backgrounds

**File**: `apps/web/src/app/globals.css` or equivalent
**Action**: MODIFY

- [ ] Add `.blob-background` class per DESIGN_SYSTEM_V2.md Section 10.2
- [ ] Background color: `#F8F5FF`
- [ ] 4 radial-gradient blobs
- [ ] Add Tailwind `boxShadow` extensions: `bubble-xs` through `bubble-glow`
- [ ] Add Tailwind color extensions: V2 palette

---

### 6.2 Header + Footer

**Files**: `src/components/layout/Header.tsx`, `Footer.tsx`

**Header**:
- [ ] White bg + `shadow-bubble-sm` bottom
- [ ] Nav links: pill hover states (`rounded-full`)
- [ ] Auth buttons: gradient pill (primary) + outline pill
- [ ] Logo: `rounded-2xl` accent box

**Footer**:
- [ ] bg `#F8F5FF`
- [ ] Social icons: circular buttons with pastel tints

---

### 6.3 Hero + SearchBox

**Files**: `src/app/page.tsx`, `src/components/home/SearchBox.tsx`

**Hero**:
- [ ] Gradient purple card `rounded-3xl` with decorative circles
- [ ] Pill CTA buttons

**SearchBox**:
- [ ] Capsule inputs with left dot indicators
- [ ] Gradient pill search button
- [ ] Card wrapper: `rounded-3xl`, `shadow-bubble-lg`

---

### 6.4 HowItWorks + PopularRoutes + CTA

**Files**: `src/components/home/HowItWorks.tsx`, `PopularRoutes.tsx`

- [ ] Step numbers: gradient circles
- [ ] Step cards: white `rounded-2xl`, `shadow-bubble-md`
- [ ] Route cards: white + colored dots + pill badges
- [ ] CTA: gradient card + pill button

---

### 6.5 WebShell + Sidebar

**Files**: `apps/mobile/components/web/WebShell.tsx`, `Sidebar.tsx`

- [ ] WebShell bg: `#F8F5FF`
- [ ] Sidebar: white bg + purple shadow, pill nav items
- [ ] Active nav: filled primary pill
- [ ] User section: avatar + name in bubble card

---

### 6.6 TopBar + Dropdowns + Breadcrumb

**Files**: `components/web/TopBar.tsx`, `UserDropdown.tsx`, `NotificationDropdown.tsx`, `Breadcrumb.tsx`

- [ ] TopBar: white bg + bottom purple shadow
- [ ] Breadcrumb: pill crumb items
- [ ] Dropdowns: white bubble dropdown, pill menu items

---

### Phase 6 Completion Checklist

- [ ] Landing page has lavender bg + CSS blob backgrounds
- [ ] Header/Footer match V2 style
- [ ] Hero + SearchBox use pill shapes and gradients
- [ ] Sidebar + TopBar match mobile V2 tab bar style
- [ ] All web shadows use purple-tinted values

---

## Dependency Graph

```
                    ┌─────────┐
                    │ Phase 1 │  Foundation (MUST complete first)
                    │ Theme + │
                    │ Comps   │
                    └────┬────┘
                         │
           ┌─────────────┼─────────────┬──────────────┐
           │             │             │              │
     ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐ ┌─────▼─────┐
     │ Phase 2   │ │ Phase 3 │ │ Phase 4   │ │ Phase 6   │
     │ Home      │→│ Core    │ │ Secondary │ │ Web       │
     │ Screen    │ │ Screens │ │ Screens   │ │ (Next.js) │
     └─────┬─────┘ └────┬────┘ └─────┬─────┘ └───────────┘
           │             │             │
           └─────────────┼─────────────┘
                         │
                   ┌─────▼─────┐
                   │ Phase 5   │
                   │ Wizards   │
                   └───────────┘

Key:
  → = soft dependency (benefits from, not required)
  │ = hard dependency (must complete before)
```

**Parallel execution opportunities**:
- Phase 6 (Web) can run entirely in parallel with Phases 2-5
- Phase 4 (Secondary) can start as soon as Phase 1 completes
- Phase 5 (Wizards) can start after Phase 1 but benefits from Phase 2 patterns

---

## Cleanup Tasks (After All Phases)

After all screens are migrated:

- [ ] Delete `apps/mobile/app/home-v2-test.tsx` (prototype page)
- [ ] Delete `GlassCard.tsx`, `GlassInput.tsx`, `SolidCard.tsx` (deprecated)
- [ ] Remove `BLUR` export from ThemeProvider (no longer needed)
- [ ] Remove old `SHADOWS` export (replaced by `BUBBLE_SHADOWS`)
- [ ] Remove `SECTION_TINTS` export (replaced by blob colors)
- [ ] Remove backward-compat V1 tokens from ThemeProvider
- [ ] Search codebase for any remaining V1 imports: `grep -r "GlassCard\|SolidCard\|GlassInput\|SECTION_TINTS\|BLUR\."`
- [ ] Final `npm run typecheck && npm run lint`
- [ ] Visual QA pass on all screens (light mode)
- [ ] RTL QA pass (Arabic layout)

---

## Progress Tracking Template

```
Phase 1: Foundation      [ ] [ ] [ ] [ ] [ ] [ ] [ ]       0/7
Phase 2: Home Screen     [ ] [ ] [ ] [ ] [ ] [ ] [ ]       0/7
Phase 3: Core Screens    [ ] [ ] [ ] [ ] [ ] [ ] [ ]       0/7
Phase 4: Secondary       [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]   0/8
Phase 5: Wizards         [ ] [ ] [ ] [ ] [ ] [ ] [ ]       0/7
Phase 6: Web App         [ ] [ ] [ ] [ ] [ ] [ ]           0/6
Cleanup                  [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]   0/8
─────────────────────────────────────────────────
Total                                                       0/50
```

---

## Related Documents

| File | Purpose |
|------|---------|
| [DESIGN_SYSTEM_V2.md](DESIGN_SYSTEM_V2.md) | Complete design tokens, component specs, accessibility |
| [V2_REDESIGN_PLAN.md](V2_REDESIGN_PLAN.md) | Screen-by-screen change checklist + component inventory |
| `apps/mobile/app/home-v2-test.tsx` | Approved visual prototype (reference implementation) |
| `apps/mobile/providers/ThemeProvider.tsx` | Theme tokens (modified in Phase 1) |
