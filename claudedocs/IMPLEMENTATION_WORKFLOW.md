# LuggageShare UX Implementation Workflow

**Source**: `claudedocs/UX_DESIGN_PLAN.md`
**Branch**: `sprint-7-8-polish-launch`
**Strategy**: Systematic bottom-up — foundations first, then flows, then polish
**Total Steps**: 42 across 5 phases

---

## Dependency Graph (High Level)

```
Phase 1: Foundations ──────────────────────────────────────┐
  ├─ Step 1: Animation presets (lib/animations.ts)        │
  ├─ Step 2: Design tokens update (ThemeProvider)         │
  ├─ Step 3: AnimatedButton component                     │
  ├─ Step 4: AnimatedCard component                       │
  ├─ Step 5: SkeletonLoader component                     │
  └─ Step 6: Install dependencies (lottie, bottom-sheet)  │
                                                          ▼
Phase 2: Wizard System ───────────────────────────────────┐
  ├─ Step 7:  WizardProgress bar                          │
  ├─ Step 8:  WizardStep wrapper                          │
  ├─ Step 9:  WizardContainer orchestrator                │
  ├─ Step 10: QuestionTitle component                     │
  ├─ Step 11: OptionGrid (tappable cards)                 │
  ├─ Step 12: OptionChips (horizontal pills)              │
  ├─ Step 13: CountUpText (animated numbers)              │
  └─ Step 14: SuccessCelebration overlay                  │
                                                          ▼
Phase 3: Wizard Flows (Create Screens) ───────────────────┐
  ├─ Step 15: Listing Wizard — Screen 1 (Route)           │
  ├─ Step 16: Listing Wizard — Screen 2 (Date & Flight)   │
  ├─ Step 17: Listing Wizard — Screen 3 (Weight)          │
  ├─ Step 18: Listing Wizard — Screen 4 (Pricing)         │
  ├─ Step 19: Listing Wizard — Screen 5 (Preferences)     │
  ├─ Step 20: Listing Wizard — Screen 6 (Review & Publish)│
  ├─ Step 21: Wire listing/create.tsx to wizard            │
  ├─ Step 22: Booking Wizard — Screen 1 (Item Details)    │
  ├─ Step 23: Booking Wizard — Screen 2 (Weight & Value)  │
  ├─ Step 24: Booking Wizard — Screen 3 (Photos)          │
  ├─ Step 25: Booking Wizard — Screen 4 (Pickup Details)  │
  ├─ Step 26: Booking Wizard — Screen 5 (Review & Book)   │
  └─ Step 27: Wire booking/create.tsx to wizard            │
                                                          ▼
Phase 4: Cards, Status & Trust ───────────────────────────┐
  ├─ Step 28: Redesign ListingCard                        │
  ├─ Step 29: StatusStepper (horizontal dots)             │
  ├─ Step 30: StatusTimeline (vertical timeline)          │
  ├─ Step 31: LiveIndicator (pulsing dot)                 │
  ├─ Step 32: Redesign TripCard with StatusStepper        │
  ├─ Step 33: Redesign BookingDetail with timeline        │
  ├─ Step 34: VerificationBadge component                 │
  ├─ Step 35: RatingBars (category bars)                  │
  ├─ Step 36: ReviewCard component                        │
  └─ Step 37: StaggeredList (animated FlatList)            │
                                                          ▼
Phase 5: Polish & Empty States ───────────────────────────┘
  ├─ Step 38: Empty states with Lottie animations
  ├─ Step 39: Pull-to-refresh airplane animation
  ├─ Step 40: Home screen redesign integration
  ├─ Step 41: RTL animation adjustments
  └─ Step 42: Performance optimization pass

Legend: ──▶ hard dependency  ···▷ soft dependency (nice to have before)
```

---

## Phase 1: Foundations

> Build the shared animation system, design tokens, and reusable primitives that everything else depends on.
> **Estimated effort**: ~4 hours | **Files created**: 6 | **Files modified**: 2

---

### Step 1 — Animation Presets Module

**What**: Create the shared `ANIM` config with spring/timing presets referenced by every animated component.

**Create**: `apps/mobile/lib/animations.ts`

```
Contents:
- ANIM.spring.gentle  = { damping: 20, stiffness: 150, mass: 1 }
- ANIM.spring.bouncy  = { damping: 12, stiffness: 180, mass: 0.8 }
- ANIM.spring.snappy  = { damping: 15, stiffness: 300, mass: 0.5 }
- ANIM.timing.fast    = { duration: 150, easing: Easing.ease }
- ANIM.timing.normal  = { duration: 250, easing: Easing.inOut(Easing.ease) }
- ANIM.timing.slow    = { duration: 400, easing: Easing.inOut(Easing.ease) }
- ANIM.pressScale     = 0.97
- ANIM.cardScale      = 1.02
- ANIM.fadeIn          = { from: 0, to: 1, duration: 200 }
- ANIM.slideUp         = { from: 50, to: 0, duration: 300 }
- Helper: createStaggerDelay(index, base) → delay value
- Helper: rtlAwareSlide(isRTL) → returns slide direction multiplier
```

**Dependencies**: None (leaf node)
**Blocked by**: Nothing
**Blocks**: Steps 3, 4, 5, 7, 8, 13, 14 (everything animated)

---

### Step 2 — Design Token Additions to ThemeProvider

**What**: Add missing design tokens from the UX plan (shadows, spacing scale, typography scale) to the existing ThemeProvider.

**Modify**: `apps/mobile/providers/ThemeProvider.tsx`

```
Add to ThemeColors interface:
- surface: string          (F9FAFB light / 1E293B dark — for card backgrounds)
- textMuted: string        (9CA3AF light / 475569 dark — for placeholders)

Add new exported constants:
- SPACING = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64]
- RADIUS = { card: 16, button: 12, input: 12, badge: 20, avatar: 9999 }
- SHADOWS = { s: {...}, m: {...}, l: {...}, xl: {...} }
- TYPOGRAPHY = { h1: {...}, h2: {...}, h3: {...}, body: {...}, caption: {...}, small: {...} }
```

**Dependencies**: None
**Blocked by**: Nothing
**Blocks**: Steps 3, 4, 5 (use tokens)

---

### Step 3 — AnimatedButton Component

**What**: Pressable button with scale-down on press (0.97), spring release, optional haptic feedback.

**Create**: `apps/mobile/components/animations/AnimatedButton.tsx`

```
Props:
- onPress: () => void
- children: ReactNode
- variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
- size?: 'sm' | 'md' | 'lg'
- disabled?: boolean
- loading?: boolean
- fullWidth?: boolean
- style?: ViewStyle

Behavior:
- onPressIn: withSpring(ANIM.pressScale, ANIM.spring.snappy)
- onPressOut: withSpring(1, ANIM.spring.gentle)
- Optional expo-haptics light impact on press
- Uses RADIUS.button, SHADOWS.s
- Loading state shows ActivityIndicator
```

**Dependencies**: Step 1 (ANIM), Step 2 (tokens)
**Blocks**: Steps 15-27 (wizard screens use buttons)

---

### Step 4 — AnimatedCard Component

**What**: Pressable card with scale + shadow elevation on press.

**Create**: `apps/mobile/components/animations/AnimatedCard.tsx`

```
Props:
- onPress?: () => void
- children: ReactNode
- style?: ViewStyle
- delay?: number (for staggered entry)

Behavior:
- Press: withSpring(0.98, ANIM.spring.snappy) + shadow elevates
- Release: withSpring(1, ANIM.spring.gentle) + shadow returns
- Entry: FadeInUp.delay(delay).springify()
- Uses RADIUS.card, SHADOWS.m
```

**Dependencies**: Step 1, Step 2
**Blocks**: Steps 28, 32 (card redesigns)

---

### Step 5 — SkeletonLoader Component

**What**: Shimmer loading placeholder with configurable shape.

**Create**: `apps/mobile/components/animations/SkeletonLoader.tsx`

```
Props:
- width: number | string
- height: number
- borderRadius?: number
- style?: ViewStyle

Behavior:
- Gray background (#E5E7EB)
- Animated gradient sweep left→right (1.5s loop)
- Uses Reanimated interpolate for shimmer position
- Composable: stack multiple to create skeleton layouts
```

**Dependencies**: Step 1
**Blocks**: Steps 28, 40 (loading states)

---

### Step 6 — Install Missing Dependencies

**What**: Ensure `@gorhom/bottom-sheet` is installed for wizard modal behavior. Verify `lottie-react-native` is working.

**Run**:
```bash
cd apps/mobile
npx expo install @gorhom/bottom-sheet
```

**Note**: `lottie-react-native@7.1.0` is already installed. `react-native-reanimated@3.16.0` is already installed. `react-native-gesture-handler` is already installed via Expo.

**Create**: `apps/mobile/components/animations/index.ts` (barrel export)

```
export { AnimatedButton } from './AnimatedButton';
export { AnimatedCard } from './AnimatedCard';
export { SkeletonLoader } from './SkeletonLoader';
```

**Dependencies**: None
**Blocks**: Step 9 (WizardContainer may use bottom-sheet)

---

### ✅ Phase 1 Checkpoint

After completing Steps 1-6:
- [ ] `lib/animations.ts` exports ANIM config — import and verify types
- [ ] ThemeProvider has new tokens — verify `useTheme()` returns them
- [ ] AnimatedButton renders with press animation — test in a scratch screen
- [ ] AnimatedCard renders with press + entry animation
- [ ] SkeletonLoader shows shimmer — test with 3 stacked loaders
- [ ] `@gorhom/bottom-sheet` installs without errors
- [ ] Run `npm run typecheck` — no new errors

---

## Phase 2: Wizard System

> Build the reusable wizard infrastructure: container, steps, progress bar, option pickers, celebrations.
> **Estimated effort**: ~6 hours | **Files created**: 8 | **Files modified**: 0

---

### Step 7 — WizardProgress Bar

**What**: Horizontal progress bar that smoothly animates width on step change.

**Create**: `apps/mobile/components/wizard/WizardProgress.tsx`

```
Props:
- currentStep: number
- totalSteps: number
- color?: string (default: primary)

Behavior:
- Bar fills proportionally: (currentStep / totalSteps) * 100%
- Width transitions with withTiming(targetWidth, ANIM.timing.normal)
- Shows "Step X/Y" text right-aligned
- Height: 4px, radius: 2px
- Track color: border, fill color: primary
```

**Dependencies**: Step 1 (ANIM)
**Blocks**: Step 9 (WizardContainer)

---

### Step 8 — WizardStep Wrapper

**What**: Individual step wrapper with enter/exit animations.

**Create**: `apps/mobile/components/wizard/WizardStep.tsx`

```
Props:
- children: ReactNode
- direction: 'forward' | 'backward'
- isActive: boolean

Behavior:
- Forward enter: slide up from +50 + fade in (300ms, spring.gentle)
- Forward exit: slide up to -50 + fade out (250ms, timing.normal)
- Backward enter: slide down from -50 + fade in
- Backward exit: slide down to +50 + fade out
- RTL: reverses horizontal slide direction (if used)
- Only renders children when isActive (unmounts for perf)
```

**Dependencies**: Step 1 (ANIM)
**Blocks**: Step 9 (WizardContainer)

---

### Step 9 — WizardContainer Orchestrator

**What**: Main wizard component that manages step state, progress, navigation, keyboard avoidance.

**Create**: `apps/mobile/components/wizard/WizardContainer.tsx`

```
Props:
- steps: WizardStepConfig[]       // Array of step components
- onComplete: (data: any) => void // Called with collected data
- onCancel?: () => void
- initialData?: Record<string, any>

WizardStepConfig:
- component: React.ComponentType<StepProps>
- title?: string
- canSkip?: boolean
- validate?: (data) => boolean | string

StepProps (injected to each step):
- data: Record<string, any>     // accumulated wizard data
- updateData: (partial) => void // merge into wizard state
- goNext: () => void
- goBack: () => void
- canGoNext: boolean

Internal State:
- currentStep: number
- direction: 'forward' | 'backward'
- wizardData: Record<string, any>

Behavior:
- Renders WizardProgress at top
- Renders current WizardStep with animation
- Back button: goBack() or router.back() if step 0
- Keyboard avoidance: KeyboardAvoidingView wrapping
- Validates current step before advancing
- On final step complete: calls onComplete(wizardData)
```

**Dependencies**: Step 7 (WizardProgress), Step 8 (WizardStep)
**Blocks**: Steps 15-27 (all wizard flows)

---

### Step 10 — QuestionTitle Component

**What**: The "emoji + heading + subtitle" pattern used on every wizard screen.

**Create**: `apps/mobile/components/wizard/QuestionTitle.tsx`

```
Props:
- emoji: string
- title: string
- subtitle?: string

Behavior:
- Emoji: 40px, centered or left-aligned
- Title: Heading 2 (22px SemiBold), dark text
- Subtitle: Caption (14px Regular), secondary text
- Entry: FadeInDown.delay(100).springify()
- Spacing: 8px between emoji→title, 4px title→subtitle
```

**Dependencies**: Step 2 (typography tokens)
**Blocks**: Steps 15-26 (wizard screens)

---

### Step 11 — OptionGrid Component

**What**: 2-column tappable card grid for multi-select options (e.g., item categories).

**Create**: `apps/mobile/components/wizard/OptionGrid.tsx`

```
Props:
- options: { id: string, emoji: string, label: string }[]
- selected: string[]
- onToggle: (id: string) => void
- columns?: 2 | 3

Behavior:
- Grid layout with gap: 12
- Each card: emoji + label, rounded corners (12px)
- Selected state: border color → primary, bg tint, checkmark pops in
- Checkmark animation: scale 0→1.2→1.0 (spring.bouncy)
- Mount: staggered fade-in (50ms delay per card)
- Haptic feedback on select
```

**Dependencies**: Step 1, Step 3 (AnimatedButton patterns)
**Blocks**: Steps 19, 22 (category selection screens)

---

### Step 12 — OptionChips Component

**What**: Horizontal scrollable chip/pill selector for single-select options.

**Create**: `apps/mobile/components/wizard/OptionChips.tsx`

```
Props:
- options: { id: string, label: string }[]
- selected: string | null
- onSelect: (id: string) => void

Behavior:
- Horizontal ScrollView with 8px gap
- Each chip: pill shape (RADIUS.badge), border
- Selected: primary bg + white text (crossfade 150ms)
- Unselected: transparent bg + secondary text + border
- Press scale: 0.95 → spring back
```

**Dependencies**: Step 1, Step 2
**Blocks**: Steps 17, 22 (quick-select weight, size picker)

---

### Step 13 — CountUpText Component

**What**: Animated number that counts up/down when value changes (odometer effect).

**Create**: `apps/mobile/components/animations/CountUpText.tsx`

```
Props:
- value: number
- duration?: number (default: 400ms)
- prefix?: string (e.g., "SAR ")
- suffix?: string (e.g., "/kg")
- style?: TextStyle
- decimals?: number (default: 0)

Behavior:
- On value change: interpolate from previous → new over duration
- Uses useSharedValue + useAnimatedProps
- ReText from reanimated for text value interpolation
- Smooth number transition (not snapping)
```

**Dependencies**: Step 1
**Blocks**: Steps 18, 20, 26 (pricing screens)

---

### Step 14 — SuccessCelebration Overlay

**What**: Full-screen Lottie animation overlay shown on wizard completion.

**Create**: `apps/mobile/components/animations/SuccessCelebration.tsx`

```
Props:
- visible: boolean
- animation: 'listing-created' | 'booking-confirmed' | 'delivery-complete'
- message?: string
- onComplete?: () => void

Behavior:
- Full-screen absolute overlay (z-index: 999)
- Semi-transparent backdrop (rgba(0,0,0,0.3)) fades in
- Lottie animation plays centered (200x200)
- Message text fades in below animation after 1s
- Auto-dismisses after animation complete (2-3s)
- Calls onComplete after dismiss
- Uses existing LottieAnimation component wrapper
```

**Dependencies**: Step 6 (lottie), existing `LottieAnimation.tsx`
**Blocks**: Steps 20, 26 (publish/confirm celebrations)

---

### Step 14b — Wizard barrel export

**Create**: `apps/mobile/components/wizard/index.ts`

```
export { WizardContainer } from './WizardContainer';
export { WizardStep } from './WizardStep';
export { WizardProgress } from './WizardProgress';
export { QuestionTitle } from './QuestionTitle';
export { OptionGrid } from './OptionGrid';
export { OptionChips } from './OptionChips';
```

---

### ✅ Phase 2 Checkpoint

After completing Steps 7-14:
- [ ] WizardContainer renders a 3-step test wizard with transitions
- [ ] WizardProgress animates width on step change
- [ ] WizardStep slides correctly forward/backward
- [ ] QuestionTitle renders emoji + heading pattern
- [ ] OptionGrid shows checkmark pop on select
- [ ] OptionChips highlight selected chip
- [ ] CountUpText animates number change
- [ ] SuccessCelebration shows Lottie overlay + auto-dismiss
- [ ] Run `npm run typecheck` — no new errors

---

## Phase 3: Wizard Flows (Create Screens)

> Convert the existing single-form create screens into multi-step wizards.
> **Estimated effort**: ~10 hours | **Files created**: 12 | **Files modified**: 2

---

### Step 15 — Listing Wizard: Screen 1 (Route)

**What**: "Where are you traveling?" — departure and arrival city selection.

**Create**: `apps/mobile/components/wizard/listing/RouteStep.tsx`

```
Data collected:
- departureCity: string
- departureCode: string
- arrivalCity: string
- arrivalCode: string

UI Elements:
- QuestionTitle: ✈️ "Where are you traveling?"
- Two city search inputs (From / To) with airplane icons
- Popular routes chips: [Riyadh→Jeddah] [RUH→DXB] [Jeddah→Cairo] [RUH→AMM]
- Next button appears when both cities filled (slide-up animation)

Animations:
- City search results: staggered slide-in (50ms per item)
- Popular route chips: fade in with stagger on mount
- Next button: slide up when validation passes

Validation:
- Both departure and arrival city required
- Cities must be different
```

**Dependencies**: Step 9 (WizardContainer), Step 10 (QuestionTitle), Step 12 (OptionChips)
**Blocks**: Step 21 (wire to create.tsx)

---

### Step 16 — Listing Wizard: Screen 2 (Date & Flight)

**What**: "When are you traveling?" — date picker and optional flight number.

**Create**: `apps/mobile/components/wizard/listing/DateFlightStep.tsx`

```
Data collected:
- departureDate: Date
- flightNumber: string (optional)

UI Elements:
- QuestionTitle: 📅 "When are you traveling?"
- Calendar picker (use existing DatePickerInput or inline calendar)
- Flight number text input with airplane icon
- Past dates grayed out

Animations:
- Selected date: circle scale pop (0→1) with primary color fill
- Flight input: airplane icon micro-rotates on focus
```

**Dependencies**: Step 9, Step 10, existing DatePickerInput
**Blocks**: Step 21

---

### Step 17 — Listing Wizard: Screen 3 (Weight)

**What**: "How much weight can you carry?" — slider + quick-select chips.

**Create**: `apps/mobile/components/wizard/listing/WeightStep.tsx`

```
Data collected:
- availableWeight: number

UI Elements:
- QuestionTitle: ⚖️ "How much weight can you carry?"
- Suitcase icon that scales with slider value
- Slider (1-23 kg range, step 0.5)
- Current value display: "5.0 kg"
- Quick select chips: [2kg] [5kg] [10kg] [15kg] [20kg] [23kg]
- Hint: "💡 Average carry: 5-10kg" (fades in after 1s)

Animations:
- Suitcase: interpolate scale small→large with slider value
- Slider thumb: spring physics on drag release
- Quick chip select: scale to 1.05 + border color change
- Hint: fade in after 1s delay
```

**Dependencies**: Step 9, Step 10, Step 12 (OptionChips)
**Blocks**: Step 21

---

### Step 18 — Listing Wizard: Screen 4 (Pricing)

**What**: "Set your price per kilogram" — price input with slider and estimation.

**Create**: `apps/mobile/components/wizard/listing/PricingStep.tsx`

```
Data collected:
- pricePerKg: number
- currency: string (default SAR)

UI Elements:
- QuestionTitle: 💰 "Set your price per kilogram"
- Large price display: "SAR 15" centered
- Price slider with [-] / [+] buttons
- Average range: "📊 Average: SAR 12-20/kg"
- Estimated total: "💡 Estimated total: SAR 75 (for 5kg)"
- Currency selector dropdown (SAR default)

Animations:
- Price number: count-up/down with CountUpText
- Estimated total: recalculates with number roll
- Average range: subtle pulse when price is within range
```

**Dependencies**: Step 9, Step 10, Step 13 (CountUpText)
**Blocks**: Step 21

---

### Step 19 — Listing Wizard: Screen 5 (Preferences)

**What**: "What can you carry?" — multi-select category grid, skippable.

**Create**: `apps/mobile/components/wizard/listing/PreferencesStep.tsx`

```
Data collected:
- acceptedCategories: string[] (optional)
- notes: string (optional)

UI Elements:
- QuestionTitle: 📦 "What can you carry?"
- "Tap all that apply:" instruction
- OptionGrid (2 columns): Documents, Clothing, Electronics, Gifts, Medicine, Food/Snacks
- Notes textarea: "No liquids please..."
- Skip button below Back/Next

Animations:
- Grid cards: staggered fade-in (50ms per card)
- Checkmark: scale pop 0→1.2→1.0 on select
- Selected card: border + bg tint transition
```

**Dependencies**: Step 9, Step 10, Step 11 (OptionGrid)
**Blocks**: Step 21

---

### Step 20 — Listing Wizard: Screen 6 (Review & Publish)

**What**: Review all collected data, show estimated earnings, publish.

**Create**: `apps/mobile/components/wizard/listing/ReviewStep.tsx`

```
Data displayed (from wizard state):
- Route: departureCity → arrivalCity
- Date: formatted departureDate
- Flight: flightNumber (if provided)
- Weight: availableWeight kg
- Price: pricePerKg /kg
- Categories: acceptedCategories (if provided)

UI Elements:
- QuestionTitle: ✨ "Review your listing"
- Summary card with all details + [Edit] button per section
- Estimated earnings: "SAR 75.00 (if fully booked)"
- "✈️ Publish Listing" button with gentle pulse animation

Animations:
- Summary lines: staggered slide-in (50ms each)
- Earnings: CountUpText from 0 to final value
- Publish button: pulse (scale 1.0→1.02→1.0, 3s loop)
- On publish: SuccessCelebration('listing-created')

Logic:
- Edit button per section: navigate back to that step
- Publish: call createListing mutation with all wizard data
- On success: celebration → navigate to home
- On error: show alert, stay on screen
```

**Dependencies**: Step 9, Step 13 (CountUpText), Step 14 (SuccessCelebration)
**Blocks**: Step 21

---

### Step 21 — Wire Listing Wizard to `listing/create.tsx`

**What**: Replace the existing single-form with the new WizardContainer + 6 step components.

**Modify**: `apps/mobile/app/listing/create.tsx`

```
Before: Single ScrollView with all fields in one form
After:  WizardContainer with steps array:
  1. RouteStep
  2. DateFlightStep
  3. WeightStep
  4. PricingStep
  5. PreferencesStep
  6. ReviewStep

Wire onComplete to:
  - Call useCreateListing mutation
  - Map wizard data to CreateListingDto format
  - Show SuccessCelebration
  - Navigate back to home

Keep:
  - i18n translations (add new keys for wizard)
  - Validation via shared schema
  - RTL support via WizardContainer
```

**Dependencies**: Steps 15-20 (all listing wizard screens)
**Blocks**: Nothing (end of listing wizard chain)

---

### Step 22 — Booking Wizard: Screen 1 (Item Details)

**What**: "What are you sending?" — item name, category, description.

**Create**: `apps/mobile/components/wizard/booking/ItemDetailsStep.tsx`

```
Data collected:
- itemName: string
- category: string
- description: string (optional)

UI Elements:
- QuestionTitle: 📦 "What are you sending?"
- Item name input
- Category chips (single-select): Electronics, Clothing, Documents, Gifts, Medicine, Other
- Description textarea (optional)

Animations:
- Category chip select: scale 0.95 + color transition
- Input focus: border color to primary (200ms)
```

**Dependencies**: Step 9, Step 10, Step 12 (OptionChips)
**Blocks**: Step 27

---

### Step 23 — Booking Wizard: Screen 2 (Weight & Value)

**What**: "How heavy is your item?" — visual size picker, weight, value.

**Create**: `apps/mobile/components/wizard/booking/WeightValueStep.tsx`

```
Data collected:
- weight: number
- declaredValue: number (optional)
- sizeCategory: 'envelope' | 'small' | 'medium'

UI Elements:
- QuestionTitle: ⚖️ "How heavy is your item?"
- Visual size picker: 3 cards (📨 Envelope <1kg, 📦 Small 1-3kg, 📦📦 Medium 3-7kg)
- Exact weight input (auto-fills from size selection)
- Declared value input: [SAR] [4,500] "(for insurance purposes)"

Animations:
- Selected size card: translateY -4px + border color + scale 1.03
- Weight auto-fill: number rolls to estimated value
- Package illustrations: small bounce on selection
```

**Dependencies**: Step 9, Step 10, Step 13 (CountUpText)
**Blocks**: Step 27

---

### Step 24 — Booking Wizard: Screen 3 (Photos)

**What**: "Add photos of your item" — photo upload grid.

**Create**: `apps/mobile/components/wizard/booking/PhotosStep.tsx`

```
Data collected:
- imageUrls: string[]

UI Elements:
- QuestionTitle: 📸 "Add photos of your item"
- Photo grid (3 columns): existing photos + "+" add button
- Hint: "💡 Clear photos help carriers feel confident"
- Skip button

Animations:
- Photo upload: progress circle animation around thumbnail
- Photo added: scale pop 0.8→1.0 with fade in
- Remove photo: scale down + fade out (200ms)

Logic:
- Uses existing useImageUpload hook
- Max 3 photos
- Camera or gallery picker
```

**Dependencies**: Step 9, Step 10, existing useImageUpload hook
**Blocks**: Step 27

---

### Step 25 — Booking Wizard: Screen 4 (Pickup Details)

**What**: "Where should the carrier pick up?" — location description.

**Create**: `apps/mobile/components/wizard/booking/PickupStep.tsx`

```
Data collected:
- pickupLocation: string
- pickupNotes: string (optional)

UI Elements:
- QuestionTitle: 📍 "Where should the carrier pick up?"
- Map placeholder (future: actual map with pin drop)
- Text input: "Describe meeting point"
- Example text: "King Khalid Airport, Terminal 1, Gate 3"

Animations:
- Input focus: border transition
- Map pin: bounce animation on placement (future)
```

**Dependencies**: Step 9, Step 10
**Blocks**: Step 27

---

### Step 26 — Booking Wizard: Screen 5 (Review & Book)

**What**: Review booking details, show price breakdown, confirm.

**Create**: `apps/mobile/components/wizard/booking/ReviewBookStep.tsx`

```
Data displayed:
- Carrier card: avatar + name + rating + verified badge
- Route + date from listing
- Item: name, weight, pickup location
- Price breakdown: weight × price/kg + service fee = total

UI Elements:
- QuestionTitle: ✨ "Review your booking"
- Carrier summary card
- Item summary card
- Price breakdown with line items
- "📦 Confirm Booking" button

Animations:
- Price lines: staggered appear (100ms each)
- Total: CountUpText from 0
- On confirm: SuccessCelebration('booking-confirmed')
- Auto-navigate to booking detail after celebration
```

**Dependencies**: Step 9, Step 13, Step 14
**Blocks**: Step 27

---

### Step 27 — Wire Booking Wizard to `booking/create.tsx`

**What**: Replace existing single-form booking creation with wizard flow.

**Modify**: `apps/mobile/app/booking/create.tsx`

```
Before: Single ScrollView with items array, inline image upload
After:  WizardContainer with steps array:
  1. ItemDetailsStep
  2. WeightValueStep
  3. PhotosStep
  4. PickupStep
  5. ReviewBookStep

Wire onComplete to:
  - Call useCreateBooking mutation
  - Map wizard data to CreateBookingDto (items array with single item)
  - Show SuccessCelebration
  - Navigate to booking detail

Keep:
  - Listing data loaded from route params
  - Weight validation against listing's available weight
  - i18n support
```

**Dependencies**: Steps 22-26 (all booking wizard screens)
**Blocks**: Nothing

---

### ✅ Phase 3 Checkpoint

After completing Steps 15-27:
- [ ] Navigate to listing/create → see 6-screen wizard flow
- [ ] Each screen transitions with slide animation
- [ ] Progress bar animates on step change
- [ ] Can go back/forward through all steps
- [ ] Review screen shows all collected data
- [ ] Publish triggers celebration + API call + navigation
- [ ] Navigate to booking/create → see 5-screen wizard flow
- [ ] Photo upload works within wizard
- [ ] Price breakdown calculates correctly
- [ ] Confirm triggers celebration + API call + navigation
- [ ] i18n keys work for both Arabic/English
- [ ] Run `npm run typecheck` — no new errors

---

## Phase 4: Cards, Status & Trust

> Redesign cards with new animations, add status tracking components, trust UI.
> **Estimated effort**: ~8 hours | **Files created**: 7 | **Files modified**: 3

---

### Step 28 — Redesign ListingCard

**What**: Update ListingCard with the new card design from UX plan Section 5.1.

**Modify**: `apps/mobile/components/listings/ListingCard.tsx`

```
Changes:
- Use AnimatedCard wrapper for press/entry animations
- Simplify layout to match UX plan: carrier avatar/name/rating, route, date/flight, weight+price, categories, Book Now button
- "Book Now" button: appears with slide-up animation when card is fully visible
- Verified badge: subtle shimmer on first view
- Use ANIM presets instead of inline spring configs
- Staggered entry: 100ms per card in list
- Keep both grid/list view modes but update visual style
```

**Dependencies**: Step 4 (AnimatedCard), Step 1 (ANIM)
**Blocks**: Step 40 (home screen integration)

---

### Step 29 — StatusStepper Component (Horizontal)

**What**: Horizontal dot stepper for booking status (used on TripCard).

**Create**: `apps/mobile/components/status/StatusStepper.tsx`

```
Props:
- steps: string[]          (e.g., ['Booked', 'Paid', 'Picked up', 'Transit', 'Delivered'])
- currentStep: number      (0-indexed)
- color?: string

Behavior:
- Dots connected by lines
- Completed: filled dot + solid line (color sweep left→right)
- Active: pulsing dot (scale 1.0→1.3→1.0, 2s loop)
- Future: empty dot + dashed line
- Animated dash pattern flows toward next step
- Labels below dots
```

**Dependencies**: Step 1 (ANIM)
**Blocks**: Steps 32, 33

---

### Step 30 — StatusTimeline Component (Vertical)

**What**: Vertical timeline for booking detail page.

**Create**: `apps/mobile/components/status/StatusTimeline.tsx`

```
Props:
- events: { status: string, date: string, description: string }[]
- currentIndex: number

Behavior:
- Vertical layout: dot + line + label/description/date
- Completed: filled green dot, solid line
- Active: pulsing green dot with "Live" indicator, dashed line below
- Future: gray empty dot, dashed gray line
- Entry animation: completed steps fill sequentially on mount (200ms each)
- Future steps: subtle opacity (0.4)
```

**Dependencies**: Step 1, Step 31 (LiveIndicator)
**Blocks**: Step 33

---

### Step 31 — LiveIndicator Component

**What**: Pulsing green dot for active/live status.

**Create**: `apps/mobile/components/status/LiveIndicator.tsx`

```
Props:
- size?: number (default: 8)
- color?: string (default: success green)

Behavior:
- Green circle that pulses: opacity 0.5→1.0, 1s loop
- Optional "Live" text label beside dot
- Uses withRepeat + withSequence for pulse loop
```

**Dependencies**: Step 1
**Blocks**: Step 30

---

### Step 32 — Redesign TripCard with StatusStepper

**What**: Update TripCard to include the horizontal status stepper.

**Modify**: `apps/mobile/components/trips/TripCard.tsx`

```
Changes:
- Add StatusStepper between route and item info
- Map booking.status to step index
- Use AnimatedCard wrapper
- Update layout to match UX plan Section 5.2
- Add Chat + View Detail buttons
- Keep existing animations but use ANIM presets
```

**Dependencies**: Step 29 (StatusStepper), Step 4 (AnimatedCard)
**Blocks**: Nothing

---

### Step 33 — Redesign BookingDetail with StatusTimeline

**What**: Replace simple status badge with full animated vertical timeline.

**Modify**: `apps/mobile/app/booking/[id].tsx`

```
Changes:
- Replace status badge section with StatusTimeline component
- Map booking events to timeline items
- Add LiveIndicator for active step
- Photo thumbnails: scale pop on mount
- Keep all existing action buttons and review functionality
- Animate section entries with FadeIn stagger
```

**Dependencies**: Step 30 (StatusTimeline), Step 31 (LiveIndicator)
**Blocks**: Nothing

---

### Step 34 — VerificationBadge Component

**What**: Badge overlay on avatar for verification/trust status.

**Create**: `apps/mobile/components/trust/VerificationBadge.tsx`

```
Props:
- level: 'email' | 'phone' | 'id' | 'trusted' | 'super'
- size?: number (default: 16)

Behavior:
- Positioned bottom-right of parent (use absolute positioning)
- Icon varies by level: ✉️ / 📱 / 🪪 / ⭐ / 🏆
- Color: gray for email/phone, blue for ID, gold for trusted/super
- Small circle background with icon
- Entry: scale pop 0→1 (spring.bouncy)

Note: The existing Avatar.tsx component already has a basic verification badge.
This enhances it with level-based display.
```

**Dependencies**: Step 1
**Blocks**: Nothing (can be integrated incrementally)

---

### Step 35 — RatingBars Component

**What**: Category rating bar chart (Communication, Punctuality, Item Care, Reliability).

**Create**: `apps/mobile/components/trust/RatingBars.tsx`

```
Props:
- categories: { label: string, value: number }[] (value 0-5)
- animated?: boolean (default: true)

Behavior:
- Each row: label (left) + bar (center) + value (right)
- Bar fills from 0% to (value/5 * 100)%
- Fill animation: staggered 150ms per bar
- Bar color: primary at full, gradient toward warning at low
- Bar height: 6px, radius: 3px
```

**Dependencies**: Step 1, Step 2
**Blocks**: Nothing

---

### Step 36 — ReviewCard Component

**What**: Individual review display card.

**Create**: `apps/mobile/components/trust/ReviewCard.tsx`

```
Props:
- review: { userName: string, rating: number, comment: string, date: string, avatarUrl?: string }

Behavior:
- Avatar + name + star display
- Comment text (truncated with "Show more")
- Relative date ("2 weeks ago")
- Stars pop in sequentially (100ms stagger)
- Fade in on scroll visibility
```

**Dependencies**: Step 4 (AnimatedCard), existing StarRating component
**Blocks**: Nothing

---

### Step 37 — StaggeredList Component

**What**: FlatList wrapper that animates items with staggered entry.

**Create**: `apps/mobile/components/animations/StaggeredList.tsx`

```
Props:
- data: T[]
- renderItem: (item: T, index: number) => ReactNode
- staggerDelay?: number (default: 80ms)
- ...FlatListProps

Behavior:
- Each item wrapped in Animated.View
- Entry: FadeInUp.delay(index * staggerDelay).springify()
- Layout.springify() for list changes
- Pull-to-refresh support
- Scroll-aware: only animate items entering viewport
```

**Dependencies**: Step 1
**Blocks**: Step 40 (home screen)

---

### Step 37b — Trust and status barrel exports

**Create**: `apps/mobile/components/status/index.ts`
**Create**: `apps/mobile/components/trust/index.ts`

---

### ✅ Phase 4 Checkpoint

After completing Steps 28-37:
- [ ] ListingCard shows new design with AnimatedCard wrapper
- [ ] TripCard shows horizontal status stepper
- [ ] BookingDetail shows vertical timeline with live indicator
- [ ] VerificationBadge renders correct icon per level
- [ ] RatingBars animate fill on mount
- [ ] ReviewCard shows review with star animation
- [ ] StaggeredList animates item entry
- [ ] All existing functionality preserved (navigation, data, i18n)
- [ ] Run `npm run typecheck` — no new errors

---

## Phase 5: Polish & Empty States

> Add Lottie empty states, pull-to-refresh, home screen integration, RTL adjustments, perf optimization.
> **Estimated effort**: ~4 hours | **Files created**: 1-2 | **Files modified**: 4-5

---

### Step 38 — Empty States with Lottie Animations

**What**: Update empty state screens to use themed Lottie animations.

**Modify**: `apps/mobile/components/common/EmptyState.tsx`

```
Changes:
- Add animation name mapping:
  - 'no-listings' → empty-suitcase (or existing search animation)
  - 'no-messages' → empty-chat (or existing chat animation)
  - 'no-trips'    → empty-plane (or existing airplane animation)
- Entry: fade in with scale 0.9→1.0
- Title/description: staggered FadeInUp

Note: The existing EmptyState.tsx already has Lottie support.
Add new animation variants and ensure consistent styling.
```

**Dependencies**: Existing LottieAnimation component
**Blocks**: Nothing

---

### Step 39 — Pull-to-Refresh Airplane Animation

**What**: Custom pull-to-refresh indicator with rotating airplane.

**Modify**: `apps/mobile/app/(tabs)/index.tsx`

```
Changes:
- Replace default RefreshControl with custom animated header
- Show airplane icon that rotates as user pulls down
- On release: airplane "flies up" off screen
- Trigger data refresh on release

Implementation:
- Use onScroll event to track pull distance
- Interpolate rotation: pull distance → airplane rotation (0 to 360deg)
- On refresh trigger: airplane scale 1→0 + translateY -100
- Reset when refresh completes
```

**Dependencies**: Step 1 (ANIM)
**Blocks**: Nothing

---

### Step 40 — Home Screen Redesign Integration

**What**: Integrate all new components into the home screen.

**Modify**: `apps/mobile/app/(tabs)/index.tsx`

```
Changes:
- Use StaggeredList for listing rendering
- Use SkeletonLoader for loading state (instead of text "Loading...")
- Redesigned search bar: expands with spring on tap
- Tab toggle underline: slides with spring.snappy
- FAB: scale-in on mount (0→1 with spring.bouncy)
- Map/List toggle: crossfade transition (200ms)
- Integrate new ListingCard design
- Skeleton loading grid (3 skeleton cards while fetching)
```

**Dependencies**: Steps 5 (Skeleton), 28 (ListingCard), 37 (StaggeredList)
**Blocks**: Nothing

---

### Step 41 — RTL Animation Adjustments

**What**: Ensure all animations respect RTL direction.

**Modify**: Multiple files

```
Changes needed:
- WizardStep: reverse slide direction for RTL
- WizardProgress: fill from right in RTL
- StatusStepper: reverse dot order + fill direction for RTL
- StatusTimeline: move dots to right side for RTL
- FAB: position bottom-left for RTL
- Slide transitions: from left instead of right for RTL
- Swipe gestures: reverse direction for RTL

Implementation:
- Use rtlAwareSlide() helper from lib/animations.ts
- Check i18n.language === 'ar' or I18nManager.isRTL
- Apply multiplier (-1 for RTL) to horizontal translations
```

**Dependencies**: Steps 8, 9, 29, 30
**Blocks**: Nothing

---

### Step 42 — Performance Optimization Pass

**What**: Ensure animations don't cause jank or unnecessary re-renders.

**Modify**: Multiple files

```
Optimizations:
1. useMemo for animation style objects that don't change
2. useCallback for all onPress handlers in animated components
3. worklet functions for all Reanimated callbacks (run on UI thread)
4. cancelAnimation() cleanup in useEffect returns
5. Lazy-load Lottie animations (don't import all at once)
6. shouldComponentUpdate / React.memo for list items
7. InteractionManager.runAfterInteractions for heavy setup
8. Reduce layout animation scope (Layout.springify only where needed)
9. Profile with Flipper/React DevTools to verify <16ms frames
```

**Dependencies**: All previous steps
**Blocks**: Nothing (final step)

---

### ✅ Phase 5 Checkpoint (Final)

After completing Steps 38-42:
- [ ] Empty states show Lottie animations
- [ ] Pull-to-refresh shows airplane animation
- [ ] Home screen uses skeleton loaders + staggered lists
- [ ] All animations work correctly in RTL mode
- [ ] No jank on mid-range devices (test with JS thread profiling)
- [ ] Run `npm run typecheck` — no new errors
- [ ] Full smoke test: create listing wizard → create booking wizard → view booking → chat

---

## i18n Keys Required

Add to `apps/mobile/i18n/locales/en.json` and `ar.json`:

```
wizard.step: "Step {{current}}/{{total}}"
wizard.next: "Next"
wizard.back: "Back"
wizard.skip: "Skip"
wizard.publish: "Publish Listing"
wizard.confirm: "Confirm Booking"

listing.wizard.route.title: "Where are you traveling?"
listing.wizard.route.from: "From"
listing.wizard.route.to: "To"
listing.wizard.route.searchCity: "Search city..."
listing.wizard.route.popular: "Popular Routes:"
listing.wizard.date.title: "When are you traveling?"
listing.wizard.date.flight: "Flight number (optional)"
listing.wizard.weight.title: "How much weight can you carry?"
listing.wizard.weight.hint: "Average carry: 5-10kg"
listing.wizard.pricing.title: "Set your price per kilogram"
listing.wizard.pricing.average: "Average: SAR {{min}}-{{max}}/kg"
listing.wizard.pricing.estimated: "Estimated total: SAR {{total}}"
listing.wizard.preferences.title: "What can you carry?"
listing.wizard.preferences.tapAll: "Tap all that apply:"
listing.wizard.review.title: "Review your listing"
listing.wizard.review.earnings: "Estimated earnings:"
listing.wizard.review.ifBooked: "(if fully booked)"

booking.wizard.item.title: "What are you sending?"
booking.wizard.item.name: "Item name"
booking.wizard.item.category: "Category"
booking.wizard.weight.title: "How heavy is your item?"
booking.wizard.weight.exact: "Exact weight"
booking.wizard.weight.value: "Declared value"
booking.wizard.weight.insurance: "(for insurance purposes)"
booking.wizard.photos.title: "Add photos of your item"
booking.wizard.photos.hint: "Clear photos help carriers feel confident"
booking.wizard.pickup.title: "Where should the carrier pick up?"
booking.wizard.pickup.describe: "Describe meeting point"
booking.wizard.review.title: "Review your booking"
booking.wizard.review.carrier: "Carrier:"
booking.wizard.review.item: "Your item:"
booking.wizard.review.breakdown: "Price breakdown:"
booking.wizard.review.serviceFee: "Service fee"
booking.wizard.review.total: "Total"

categories.documents: "Documents"
categories.clothing: "Clothing"
categories.electronics: "Electronics"
categories.gifts: "Gifts"
categories.medicine: "Medicine"
categories.food: "Food/Snacks"
categories.other: "Other"

sizes.envelope: "Envelope"
sizes.small: "Small Box"
sizes.medium: "Medium Box"

status.live: "Live"
```

---

## Lottie Asset Checklist

Source from [LottieFiles.com](https://lottiefiles.com) (free tier):

| File | Search Term | Status |
|------|-------------|--------|
| `airplane-flight.json` | "airplane flying" | ⬜ Download |
| `listing-created.json` | "success checkmark confetti" | ⬜ Download |
| `booking-confirmed.json` | "package delivery success" | ⬜ Download |
| `delivery-complete.json` | "delivery complete stars" | ⬜ Download |
| `confetti.json` | "confetti celebration" | ⬜ Download |
| `empty-suitcase.json` | "empty suitcase" | ⬜ Download |
| `empty-chat.json` | "no messages" | ⬜ Download |
| `empty-plane.json` | "airplane empty" | ⬜ Download |
| `typing-dots.json` | "typing indicator dots" | ⬜ Download |

**Directory**: `apps/mobile/assets/lottie/`

---

## Summary Table

| Phase | Steps | New Files | Modified Files | Effort |
|-------|-------|-----------|----------------|--------|
| 1. Foundations | 1-6 | 6 | 2 | ~4h |
| 2. Wizard System | 7-14 | 9 | 0 | ~6h |
| 3. Wizard Flows | 15-27 | 12 | 2 | ~10h |
| 4. Cards & Status | 28-37 | 9 | 3 | ~8h |
| 5. Polish | 38-42 | 1 | 5 | ~4h |
| **Total** | **42** | **37** | **12** | **~32h** |

---

## Parallelization Opportunities

Steps that can be built concurrently (independent of each other):

| Parallel Group | Steps | Reason |
|---------------|-------|--------|
| Foundation primitives | 3 + 4 + 5 | All depend only on Steps 1-2 |
| Wizard components | 10 + 11 + 12 + 13 | All depend only on Steps 1-2 |
| Listing screens | 15 + 16 + 17 + 18 + 19 | All depend on Step 9, independent of each other |
| Booking screens | 22 + 23 + 24 + 25 | All depend on Step 9, independent of each other |
| Status components | 29 + 31 + 34 | Independent primitives |
| Trust components | 35 + 36 + 37 | Independent of each other |
| Polish items | 38 + 39 + 41 | Independent of each other |

---

*Generated from UX_DESIGN_PLAN.md — maps every design spec to a concrete implementation step with file paths, dependencies, and validation checkpoints.*
