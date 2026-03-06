# LuggageShare V2 Redesign Plan

> **Style Direction**: Bubbly, light, colorful — irregular blob backgrounds, pill-shaped buttons, soft shadows, pastel accents.
> **Approved Prototype**: `app/home-v2-test.tsx`
> **Rule**: NO logic/functionality changes. Only visual presentation.

---

## V2 Design System (New)

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#F8F5FF` | Screen background (light lavender) |
| `white` | `#FFFFFF` | Card backgrounds |
| `primary` | `#7C6AFF` | Primary actions, accents |
| `primaryLight` | `#B4ABFF` | Gradient ends, soft states |
| `secondary` | `#FF6B9D` | Coral pink accents |
| `accent1` | `#56D8B1` | Mint green (success, "to" inputs) |
| `accent2` | `#FFBE5C` | Warm amber (warnings, dates) |
| `accent3` | `#5CB8FF` | Sky blue (info, links) |
| `text` | `#2D2B55` | Primary text (dark indigo) |
| `textSoft` | `#6E6B8A` | Secondary text |
| `textMuted` | `#A8A5C0` | Placeholder text |
| `blob1` | `#EDE7FF` | Light purple blob |
| `blob2` | `#FFE5ED` | Light pink blob |
| `blob3` | `#E0F7EE` | Light mint blob |
| `blob4` | `#FFF3D6` | Light amber blob |
| `cardShadow` | `rgba(124,106,255,0.12)` | All card shadows |

### Shape Language

| Element | V1 (Current) | V2 (New) |
|---------|-------------|----------|
| Cards | `borderRadius: 20`, glass blur, 3px bottom border | `borderRadius: 22`, solid white, soft purple shadow |
| Buttons | `borderRadius: 12-14` | `borderRadius: 50` (full pill) |
| Inputs | `borderRadius: 14`, bordered | `borderRadius: 50` (capsule), soft shadow |
| Badges/Pills | `borderRadius: 24` | `borderRadius: 50` (full pill) |
| Icons | Colored circles `borderRadius: 20` | Colored circles `borderRadius: 22` |
| Backgrounds | Solid white or section tints | `#F8F5FF` + floating SVG blob shapes |
| Shadows | Platform shadows (iOS/Android) | Consistent `rgba(124,106,255,0.12)` purple tint |

### Shared Components to Create/Modify

| Component | Action | Description |
|-----------|--------|-------------|
| `BackgroundBlobs` | **NEW** | SVG circle/ellipse blobs, reusable per screen |
| `BubbleButton` | **NEW** | Pill-shaped button (`borderRadius: 50`), outline variant |
| `BubbleCard` | **NEW** | Replaces SolidCard — rounded white card with soft purple shadow |
| `BubbleInput` | **NEW** | Capsule input with colored dot indicator |
| `BubblePill` | **NEW** | Category/filter pill (full rounded, active=filled) |
| `ThemeProvider` | **MODIFY** | Update color palette to V2 tokens |
| `Tab Bar (_layout)` | **MODIFY** | Remove glass blur, use solid white bg + purple shadow |
| `StatBubble` | **NEW** | Metric display with icon circle + value + label |
| `IconButton` | **NEW** | Circular icon-only button for header actions (44x44) |
| `MetaChip` | **NEW** | Small informational capsule for metadata |
| `SectionHeader` | **NEW** | Section title with optional "See All" link |
| `GlassCard` | **DEPRECATE** | Replace all usage with BubbleCard |
| `SolidCard` | **DEPRECATE** | Replace all usage with BubbleCard |
| `GlassInput` | **DEPRECATE** | Replace all usage with BubbleInput |
| `Card` | **DEPRECATE** | Replace all usage with BubbleCard |
| `Button` | **DEPRECATE** | Replace all usage with BubbleButton |
| `Input` | **DEPRECATE** | Replace all usage with BubbleInput |
| `GradientButton` | **KEEP** | Still used for primary CTAs inside gradient hero cards |

---

## Screen-by-Screen Changes

### 1. Tab Bar Layout — `app/(tabs)/_layout.tsx`

**Current**: Glass blur background, hairline top border, transparent positioning
**V2 Changes**:
- [ ] Remove `GlassTabBarBackground` (no more blur)
- [ ] Background: solid `#FFFFFF` with top purple-tinted shadow
- [ ] Create button (`+`): keep gradient circle, add soft glow shadow
- [ ] Active tab color: `#7C6AFF`, inactive: `#A8A5C0`
- [ ] Tab label font: weight `600` (slightly bolder)
- [ ] Remove `backdropFilter` web styles

---

### 2. Home Screen — `app/(tabs)/index.tsx`

**Current**: White bg, SolidCard search, stat cards with 3D borders, section tints
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs` overlay
- [ ] **Header**: Bubbly icon buttons (circular, white, soft shadow)
- [ ] **Hero**: Gradient purple card with decorative translucent circles inside, pill CTA buttons
- [ ] **Search**: Capsule inputs with colored dots (green=from, pink=to, amber=date), gradient pill "Search" button
- [ ] **Stats**: White bubble cards with colored icon circles, purple-tinted shadow
- [ ] **Category tabs**: Full-pill shape, filled primary when active
- [ ] **Listing cards**: `borderRadius: 22`, white bg, soft shadow — no 3D bottom border
- [ ] **Section headers**: Clean text + "See All" link

**Components affected**: `HomeHeader`, `SearchBar`, `PostTypeTabs`, `ViewToggle`, `ListingCard`, `SkeletonLoader`

---

### 3. Trips Screen — `app/(tabs)/trips.tsx`

**Current**: Segment control with icons, filter chips, booking cards with colored left strips, mini steppers
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs`
- [ ] **Segment control**: Full-pill toggle (not rectangular), filled primary for active
- [ ] **Filter chips**: Pill-shaped (`borderRadius: 50`), soft colored borders
- [ ] **Booking cards**: White bubble cards, remove colored left strip, use colored icon circle for status
- [ ] **Status badges**: Pill-shaped with pastel tint backgrounds
- [ ] **MiniStepper**: Colored dots connected by lines, bubbly step indicators
- [ ] **Detail chips** (date, weight, price): Pill capsules with icons
- [ ] **Empty state**: Centered illustration with bubbly CTA button

---

### 4. Messages Screen — `app/(tabs)/messages.tsx`

**Current**: SolidCard conversation items, avatar with colored ring, route pill
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs`
- [ ] **Header**: Clean text header with search icon bubble
- [ ] **Conversation cards**: White bubble cards with soft shadow, no border
- [ ] **Unread indicator**: Soft purple dot (not ring around avatar)
- [ ] **Route pill**: Pill with pastel blue background
- [ ] **Time stamps**: Muted text, right-aligned
- [ ] **Unread badge**: Pill-shaped, primary color
- [ ] **Empty state**: Bubbly illustration with "Start a conversation" pill button

---

### 5. Profile Screen — `app/(tabs)/profile.tsx`

**Current**: LinearGradient banner, floating profile card, stat cards, menu items with icon circles
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs`
- [ ] **Header banner**: Gradient purple card (rounded `28`) with decorative blob circles inside (like hero card)
- [ ] **Profile card**: White bubble card overlapping banner, avatar with soft shadow ring
- [ ] **Stats row**: 3 white bubble stat cards with colored icon circles
- [ ] **Bio section**: White bubble card with amber/lavender tint
- [ ] **Menu items**: Pill-rounded rows with colored icon circles, chevron arrows, no divider lines — gap-based separation
- [ ] **Verification badge**: Pill with mint green background + checkmark
- [ ] **Sign out**: Coral pink outline pill button (not solid red 3D)
- [ ] **Reviews**: White bubble cards with star rating pills

---

### 6. Listing Detail — `app/listing/[id].tsx`

**Current**: Route card with dashed line + airplane, stat cards (weight/price), notes card, carrier info, rating bars, reviews, bottom action bar
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs`
- [ ] **Route card**: White bubble card with colored origin/destination dots, curved dashed line, airplane icon in circle
- [ ] **Date/flight chips**: Pill capsules with colored tints
- [ ] **Weight & price cards**: Side-by-side bubble cards with colored icon circles (purple for weight, mint for price)
- [ ] **Notes card**: Bubble card with amber tint background
- [ ] **Carrier section**: Bubble card with avatar, name, pill-shaped rating badge
- [ ] **Rating bars**: Rounded bar chart with colored fills
- [ ] **Reviews**: White bubble cards, star pills, no borders
- [ ] **Bottom bar**: Solid white bg with shadow, "Message" outline pill + "Book Now" gradient pill

---

### 7. Create Listing — `app/listing/create.tsx`

**Current**: WizardContainer with step indicators, form inputs
**V2 Changes**:
- [ ] Background: `#F8F5FF` + subtle blobs (fewer, lighter)
- [ ] **Step indicator**: Colored dots connected by line, active dot = primary filled + glow
- [ ] **Form inputs**: Capsule-shaped `BubbleInput` with icons
- [ ] **Option chips**: Pill-shaped toggles, filled when selected
- [ ] **Continue button**: Gradient pill button (full-width)
- [ ] **Review step**: Bubble cards summarizing each section

**Wizard sub-components affected**: `StepIndicator`, `WizardContainer`, `RouteStep`, `DateFlightStep`, `WeightStep`, `PricingStep`, `PreferencesStep`, `ReviewStep`

---

### 8. Booking Detail — `app/booking/[id].tsx`

**Current**: Status card with live indicator, status timeline, route card, price summary, items with images, user card, reviews, action buttons
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs`
- [ ] **Status card**: Bubble card with colored tint based on status, pill badge
- [ ] **Status timeline**: Vertical line with colored bubble dots, completed = filled, future = outlined
- [ ] **Route card**: Same treatment as listing detail route card
- [ ] **Price summary**: Bubble card with row items and total highlighted in primary
- [ ] **Items section**: Bubble card with image thumbnails, pill metadata chips
- [ ] **User card**: Bubble card with avatar, pill "Chat" button
- [ ] **Action buttons**: Gradient pill buttons, outline pills for secondary actions
- [ ] **Review form**: Bubble card with star selector and capsule textarea

---

### 9. Booking Payment — `app/booking/payment.tsx`

**Current**: Payment form with standard inputs
**V2 Changes**:
- [ ] Background: `#F8F5FF` + subtle blobs
- [ ] **Amount card**: Gradient purple bubble card showing total
- [ ] **Payment method selector**: Bubble cards with radio indicators
- [ ] **Form inputs**: Capsule inputs for card details
- [ ] **Pay button**: Full-width gradient pill button
- [ ] **Security badges**: Pill chips with lock icons

---

### 10. Chat Screen — `app/chat/[bookingId].tsx`

**Current**: Left/right message bubbles, input bar, typing indicator
**V2 Changes**:
- [ ] Background: `#F8F5FF` (no blobs — clean for readability)
- [ ] **Message bubbles**: Sender = gradient purple rounded bubbles (larger radius), receiver = white bubble with soft shadow
- [ ] **Time stamps**: Inside bubbles, smaller muted text
- [ ] **Input bar**: White bg with capsule input, circular gradient send button
- [ ] **Typing indicator**: Animated 3 dots in a bubble
- [ ] **Header**: Back button bubble + user name + avatar circle

---

### 11. Notifications — `app/notifications.tsx`

**Current**: Notification list items with icons and timestamps
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs`
- [ ] **Header**: ScreenHeader with bubble back button
- [ ] **Notification cards**: White bubble cards with colored icon circles per type
- [ ] **Unread indicator**: Left-side colored dot or soft primary tint background
- [ ] **Time stamps**: Pill chips with muted text
- [ ] **Empty state**: Bubbly bell illustration + "All caught up" message

---

### 12. Profile Edit — `app/profile/edit.tsx`

**Current**: Avatar with camera button, bordered form inputs, save button
**V2 Changes**:
- [ ] Background: `#F8F5FF` + subtle blobs
- [ ] **Avatar section**: Large avatar with gradient ring, circular camera button overlay
- [ ] **Form inputs**: `BubbleInput` capsule-shaped fields with labels above
- [ ] **Bio textarea**: Rounded-22 textarea (not full capsule) with character counter pill
- [ ] **Section titles**: Bold text with colored accent dot
- [ ] **Save button**: Full-width gradient pill button

---

### 13. Wallet — `app/profile/wallet.tsx`

**Current**: Gradient balance card, transaction list, withdrawal modal
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs`
- [ ] **Balance card**: Gradient purple bubble card with decorative circles inside (like hero), large balance text, pill "Withdraw" button
- [ ] **Transaction list**: White bubble cards per transaction, colored icon circle per type, pill amount badges
- [ ] **Withdrawal modal**: Rounded-28 bottom sheet with capsule inputs and gradient pill button

---

### 14. Settings — `app/profile/settings.tsx`

**Current**: Menu list with toggles and navigation items
**V2 Changes**:
- [ ] Background: `#F8F5FF` + subtle blobs
- [ ] **Menu sections**: Grouped in bubble cards with section titles
- [ ] **Toggle items**: Pill-shaped toggle switches
- [ ] **Navigation items**: Rounded rows with colored icon circles + chevron
- [ ] **Danger zone**: Coral pink outline bubble card for delete account

---

### 15. Verification — `app/profile/verification.tsx`

**Current**: Verification steps with status indicators
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs`
- [ ] **Progress indicator**: Horizontal bar with colored sections
- [ ] **Step cards**: White bubble cards with numbered circles, status pills (verified/pending/needed)
- [ ] **Upload areas**: Dashed-border bubble cards with icon
- [ ] **Submit button**: Gradient pill button

---

### 16. Help — `app/profile/help.tsx`

**Current**: FAQ accordion and contact options
**V2 Changes**:
- [ ] Background: `#F8F5FF` + subtle blobs
- [ ] **FAQ items**: White bubble cards with expand/collapse, colored question icon
- [ ] **Contact options**: Bubble cards with colored icon circles (email, chat, phone)
- [ ] **Search**: Capsule search input at top

---

### 17. Terms & Privacy — `app/profile/terms.tsx`

**Current**: Scrollable text content
**V2 Changes**:
- [ ] Background: `#F8F5FF`
- [ ] **Content wrapper**: White bubble card with padding
- [ ] **Section headers**: Bold text with colored accent dot
- [ ] **Back button**: Bubble icon button

---

### 18. Auth Login — `app/(auth)/login.tsx`

**Current**: OAuth login buttons (Google/Apple), branding
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs` (subtle variant)
- [ ] **Logo/branding**: Centered with soft glow shadow
- [ ] **OAuth buttons**: Pill-shaped (`borderRadius: 50`) with provider icons
- [ ] **Divider**: "or" text with faded lines
- [ ] **Dev login button** (dev only): Outline pill, muted color
- [ ] **Footer text**: Muted caption with terms links

---

### 19. Request Create — `app/request/create.tsx`

**Current**: Wizard-based request creation form
**V2 Changes**:
- [ ] Background: `#F8F5FF` + subtle blobs
- [ ] **Step indicator**: Colored dots connected by line (same as listing wizard)
- [ ] All form inputs: `BubbleInput` capsule fields
- [ ] **Option chips**: Pill-shaped toggles for prohibited items, preferences
- [ ] **Continue/Submit**: Gradient pill buttons
- [ ] **Review step**: Bubble cards summarizing request details

**Wizard sub-components affected**: `WeightDescriptionStep`, `BudgetStep`, `ProhibitedItemsStep`, `RequestReviewStep`

---

### 20. Request Detail — `app/request/[id].tsx`

**Current**: Request details with route, description, budget, offers
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs`
- [ ] **Route card**: Bubble card with origin/destination dots + curved dashed line
- [ ] **Description card**: Bubble card with text content
- [ ] **Budget card**: Bubble card with amber tint, price in bold primary
- [ ] **Offers section**: List of bubble offer cards with carrier info, price pills
- [ ] **Action buttons**: "Make Offer" gradient pill button

---

### 21. Request Offer — `app/request/[id]/offer.tsx`

**Current**: Offer form for a specific request
**V2 Changes**:
- [ ] Background: `#F8F5FF` + subtle blobs
- [ ] **Request summary**: Bubble card with route + budget
- [ ] **Price input**: Capsule input with currency pill
- [ ] **Message input**: Rounded-22 textarea (not full capsule)
- [ ] **Submit button**: Gradient pill button

---

### 22. Trip Create — `app/trip/create.tsx`

**Current**: Wizard-based trip creation form
**V2 Changes**:
- [ ] Background: `#F8F5FF` + subtle blobs
- [ ] **Step indicator**: Same treatment as listing/request wizards
- [ ] All form inputs: `BubbleInput` capsule fields
- [ ] **Transport selection**: Pill-shaped option chips with icons
- [ ] **Date pickers**: Capsule date inputs with amber dot
- [ ] **Pricing step**: Capsule inputs with currency indicators
- [ ] **Review step**: Bubble cards summarizing trip details

**Wizard sub-components affected**: `TransportStep`, `TripDateStep`, `TripPricingStep`, `TripReviewStep`

---

### 23. Trip Detail — `app/trip/[id].tsx`

**Current**: Trip details with route, dates, capacity, offers
**V2 Changes**:
- [ ] Background: `#F8F5FF` + `BackgroundBlobs`
- [ ] **Route card**: Bubble card with origin/destination dots + curved dashed line
- [ ] **Date/transport chips**: Pill capsules with colored tints
- [ ] **Capacity card**: Bubble card showing available weight
- [ ] **Offers section**: List of bubble offer cards
- [ ] **Action buttons**: "Make Offer" gradient pill, "Message" outline pill

---

### 24. Trip Offer — `app/trip/[id]/offer.tsx`

**Current**: Offer form for a specific trip
**V2 Changes**:
- [ ] Same treatment as Request Offer (section 21)
- [ ] **Trip summary**: Bubble card with route + dates
- [ ] **Weight/price inputs**: Capsule inputs
- [ ] **Submit button**: Gradient pill button

---

### 25. Chat Offer — `app/chat/offer/[offerId].tsx`

**Current**: Offer negotiation in chat context
**V2 Changes**:
- [ ] **Offer card**: Bubble card with gradient top accent
- [ ] **Price display**: Large bold primary text in bubble card
- [ ] **Price input** (counter): Capsule input with currency pill
- [ ] **Accept/Reject buttons**: Mint green pill / coral pink outline pill
- [ ] **Counter offer**: Amber tint bubble card
- [ ] **Status badges**: Pill-shaped (accepted/rejected/pending)

---

### 26. Booking Create — `app/booking/create.tsx`

**Current**: Wizard-based booking creation form
**V2 Changes**:
- [ ] Background: `#F8F5FF` + subtle blobs
- [ ] **Step indicator**: Same treatment as other wizards
- [ ] All form inputs: `BubbleInput` capsule fields
- [ ] **Photo upload**: Rounded-22 dashed-border bubble cards
- [ ] **Review step**: Bubble cards summarizing booking details

**Wizard sub-components affected**: `ItemDetailsStep`, `PhotosStep`, `PickupStep`, `WeightValueStep`, `ReviewBookStep`

---

## Web App (Next.js) — `apps/web/`

### 27. Landing Page — `src/app/page.tsx`

**Current**: Tailwind-styled marketing page with hero, search, how-it-works, popular routes, CTA
**V2 Changes**:
- [ ] **Background**: Light lavender `#F8F5FF` with CSS blob shapes (using `background-image: radial-gradient()` for blobs or absolute divs)
- [ ] **Header**: Pill-shaped nav links, rounded logo, bubbly language toggle
- [ ] **Hero section**: Gradient purple card (rounded-3xl) with decorative circles, pill CTA buttons
- [ ] **Search box**: Capsule inputs with colored dots, gradient pill search button
- [ ] **How it Works**: Numbered bubble circles connected by curved line, white cards with soft shadow
- [ ] **Popular Routes**: Horizontal scroll of bubble route cards with colored city dots
- [ ] **CTA section**: Gradient card with pill button
- [ ] **Footer**: Clean layout on `#F8F5FF`, pill-shaped social links

### 28. Header — `src/components/layout/Header.tsx`

- [ ] Background: White with purple-tinted shadow
- [ ] Nav links: Pill-shaped hover states
- [ ] Auth buttons: Primary = gradient pill, secondary = outline pill
- [ ] Mobile menu: Rounded bottom sheet, pill buttons
- [ ] Logo: Rounded-16 accent box

### 29. Footer — `src/components/layout/Footer.tsx`

- [ ] Background: `#F8F5FF` (same as page bg)
- [ ] Link columns: Soft text, hover = primary color
- [ ] Social icons: Circular buttons with pastel tints
- [ ] Copyright: Muted text with pill separator

### 30. SearchBox — `src/components/home/SearchBox.tsx`

- [ ] Inputs: Capsule-shaped with left dot indicators (green/pink/amber/blue)
- [ ] Search button: Full-width gradient pill
- [ ] Card wrapper: White bubble with `border-radius: 24px`, purple shadow

### 31. HowItWorks — `src/components/home/HowItWorks.tsx`

- [ ] Step numbers: Gradient circles with white number text
- [ ] Step cards: White bubble cards with soft shadow
- [ ] Connection line: Curved dashed line between steps (SVG or CSS)
- [ ] Icons: Colored circles matching step accent

### 32. PopularRoutes — `src/components/home/PopularRoutes.tsx`

- [ ] Route cards: White bubble cards with colored origin/destination dots
- [ ] Price pill: Colored capsule badge
- [ ] Carrier count: Muted pill badge
- [ ] Airplane icon: In small colored circle

### 33. WebShell + Sidebar — `components/web/WebShell.tsx`, `Sidebar.tsx`

- [ ] **WebShell**: Background `#F8F5FF`, no glass blur
- [ ] **Sidebar**: White bg with purple-tinted shadow, pill-shaped nav items
- [ ] **Active nav item**: Filled primary pill background
- [ ] **Logo area**: Rounded-16 accent box
- [ ] **User section**: Avatar + name in bubble card at bottom

### 34. TopBar + Dropdowns — `components/web/TopBar.tsx`, `UserDropdown.tsx`, `NotificationDropdown.tsx`

- [ ] **TopBar**: White bg with bottom purple-tinted shadow
- [ ] **Breadcrumb**: Pill-shaped crumb items with chevrons
- [ ] **User dropdown**: White bubble dropdown with pill menu items
- [ ] **Notification dropdown**: White bubble dropdown, notification items with colored icon circles

### 35. Mobile Web Components — `components/web/Breadcrumb.tsx`

- [ ] **Breadcrumb items**: Pill-shaped with primary color for current page
- [ ] **Separator**: Soft chevron icon

---

## Component-Level Change Inventory

### Common Components — `components/common/`

| Component | File | Action | V2 Changes |
|-----------|------|--------|------------|
| `Button` | `Button.tsx` | **REPLACE** with `BubbleButton` | Pill shape, gradient variant |
| `Card` | `Card.tsx` | **REPLACE** with `BubbleCard` | borderRadius 22, purple shadow |
| `Input` | `Input.tsx` | **REPLACE** with `BubbleInput` | Capsule shape, colored dots |
| `Avatar` | `Avatar.tsx` | **KEEP** | Add soft shadow ring |
| `DatePickerInput` | `DatePickerInput.tsx` | **MODIFY** | Capsule shape with amber dot |
| `EmptyState` | `EmptyState.tsx` | **MODIFY** | Bubbly illustration + pill CTA |
| `ErrorBoundary` | `ErrorBoundary.tsx` | **KEEP** | No visual changes |
| `GlassCard` | `GlassCard.tsx` | **DEPRECATE** | Replace all usage with BubbleCard |
| `GlassInput` | `GlassInput.tsx` | **DEPRECATE** | Replace all usage with BubbleInput |
| `GradientButton` | `GradientButton.tsx` | **KEEP** | Still used in hero/CTA contexts |
| `LottieAnimation` | `LottieAnimation.tsx` | **KEEP** | No visual changes |
| `OfflineBanner` | `OfflineBanner.tsx` | **MODIFY** | Pill shape, coral tint bg |
| `ScreenHeader` | `ScreenHeader.tsx` | **MODIFY** | Bubble back button, clean title |
| `SolidCard` | `SolidCard.tsx` | **DEPRECATE** | Replace all usage with BubbleCard |
| `StarRating` | `StarRating.tsx` | **MODIFY** | Amber stars, pill wrapper |

### Home Components — `components/home/`

| Component | File | Action | V2 Changes |
|-----------|------|--------|------------|
| `HomeHeader` | `HomeHeader.tsx` | **MODIFY** | Bubble icon buttons, clean layout |
| `SearchBar` | `SearchBar.tsx` | **MODIFY** | Capsule inputs, colored dots, gradient pill search button |
| `CarrierDashboard` | `CarrierDashboard.tsx` | **MODIFY** | Bubble cards, pill stats |
| `PopularRoutes` | `PopularRoutes.tsx` | **MODIFY** | Bubble route cards with colored dots |
| `RecentTrips` | `RecentTrips.tsx` | **MODIFY** | Bubble cards with pill metadata |
| `RoleSwitcher` | `RoleSwitcher.tsx` | **MODIFY** | Pill toggle (not rectangular) |
| `SearchBox` | `SearchBox.tsx` | **MODIFY** | Same as SearchBar treatment |
| `TopCarriers` | `TopCarriers.tsx` | **MODIFY** | Bubble cards with avatar + pill rating |

### Listing Components — `components/listings/`

| Component | File | Action | V2 Changes |
|-----------|------|--------|------------|
| `ListingCard` | `ListingCard.tsx` | **MODIFY** | borderRadius 22, purple shadow, pill metadata chips |
| `PostTypeTabs` | `PostTypeTabs.tsx` | **MODIFY** | Pill-shaped tabs, filled active state |
| `ViewToggle` | `ViewToggle.tsx` | **MODIFY** | Pill-shaped toggle, bubble icons |
| `SearchBar` | `SearchBar.tsx` | **MODIFY** | Capsule inputs, colored dots |

### Trips Components — `components/trips/`

| Component | File | Action | V2 Changes |
|-----------|------|--------|------------|
| `TripCard` | `TripCard.tsx` | **MODIFY** | Bubble card, pill status/metadata, colored icon circle |
| `TripFilters` | `TripFilters.tsx` | **MODIFY** | Pill filter chips, filled active state |

### Status Components — `components/status/`

| Component | File | Action | V2 Changes |
|-----------|------|--------|------------|
| `LiveIndicator` | `LiveIndicator.tsx` | **MODIFY** | Pulsing colored dot, pill wrapper |
| `MiniStepper` | `MiniStepper.tsx` | **MODIFY** | Colored bubble dots connected by line |
| `StatusStepper` | `StatusStepper.tsx` | **MODIFY** | Colored bubble dots, completed=filled |
| `StatusTimeline` | `StatusTimeline.tsx` | **MODIFY** | Vertical line with colored bubble dots |

### Trust Components — `components/trust/`

| Component | File | Action | V2 Changes |
|-----------|------|--------|------------|
| `RatingBars` | `RatingBars.tsx` | **MODIFY** | Rounded bars with colored fills |
| `ReviewCard` | `ReviewCard.tsx` | **MODIFY** | Bubble card, star pills, no borders |
| `VerificationBadge` | `VerificationBadge.tsx` | **MODIFY** | Pill with mint green bg + checkmark |

### Animation Components — `components/animations/`

| Component | File | Action | V2 Changes |
|-----------|------|--------|------------|
| `AnimatedButton` | `AnimatedButton.tsx` | **MODIFY** | Update spring values, pill shape |
| `AnimatedCard` | `AnimatedCard.tsx` | **MODIFY** | Update shadow to purple-tinted |
| `CountUpText` | `CountUpText.tsx` | **KEEP** | No visual changes |
| `SkeletonLoader` | `SkeletonLoader.tsx` | **MODIFY** | borderRadius 22, purple-tinted shimmer |
| `StaggeredList` | `StaggeredList.tsx` | **KEEP** | No visual changes (layout utility) |
| `SuccessCelebration` | `SuccessCelebration.tsx` | **KEEP** | No visual changes |

### Wizard Components — `components/wizard/`

| Component | File | Action | V2 Changes |
|-----------|------|--------|------------|
| `StepIndicator` | `StepIndicator.tsx` | **MODIFY** | Colored dots connected by line, active=glow |
| `WizardContainer` | `WizardContainer.tsx` | **MODIFY** | `#F8F5FF` bg, subtle blobs |
| `WizardProgress` | `WizardProgress.tsx` | **MODIFY** | Colored progress bar, pill percentage |
| `WizardStep` | `WizardStep.tsx` | **MODIFY** | Bubble card wrapper |
| `OptionChips` | `OptionChips.tsx` | **MODIFY** | Pill-shaped chips, filled when selected |
| `OptionGrid` | `OptionGrid.tsx` | **MODIFY** | Bubble cards in grid, soft shadows |
| `QuestionTitle` | `QuestionTitle.tsx` | **MODIFY** | Bold text with colored accent dot |

**Listing wizard steps** (`wizard/listing/`): `RouteStep`, `DateFlightStep`, `WeightStep`, `PricingStep`, `PreferencesStep`, `ReviewStep` — all get BubbleInput + pill chips + gradient buttons

**Booking wizard steps** (`wizard/booking/`): `ItemDetailsStep`, `PhotosStep`, `PickupStep`, `WeightValueStep`, `ReviewBookStep` — all get same treatment

**Request wizard steps** (`wizard/request/`): `WeightDescriptionStep`, `BudgetStep`, `ProhibitedItemsStep`, `RequestReviewStep` — all get same treatment

**Trip wizard steps** (`wizard/trip/`): `TransportStep`, `TripDateStep`, `TripPricingStep`, `TripReviewStep` — all get same treatment

---

## Implementation Order

### Phase 1: Foundation (shared components + theme)
1. Update `ThemeProvider` with V2 color palette + shadow tokens
2. Create `BackgroundBlobs` component
3. Create `BubbleButton` component
4. Create `BubbleCard` component
5. Create `BubbleInput` component
6. Create `BubblePill` component
7. Create `StatBubble`, `IconButton`, `MetaChip`, `SectionHeader` components

### Phase 2: Tab Bar + Home Screen
8. Update `_layout.tsx` tab bar (remove glass blur)
9. Update `ScreenHeader` to bubbly style
10. Redesign `HomeHeader`
11. Redesign `SearchBar` / `SearchBox`
12. Update Home screen (`index.tsx`)
13. Update `ListingCard`, `PostTypeTabs`, `ViewToggle`
14. Update `CarrierDashboard`, `PopularRoutes`, `RecentTrips`, `RoleSwitcher`, `TopCarriers`

### Phase 3: Core Screens
15. Redesign Trips screen + `TripCard`, `TripFilters`
16. Redesign Messages screen
17. Redesign Profile screen
18. Redesign Listing Detail
19. Redesign Booking Detail
20. Update status components: `LiveIndicator`, `MiniStepper`, `StatusStepper`, `StatusTimeline`
21. Update trust components: `RatingBars`, `ReviewCard`, `VerificationBadge`

### Phase 4: Secondary Screens
22. Redesign Chat screen
23. Redesign Notifications
24. Redesign Profile Edit
25. Redesign Wallet
26. Redesign Settings, Help, Terms, Verification
27. Redesign Auth Login
28. Update common components: `DatePickerInput`, `EmptyState`, `OfflineBanner`, `StarRating`
29. Update animation components: `AnimatedButton`, `AnimatedCard`, `SkeletonLoader`

### Phase 5: Wizards & Flows
30. Update wizard shell components (`StepIndicator`, `WizardContainer`, `WizardProgress`, `WizardStep`, `OptionChips`, `OptionGrid`, `QuestionTitle`)
31. Redesign Create Listing wizard steps (6 steps)
32. Redesign Booking creation wizard steps (5 steps)
33. Redesign Request wizard steps (4 steps)
34. Redesign Trip wizard steps (4 steps)
35. Redesign Chat Offer flow
36. Redesign Booking Payment

### Phase 6: Web App
37. Create CSS blob backgrounds
38. Redesign Header + Footer
39. Redesign Hero section + SearchBox
40. Redesign HowItWorks + PopularRoutes + CTA section
41. Redesign WebShell + Sidebar
42. Redesign TopBar + UserDropdown + NotificationDropdown + Breadcrumb

---

## What Does NOT Change

- All React hooks, state management, and data fetching logic
- API calls and data mapping
- Navigation and routing logic
- i18n translation keys and RTL support
- Pull-to-refresh behavior
- WebSocket chat functionality
- Form validation and submission logic
- Authentication flow
- React Query cache configuration
- Expo Router file-based routing structure
