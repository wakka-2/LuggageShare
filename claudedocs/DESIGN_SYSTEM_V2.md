# LuggageShare V2 Design System

> **Version**: 2.0
> **Status**: Approved — prototype validated at `/home-v2-test`
> **Last Updated**: 2026-03-06
> **Platforms**: React Native (Expo SDK 52) + Next.js 14
> **Direction**: Bubbly, light, colorful — organic backgrounds, pill shapes, soft shadows

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Shape Language](#5-shape-language)
6. [Elevation & Shadows](#6-elevation--shadows)
7. [Component Library](#7-component-library)
8. [Iconography](#8-iconography)
9. [Motion & Animation](#9-motion--animation)
10. [Background System](#10-background-system)
11. [Accessibility](#11-accessibility)
12. [Platform Adaptations](#12-platform-adaptations)
13. [Migration Guide (V1 → V2)](#13-migration-guide-v1--v2)

---

## 1. Design Principles

### 1.1 Guiding Values

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Bubbly** | Rounded, soft, approachable — never sharp or angular | `borderRadius: 50` on buttons/pills, `22` on cards, `28` on hero cards |
| **Light** | White and lavender base, airy feel, no heavy dark blocks | `#F8F5FF` backgrounds, white cards, no dark sections in light mode |
| **Colorful** | Purposeful color accents that create visual hierarchy | Each accent color has a semantic role (mint=success, coral=action, amber=warning) |
| **Organic** | Irregular blob shapes break rigid grid layouts | SVG `<Circle>`/`<Ellipse>` blobs at 30-60% opacity behind content |
| **Trustworthy** | Clean, professional feel despite playful shapes | Consistent spacing, readable typography, predictable interaction patterns |

### 1.2 Design DNA

```
V1 (Glass-morphism)          →  V2 (Bubbly Organic)
──────────────────────────────────────────────────────
Backdrop blur                →  Solid white surfaces
3px bottom borders           →  Soft purple-tinted shadows
Rectangular buttons          →  Pill-shaped (borderRadius: 50)
Flat backgrounds             →  Floating SVG blob shapes
Dark-tinted glass            →  Light lavender (#F8F5FF)
Sharp-edged inputs           →  Capsule inputs with dot indicators
Platform-native shadows      →  Unified purple shadow system
Section tint blocks          →  Organic blob color zones
```

---

## 2. Color System

### 2.1 Core Palette

```
┌──────────────────────────────────────────────────────────────┐
│  PRIMARY COLORS                                              │
├──────────────────────────────────────────────────────────────┤
│  ■ #7C6AFF  primary        Buttons, links, active states     │
│  ■ #9D8FFF  primaryMid     Gradient midpoints                │
│  ■ #B4ABFF  primaryLight   Gradient ends, hover states       │
│  ■ #5A52D5  primaryDark    Pressed states (darken 15%)       │
├──────────────────────────────────────────────────────────────┤
│  ACCENT COLORS                                               │
├──────────────────────────────────────────────────────────────┤
│  ■ #FF6B9D  secondary      Coral pink — notifications, CTAs  │
│  ■ #56D8B1  accent1        Mint green — success, "from" dots │
│  ■ #FFBE5C  accent2        Warm amber — warnings, dates      │
│  ■ #5CB8FF  accent3        Sky blue — info, links            │
├──────────────────────────────────────────────────────────────┤
│  NEUTRALS                                                    │
├──────────────────────────────────────────────────────────────┤
│  ■ #F8F5FF  bg             Screen background (light lavender)│
│  ■ #FFFFFF  white          Card surfaces                     │
│  ■ #2D2B55  text           Primary text (dark indigo)        │
│  ■ #6E6B8A  textSoft       Secondary text                    │
│  ■ #A8A5C0  textMuted      Placeholders, timestamps          │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Blob Colors (Background Decorations)

| Token | Hex | Opacity | Usage |
|-------|-----|---------|-------|
| `blob1` | `#EDE7FF` | 30-60% | Purple blob — near primary actions |
| `blob2` | `#FFE5ED` | 30-50% | Pink blob — near secondary areas |
| `blob3` | `#E0F7EE` | 30-50% | Mint blob — near success areas |
| `blob4` | `#FFF3D6` | 30-40% | Amber blob — near info/warning areas |

### 2.3 Semantic Colors

| Role | Color | Token | Usage |
|------|-------|-------|-------|
| Success | `#56D8B1` | `accent1` | Confirmations, completed steps, "from" route dots |
| Error | `#FF6B9D` | `secondary` | Errors, delete, cancel, "to" route dots |
| Warning | `#FFBE5C` | `accent2` | Caution notices, pending states |
| Info | `#5CB8FF` | `accent3` | Help text, info badges, links |

### 2.4 Shadow Color

All shadows use a single unified token:

```
rgba(124, 106, 255, 0.12)    // Purple-tinted shadow
```

This creates a cohesive, branded shadow feel instead of generic gray.

### 2.5 Opacity Modifiers

When applying a color as a background tint, use hex opacity suffixes:

| Suffix | Opacity | Usage |
|--------|---------|-------|
| `+ '08'` | 3% | Ultra-subtle borders |
| `+ '12'` | 7% | Tinted chip backgrounds |
| `+ '18'` | 9% | Icon circle backgrounds |
| `+ '20'` | 13% | Avatar circle backgrounds |
| `+ '30'` | 19% | Soft badge backgrounds |

### 2.6 Gradients

| Name | Colors | Direction | Usage |
|------|--------|-----------|-------|
| `primary` | `#7C6AFF → #9D8FFF → #B4ABFF` | ↘ diagonal | Hero cards, featured sections |
| `primaryHorizontal` | `#7C6AFF → #9D8FFF` | → horizontal | Search button, CTA buttons |
| `warm` | `#FFBE5C → #FF6B9D` | → horizontal | Promo cards, urgency indicators |
| `mint` | `#56D8B1 → #5CB8FF` | → horizontal | Success states, completion |

### 2.7 Dark Mode (Future)

Dark mode uses the same shape language with inverted luminance:

| Light Token | Dark Equivalent | Notes |
|-------------|-----------------|-------|
| `#F8F5FF` bg | `#0D0D1A` | Deep indigo background |
| `#FFFFFF` card | `#1A1A2E` | Dark surface |
| `#2D2B55` text | `#F0F0FF` | Light text |
| Blob opacity 30-60% | Blob opacity 10-20% | Subtler blobs |
| `rgba(124,106,255,0.12)` shadow | `rgba(139,131,255,0.15)` | Slightly brighter shadow |

---

## 3. Typography

### 3.1 Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| `hero` | 28px | 800 | 36px | -0.5 | Hero card titles |
| `h1` | 24px | 800 | 32px | -0.5 | Screen titles, header names |
| `h2` | 18px | 700 | 25px | -0.3 | Section titles |
| `h3` | 16px | 700 | 22px | 0 | Card titles, stat values |
| `body` | 16px | 400 | 24px | 0 | Body text, descriptions |
| `bodyBold` | 16px | 700 | 24px | 0 | Emphasized body text |
| `caption` | 14px | 500 | 21px | 0 | Greeting text, subtitles |
| `captionBold` | 14px | 700 | 21px | 0 | Button text, see-all links |
| `small` | 13px | 600 | 18px | 0 | Pill text, chip text |
| `micro` | 11px | 600 | 16px | 0.5 | Stat labels, timestamps |
| `label` | 12px | 600 | 17px | 0 | Meta text, chip content |

### 3.2 V1 → V2 Typography Changes

| Name | V1 Size | V1 Weight | V2 Size | V2 Weight | Notes |
|------|---------|-----------|---------|-----------|-------|
| `hero` | — | — | 28px | 800 | **NEW** — V1 had no hero level |
| `h1` | 32px | 700 | 24px | 800 | Smaller size, heavier weight |
| `h2` | 24px | 600 | 18px | 700 | Smaller, bolder |
| `h3` | 18px | 600 | 16px | 700 | Slightly smaller, bolder |
| `body` | 16px | 400 | 16px | 400 | Unchanged |
| `caption` | 14px | 400 | 14px | 500 | Slightly bolder |
| `small` | 12px | 500 | 13px | 600 | 1px larger, bolder |
| `micro` | 10px | 600 | 11px | 600 | 1px larger |
| `bodyBold` | — | — | 16px | 700 | **NEW** |
| `captionBold` | — | — | 14px | 700 | **NEW** |
| `label` | — | — | 12px | 600 | **NEW** |

> **Rationale**: V2 uses smaller heading sizes with heavier weights to achieve a compact, punchy feel that matches the bubbly aesthetic. The bold V1 `h1: 32px` felt too editorial — V2 prefers a `hero: 28px` for special moments and a tighter `h1: 24px` for standard screen titles.

### 3.3 Font Families

| Platform | Latin | Arabic |
|----------|-------|--------|
| Mobile (RN) | System default | System default |
| Web (Next.js) | Inter (400, 500, 600, 700, 800) | Tajawal (400, 500, 700) |

### 3.4 Typography Rules

- **Hero titles**: Always weight `800`, negative letter spacing
- **Section titles**: Weight `700`, dark indigo `#2D2B55`
- **Body text**: Weight `400-500`, soft text `#6E6B8A`
- **Placeholders**: Weight `500`, muted `#A8A5C0`
- **Button text**: Weight `700`, uppercase ONLY for micro labels
- **ALL-CAPS**: Reserved exclusively for `micro` labels (stat labels, badges)

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

```
Index:  0    1    2    3    4    5    6    7    8    9    10
Value:  0    4    8    12   16   20   24   32   40   48   64
        px   px   px   px   px   px   px   px   px   px   px
```

### 4.2 Screen Layout

```
┌─────────────────────────────────────────┐
│  SafeAreaView (edges: ['top'])          │
│  backgroundColor: #F8F5FF              │
│                                         │
│  ┌─ BackgroundBlobs (absolute fill) ──┐ │
│  │  SVG circles/ellipses              │ │
│  │  pointerEvents: 'none'            │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌─ ScrollView ──────────────────────┐  │
│  │                                    │  │
│  │  paddingHorizontal: 20            │  │
│  │  gap between sections: 24         │  │
│  │                                    │  │
│  │  ┌─ Section ────────────────────┐ │  │
│  │  │  marginBottom: 24            │ │  │
│  │  └──────────────────────────────┘ │  │
│  │                                    │  │
│  │  ┌─ Bottom Spacer ─────────────┐  │  │
│  │  │  height: 100 (tab bar)      │  │  │
│  │  └─────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
│                                         │
│  ┌─ Tab Bar (solid white) ────────────┐ │
│  │  height: 64                        │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4.3 Common Layout Values

| Context | Value | Notes |
|---------|-------|-------|
| Screen horizontal padding | `20px` | Consistent content margins |
| Section gap | `24px` | Vertical space between sections |
| Card internal padding | `18px` | Default padding inside BubbleCard |
| Row gap | `8-12px` | Between inline items (pills, chips, icons) |
| Grid gap | `12px` | Between stat cards, grid items |
| Bottom tab bar spacer | `100px` | Clearance for absolute tab bar |
| Hero card padding | `28px` | Larger padding for gradient hero cards |

> **Note on non-standard values**: `18px` (card padding) and `28px` (hero padding) are not in the base SPACING array `[0,4,8,12,16,20,24,32,40,48,64]`. These are intentional design-specific values that should be hardcoded in component styles rather than referenced as spacing tokens. They provide the visual padding that feels right for the bubbly aesthetic.

---

## 5. Shape Language

### 5.1 Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `pill` | `50px` | Buttons, inputs, pills, badges — the signature V2 shape |
| `heroCard` | `28px` | Hero gradient cards, profile banners |
| `card` | `22px` | Standard content cards |
| `input` | `50px` | Text inputs (capsule shape) |
| `avatar` | `50%` | Profile images (always circular) |
| `iconCircle` | `50%` | Icon background circles |
| `dot` | `50%` | Route dots, notification dots, status dots |

### 5.2 Shape Hierarchy

```
Most rounded (pill)  ─────────────────────  Least rounded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Buttons       Inputs       Cards        Hero cards
  Pills         Badges       Modals       Textareas
  Chips         Dots         Bottom sheets

  borderRadius: 50           22           28
```

### 5.3 Border Rules

- **Cards**: No visible border — use shadow only
- **Inputs**: No border in rest state — use shadow. Optional `1.5px` border on focus (primary color)
- **Pills (inactive)**: `1.5px` border, color `rgba(124,106,255,0.08)`
- **Pills (active)**: No border — filled background
- **Outline buttons**: `2px` border, color matches button accent

---

## 6. Elevation & Shadows

### 6.1 Shadow Scale

All shadows use the unified purple-tinted color `rgba(124, 106, 255, 0.12)`.

| Level | Offset Y | Blur | Opacity | Elevation (Android) | Usage |
|-------|----------|------|---------|---------------------|-------|
| `xs` | 2px | 8px | 1.0 | 2 | Inputs, pills, icon buttons |
| `sm` | 4px | 12px | 1.0 | 3 | Icon buttons, header actions |
| `md` | 6px | 16px | 0.15 | 4 | Cards, stat bubbles |
| `lg` | 6px | 20px | 1.0 | 4 | Listing cards, feature cards |
| `glow` | 4px | 16px | 0.30 | 8 | Primary CTA, create button (color: `#7C6AFF`) |

### 6.2 Shadow Implementation

```typescript
// React Native
const BUBBLE_SHADOWS = {
  xs: {
    shadowColor: 'rgba(124,106,255,0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  sm: {
    shadowColor: 'rgba(124,106,255,0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  md: {
    shadowColor: 'rgba(124,106,255,0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: 'rgba(124,106,255,0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  glow: {
    shadowColor: '#7C6AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

```css
/* Tailwind CSS (web) — add to tailwind.config.ts */
boxShadow: {
  'bubble-xs': '0 2px 8px rgba(124,106,255,0.12)',
  'bubble-sm': '0 4px 12px rgba(124,106,255,0.12)',
  'bubble-md': '0 6px 16px rgba(124,106,255,0.12)',
  'bubble-lg': '0 6px 20px rgba(124,106,255,0.12)',
  'bubble-glow': '0 4px 16px rgba(124,106,255,0.30)',
}
```

---

## 7. Component Library

### 7.1 BubbleCard

The primary container component. Replaces `GlassCard` and `SolidCard`.

```
┌─────────────────────────────────┐
│  ╭───────────────────────────╮  │   backgroundColor: #FFFFFF
│  │                           │  │   borderRadius: 22
│  │     Content goes here     │  │   padding: 18
│  │                           │  │   shadow: lg (purple-tinted)
│  ╰───────────────────────────╯  │   border: none
│       ░░ purple shadow ░░       │
└─────────────────────────────────┘
```

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Card content |
| `style` | `StyleProp<ViewStyle>` | — | Style overrides |
| `tint` | `string` | `#FFFFFF` | Background color (e.g., `blob4` for amber tint) |
| `noPadding` | `boolean` | `false` | Remove internal padding |
| `shadow` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'lg'` | Shadow intensity |

### 7.2 BubbleButton

Pill-shaped interactive button with optional icon.

```
  Filled:    ╭──────────────────╮
             │  ✈  Carry & Earn │
             ╰──────────────────╯

  Outline:   ╭╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╮
             │  ✈  Carry & Earn │
             ╰╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╯

  Gradient:  ╭▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╮
             │  🔍 Search       │
             ╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
```

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Button text |
| `onPress` | `() => void` | — | Press handler |
| `icon` | `IoniconsName` | — | Left-side icon |
| `variant` | `'filled' \| 'outline' \| 'gradient'` | `'filled'` | Visual style |
| `color` | `string` | `primary` | Fill/border color |
| `textColor` | `string` | `#FFF` | Text and icon color |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding scale |
| `fullWidth` | `boolean` | `false` | Stretch to container width |
| `loading` | `boolean` | `false` | Show spinner, disable press |
| `disabled` | `boolean` | `false` | Greyed out, non-interactive |

**Sizes**:

| Size | paddingH | paddingV | fontSize | iconSize |
|------|----------|----------|----------|----------|
| `sm` | 14px | 10px | 13px | 16px |
| `md` | 20px | 14px | 14px | 18px |
| `lg` | 28px | 18px | 16px | 20px |

### 7.3 BubbleInput

Capsule-shaped text input with colored dot indicator.

```
  Rest:    ╭────────────────────────────╮
           │  ●  From city...           │
           ╰────────────────────────────╯

  Focus:   ╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
           │  ●  Dubai                  │
           ╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
```

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Input value |
| `onChangeText` | `(text: string) => void` | — | Change handler |
| `placeholder` | `string` | — | Placeholder text |
| `dotColor` | `string` | — | Colored dot indicator (left side) |
| `icon` | `IoniconsName` | — | Alternative to dot (shows icon instead) |
| `error` | `string` | — | Error message shown below input |
| `multiline` | `boolean` | `false` | Textarea mode (uses `borderRadius: 22`) |
| `editable` | `boolean` | `true` | Enable/disable input |

### 7.4 BubblePill

Category/filter toggle pill.

```
  Inactive:  ╭────────────╮         Active:  ╭▓▓▓▓▓▓▓▓▓▓▓╮
             │  ✈ Carriers │                  │  ✈ Carriers │
             ╰────────────╯                  ╰▓▓▓▓▓▓▓▓▓▓▓╯
```

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Pill text |
| `active` | `boolean` | `false` | Filled state |
| `onPress` | `() => void` | — | Press handler |
| `icon` | `IoniconsName` | — | Left icon |
| `count` | `number` | — | Optional count badge |
| `color` | `string` | `primary` | Active fill color |

### 7.5 BackgroundBlobs

Decorative SVG blob layer rendered behind screen content.

```
  ┌─────────────────────┐
  │         ○            │   5-6 SVG shapes per screen
  │  ○                   │   Position: absoluteFill
  │              ○       │   pointerEvents: 'none'
  │     ○                │   Opacity: 30-60%
  │                ○     │   Colors: blob1-blob4
  └─────────────────────┘
```

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'full' \| 'subtle'` | `'full'` | `'subtle'` = fewer, lighter blobs |
| `height` | `number` | `900` | SVG canvas height |

**Blob Placement Rules**:
- Blobs overflow screen edges (negative cx or cx > screenWidth)
- No overlap with interactive elements
- Opacity decreases toward bottom (50-60% top, 30-40% bottom)
- Mix sizes: r=60 (small) to r=160 (large)

### 7.6 StatBubble

Metric display card with icon, value, and label.

```
  ╭──────────────╮
  │     (👥)      │    Icon circle: 44x44
  │    2.5K       │    Value: 22px, weight 800
  │  TRAVELERS    │    Label: 11px, uppercase
  ╰──────────────╯
```

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Metric value |
| `label` | `string` | Metric label |
| `icon` | `IoniconsName` | Circle icon |
| `color` | `string` | Accent color for icon and value text |

### 7.7 IconButton

Circular icon-only button for header actions.

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `IoniconsName` | — | Icon name |
| `onPress` | `() => void` | — | Press handler |
| `size` | `number` | `44` | Circle diameter |
| `badge` | `number` | — | Notification count (red dot if > 0) |
| `badgeColor` | `string` | `secondary` | Badge dot color |

### 7.8 MetaChip

Small informational capsule for metadata.

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `IoniconsName` | — | Left icon |
| `label` | `string` | — | Text content |
| `color` | `string` | — | Tint color (uses `+ '12'` for bg) |
| `bold` | `boolean` | `false` | Bold font weight |

### 7.9 SectionHeader

Section title with optional "See All" action link.

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Section title |
| `actionLabel` | `string` | — | Right-side link text |
| `onAction` | `() => void` | — | Link press handler |

---

## 8. Iconography

### 8.1 Icon Library

**Source**: `@expo/vector-icons` → `Ionicons` (outline variants preferred)

### 8.2 Icon Sizing

| Context | Size | Notes |
|---------|------|-------|
| Tab bar | 24px | System default |
| Header actions | 22px | Inside 44px icon buttons |
| Card icons | 18-22px | Inside 44px icon circles |
| Inline (pills, chips) | 13-14px | Next to text labels |
| Route arrows | 14px | Between city names |
| Button icons | 18px | Left of button label |

### 8.3 Icon Colors

- **Active/interactive**: Accent color matching context
- **Inactive/decorative**: `#A8A5C0` (textMuted)
- **On primary background**: `#FFFFFF`
- **In colored circles**: Full accent color, circle bg = color + `'18'`

### 8.4 Route Dots

Small colored circles indicating origin/destination:

| Dot | Color | Size | Usage |
|-----|-------|------|-------|
| Origin ("From") | `#56D8B1` (mint) | 8-10px | Search inputs, listing cards, route cards |
| Destination ("To") | `#FF6B9D` (coral) | 8-10px | Search inputs, listing cards, route cards |

---

## 9. Motion & Animation

### 9.1 Enter Animations

Using `react-native-reanimated`:

| Animation | Trigger | Duration | Delay Pattern |
|-----------|---------|----------|---------------|
| `FadeInDown` | Screen load — header, hero | 500ms | Base: 0ms |
| `FadeInUp` | Screen load — content below hero | 500ms | Staggered: +70ms per item |
| `FadeIn` | Lazy-loaded content | 300ms | On visibility |

### 9.2 Interaction Animations

| Animation | Trigger | Values | Easing |
|-----------|---------|--------|--------|
| Button press | `onPressIn` | `scale: 0.96`, `opacity: 0.9` | Spring (damping: 15, stiffness: 300) |
| Button release | `onPressOut` | `scale: 1.0`, `opacity: 1.0` | Spring (damping: 12, stiffness: 200) |
| Pill toggle | `onPress` | `scale: 0.95 → 1.0` | Spring |
| Pull-to-refresh | `onRefresh` | Airplane rotation 360° | Linear, repeat |
| Search swap | `onSwap` | `rotateZ: 180°` | Spring |

### 9.3 Animation Rules

- **Entrance**: Stagger content top-to-bottom, 70ms increments
- **Interactions**: Spring physics only — never linear timing for touch
- **Duration cap**: 500ms max for entrance, 300ms max for interaction
- **Reduced motion**: Respect `prefers-reduced-motion` — skip entrance, keep functional

---

## 10. Background System

### 10.1 SVG Blob Specifications (React Native)

Each screen renders `<BackgroundBlobs />` with 4-6 SVG shapes:

```
  Position        Shape      Color    Radius   Opacity
  ─────────────────────────────────────────────────────
  Top-right       Circle     blob1    140      0.6
  Top-left        Ellipse    blob2    100x120  0.5
  Mid-right       Circle     blob3    100      0.5
  Bottom-left     Ellipse    blob4    160x130  0.4
  Bottom-right    Circle     blob1    60       0.3
```

### 10.2 CSS Blob Backgrounds (Next.js Web)

```css
.blob-background {
  background-color: #F8F5FF;
  background-image:
    radial-gradient(ellipse 280px 280px at calc(100% + 30px) 80px, #EDE7FF99, transparent),
    radial-gradient(ellipse 200px 240px at -20px 200px, #FFE5ED80, transparent),
    radial-gradient(circle 200px at calc(100% + 20px) 420px, #E0F7EE80, transparent),
    radial-gradient(ellipse 320px 260px at 40px 650px, #FFF3D666, transparent);
}
```

### 10.3 Blob Placement Rules

| Rule | Description |
|------|-------------|
| Overflow edges | Blobs extend beyond screen edges |
| No CTA overlap | Don't interfere with interactive elements |
| Color proximity | Match blob color to nearby semantic content |
| Opacity decay | Top: 50-60%, Bottom: 30-40% |
| Size variation | Mix r=60 (small) to r=160 (large) |

---

## 11. Accessibility

### 11.1 Color Contrast (WCAG AA)

| Combination | Ratio | Result |
|-------------|-------|--------|
| `#2D2B55` on `#FFFFFF` | 12.4:1 | AAA |
| `#2D2B55` on `#F8F5FF` | 11.2:1 | AAA |
| `#6E6B8A` on `#FFFFFF` | 5.1:1 | AA |
| `#FFFFFF` on `#7C6AFF` | 4.8:1 | AA large text |
| `#A8A5C0` on `#FFFFFF` | 2.9:1 | Decorative only |

### 11.2 Touch Targets

| Element | Minimum Size |
|---------|-------------|
| Buttons | 44x44px (Apple HIG) |
| Icon buttons | 44x44px explicit |
| Pills/chips | 44px height with padding |
| List items | 48px height |
| Tab bar items | 48x64px |

### 11.3 Focus & RTL

- **Press state**: `scale(0.96)` + `opacity(0.9)`
- **Web focus ring**: `2px solid #7C6AFF`, `4px` offset
- **RTL layout**: Use `marginStart`/`marginEnd`, flip directional icons
- **Blobs**: Not mirrored in RTL (decorative, non-semantic)

---

## 12. Platform Adaptations

### 12.1 React Native

| Feature | iOS | Android |
|---------|-----|---------|
| Shadows | Full `shadowColor/Offset/Opacity/Radius` | `elevation` only |
| Blobs | `react-native-svg` | Same |
| Gradients | `expo-linear-gradient` | Same |
| Safe areas | `react-native-safe-area-context` | Same |

### 12.2 Web

| Feature | Implementation |
|---------|---------------|
| Shadows | CSS `box-shadow` with full color |
| Blobs (Expo Web) | SVG renders natively |
| Blobs (Next.js) | CSS `radial-gradient` |
| Hover states | `:hover` lighten 10% |

### 12.3 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, bottom tabs |
| Tablet | 768-1024px | 2-column, sidebar nav |
| Desktop | > 1024px | Sidebar + content, wider cards |

---

## 13. Migration Guide (V1 → V2)

### 13.1 Component Replacement Map

| V1 Component | V2 Replacement | Key Change |
|--------------|----------------|------------|
| `GlassCard` | `BubbleCard` | No blur, solid white, purple shadow |
| `SolidCard` | `BubbleCard` | No 3D border, radius 22, purple shadow |
| `Card` | `BubbleCard` | Radius 22, purple shadow |
| `GlassInput` | `BubbleInput` | Capsule shape, colored dot, no blur |
| `Input` | `BubbleInput` | Capsule shape, colored dot |
| `Button` (primary) | `BubbleButton` (filled) | Pill shape (radius 50) |
| `Button` (outline) | `BubbleButton` (outline) | Pill shape, 2px border |
| `GradientButton` | `BubbleButton` (gradient) | Pill shape — keep for hero CTAs |
| `GlassTabBarBackground` | Solid white view | Remove blur, add purple shadow |

### 13.2 Token Changes

| V1 Token | V2 Token | Change |
|----------|----------|--------|
| `colors.background` `#FAFAFF` | `#F8F5FF` | Warmer lavender |
| `colors.primary` `#6C63FF` | `#7C6AFF` | Softer purple |
| `colors.primaryDark` `#5A52D5` | `#5A52D5` | Unchanged |
| `colors.primaryLight` `#A5A0FF` | `#B4ABFF` | Lighter |
| `colors.secondary` `#FF6B9D` | `#FF6B9D` | Unchanged |
| `colors.text` `#1A1A2E` | `#2D2B55` | Warmer indigo |
| `colors.textSecondary` `#4A4A68` | `#6E6B8A` | Lighter, purple-tinted |
| `colors.textMuted` `#A8A8C8` | `#A8A5C0` | Slightly adjusted |
| `RADIUS.card` `20` | `22` | Rounder |
| `RADIUS.button` `14` | `50` | Full pill |
| `RADIUS.input` `14` | `50` | Full capsule |
| `RADIUS.badge` `24` | `50` | Full pill |
| `RADIUS.pill` `999` | `50` | Normalized (visual unchanged) |
| `RADIUS.avatar` `9999` | `50%` | Percentage-based circle |
| `TYPOGRAPHY.h1` `32px/700` | `24px/800` | Smaller, heavier (see Section 3.2) |
| `TYPOGRAPHY.h2` `24px/600` | `18px/700` | Smaller, bolder |
| `TYPOGRAPHY.h3` `18px/600` | `16px/700` | Slightly smaller, bolder |
| `TYPOGRAPHY.small` `12px/500` | `13px/600` | Slightly larger, bolder |
| `TYPOGRAPHY.micro` `10px/600` | `11px/600` | Slightly larger |
| `SHADOWS.*` black | Purple-tinted | Branded `rgba(124,106,255,0.12)` |
| `BLUR.*` | **Removed** | No blur in V2 — solid surfaces only |
| `SECTION_TINTS.*` | **Removed** | Replaced by organic blob colors |

### 13.3 Per-Screen Migration Checklist

For each screen, apply changes in this order:

1. Replace `backgroundColor` with `#F8F5FF`, add `<BackgroundBlobs />`
2. Replace `GlassCard`/`SolidCard` → `BubbleCard`
3. Replace `Button`/`GradientButton` → `BubbleButton`
4. Replace `Input`/`GlassInput` → `BubbleInput`
5. Replace custom pills → `BubblePill`
6. Update all shadows to V2 purple-tinted tokens
7. Update all `borderRadius` values to V2 scale
8. Replace V1 color references with V2 palette
9. Verify RTL layout, accessibility targets, animations

### 13.4 Do NOT Modify

- Hooks (`useListings`, `useBookings`, `useMessages`, `useTrips`, `useRequests`, `useOffers`, etc.)
- API services (`*.service.ts`)
- Data mappers (`lib/mappers.ts`)
- Navigation/routing structure (Expo Router file layout)
- State management (Zustand stores)
- i18n locale files (`ar.json`, `en.json`)
- Backend API modules (NestJS)
- WebSocket chat functionality
- Form validation and submission logic
- React Query cache configuration
- Authentication flow (OAuth, JWT)
- Pull-to-refresh behavior
- Animation utility components (`CountUpText`, `StaggeredList`, `SuccessCelebration`)

---

## Quick Reference Card

```
COLORS
  primary   #7C6AFF    secondary #FF6B9D    mint #56D8B1
  amber     #FFBE5C    blue      #5CB8FF    bg   #F8F5FF
  text      #2D2B55    soft      #6E6B8A    muted #A8A5C0

SHAPES
  pill 50    card 22    hero 28    dot 50%

SHADOW
  all: rgba(124, 106, 255, 0.12)

SPACING
  screen-pad 20    section-gap 24    card-pad 18    row-gap 8-12

ANIMATION
  entrance 500ms stagger +70ms    press scale(0.96) spring
```

---

## Related Documents

| File | Purpose |
|------|---------|
| [V2_REDESIGN_PLAN.md](V2_REDESIGN_PLAN.md) | Screen-by-screen change checklist |
| `apps/mobile/app/home-v2-test.tsx` | Approved visual prototype |
| `apps/mobile/providers/ThemeProvider.tsx` | Theme tokens (to be updated) |
| `apps/mobile/components/common/` | Shared components directory |
