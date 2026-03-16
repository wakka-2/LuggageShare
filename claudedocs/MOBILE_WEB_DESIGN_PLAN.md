# LuggageShare Web — Mobile Design Plan

> **Created**: 2026-03-11
> **Updated**: 2026-03-11 (post-analysis corrections)
> **Branch**: `feature/v2-design-system`
> **Goal**: Transform the web app from a responsive website into a native-app-quality mobile experience
> **Philosophy**: On mobile, the web app should be indistinguishable from a native app

---

## ⚠️ Pre-Implementation Safety Rules

Before touching any file, read [MISTAKES.md](../memory/MISTAKES.md). Relevant guards for this plan:

| Rule | Files at risk |
|------|--------------|
| **Every `<button>` in a new component MUST have `type="button"`** (Mistake #7) | BottomTabBar, BottomSheet, FAB |
| **`layout.tsx` edits must preserve the conditional `GoogleOAuthProvider`** in `Providers.tsx` (Mistakes #2/#3) | layout.tsx, Providers.tsx |
| **`Header.tsx` redesign must preserve the `toggleLang` handler** and `localStorage` persistence (Mistake #5) | Header.tsx |
| **`chat/[bookingId]/page.tsx` edits must NOT touch message-send logic** — gateway already persists, adding REST = duplicates (Mistake #1) | chat/[bookingId]/page.tsx |

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Design Philosophy](#2-design-philosophy)
3. [Priority Tiers](#3-priority-tiers)
4. [Tier 1 — Shell & Navigation](#4-tier-1--shell--navigation)
5. [Tier 2 — Interaction Patterns](#5-tier-2--interaction-patterns)
6. [Tier 3 — Progressive Web App](#6-tier-3--progressive-web-app)
7. [Tier 4 — Polish & Micro-details](#7-tier-4--polish--micro-details)
8. [Implementation Checklist](#8-implementation-checklist)
9. [File Reference Map](#9-file-reference-map)

---

## 1. Current State Assessment

### What's Working
- ✅ Responsive grid layouts (1/2/3 column breakpoints)
- ✅ Touch-friendly tap targets (~44px minimum)
- ✅ Consistent padding/spacing on mobile
- ✅ Filter bar collapses gracefully
- ✅ RTL/LTR support throughout
- ✅ V2 design tokens (lavender palette, pill shapes, bubble shadows)

### What Makes It Feel Like a Web Page
- ❌ Hamburger menu → no native apps use this pattern
- ❌ Footer visible on mobile → zero native apps have footers
- ❌ No page transitions → pages hard-cut like web navigation
- ❌ Hover states fire on touch → looks broken on mobile
- ❌ No skeleton screens → spinner-only loading feels old
- ❌ Standard modal dialogs → native apps use bottom sheets
- ❌ No safe area handling → content bleeds under iOS home indicator
- ❌ Not installable → no PWA manifest

---

## 2. Design Philosophy

### Mobile-First Rule
> Every layout decision must be designed for a 390px-wide screen first. Desktop is an enhancement.

### Native App Rules
| Rule | Web Pattern (avoid) | Native Pattern (use) |
|------|--------------------|--------------------|
| Navigation | Hamburger sidebar | Bottom tab bar |
| Secondary nav | Breadcrumbs / links | Page title + back chevron |
| Overflow content | Footer links | Bottom tab "More" or Settings |
| Data loading | Spinner | Skeleton screen |
| Dialogs | Centered modal | Bottom sheet |
| Primary action | Nav link | Floating Action Button (FAB) |
| Empty states | Text message | Illustrated empty state |
| Scroll feel | Browser default | Overscroll bounce + momentum |

### Breakpoints
```
Mobile:  < 768px   ← Design target
Tablet:  768–1023px
Desktop: ≥ 1024px
```

---

## 3. Priority Tiers

| Tier | Theme | Effort | Impact | Do First? |
|------|-------|--------|--------|-----------|
| **Tier 1** | Shell & Navigation | Medium | ⭐⭐⭐⭐⭐ | Yes |
| **Tier 2** | Interaction Patterns | Medium | ⭐⭐⭐⭐ | Yes |
| **Tier 3** | PWA | Low | ⭐⭐⭐⭐ | Yes |
| **Tier 4** | Polish & Micro-details | Low–High | ⭐⭐⭐ | After T1–T3 |

---

## 4. Tier 1 — Shell & Navigation

### 4.1 Bottom Tab Bar

**The single most impactful change.**

**Tab Decision — 4 tabs or 5?**

The current Header nav has 5 sections: Home, Trips, Reservations, Messages, Profile. Options:

| Option | Tabs | Trade-off |
|--------|------|-----------|
| **Option A (recommended)** | Home / Trips+Reservations / Messages / Profile | Trips tab = "My Activity" (both tabs/reservations in one page with sub-tabs) |
| Option B | Home / Trips / Reservations / Messages / Profile | 5 tabs — crowded on small screens |

**Recommended: Option A — 4 tabs**

| Tab | Icon | Route | Notes |
|-----|------|-------|-------|
| Home | `House` | `/` | |
| My Activity | `Plane` | `/trips` | Page shows Trips + Reservations as sub-sections |
| Messages | `MessageCircle` | `/messages` | Unread badge |
| Profile | `User` | `/profile` | Auth-gated |

**Spec**:
- Height: `64px` + `env(safe-area-inset-bottom)`
- Background: `rgba(255,255,255,0.92)` with `backdrop-blur-md`
- Border top: `1px solid rgba(124,106,255,0.08)`
- **z-index: `z-50`** (same level as header)
- Active tab: filled icon + `text-primary` (`#7C6AFF`) + `font-semibold`
- Inactive tab: outline icon + `text-muted` (`#A8A5C0`)
- Active indicator: small filled dot below icon label (4px circle, primary color)
- Badge: small red circle with count on Messages tab
- Tap animation: `active:scale-95` + `transition-transform duration-100`
- **Only visible on mobile** (`md:hidden`)
- **Auth-aware**: hide entirely on `/auth/login` and `/auth/register` paths
- **Active detection**: use `usePathname()` from `next/navigation`

**⚠️ All tab `<button>` elements MUST have `type="button"` — HTML buttons default to `type="submit"` (Mistake #7)**

**Safe Area — add to `globals.css`**:
```css
/* ✅ MOBILE ONLY — no desktop impact */
.bottom-tab-bar {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* ✅ MUST be inside mobile media query — root layout.tsx has NO <main> element,
   so this targets all per-page <main> elements. Without this query it adds 64px
   bottom padding to EVERY desktop page. */
@media (max-width: 767px) {
  main {
    padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  }
}
```

> **⚠️ Architecture note**: `layout.tsx` only wraps with `<Providers>` — it has NO `<main>`, `<Header>`, or `<Footer>`. Each page independently calls these. Do NOT add `<main>` padding to `layout.tsx` — use the globals.css media query above.

**File**: Create `apps/web/src/components/layout/BottomTabBar.tsx`
**Modify**: `apps/web/src/app/layout.tsx` — add `<BottomTabBar />` inside `<body>` (after `<Providers>`)

---

### 4.2 Mobile Header Redesign

**Current**: Tall nav bar with logo + desktop links + hamburger
**Target**: Compact app bar, 52px, page-title-aware

**Structure**:
```
[← Back?]  [Page Title]  [Bell] [Avatar]
```

**Rules**:
- Logo only on Home tab (no back button needed)
- Other pages: show page title (`My Trips`, `Messages`, `Profile`) + optional back chevron
- Remove hamburger menu entirely on mobile
- Keep desktop nav as-is (only hides on `md:hidden`)
- Notifications bell: visible on mobile, shows unread badge dot
- Avatar: tapping opens profile directly (not dropdown) on mobile

**Active tab detection**: use `usePathname()` from `next/navigation`.

**Page titles per route**:
```
/                  → Show logo (no title text)
/trips             → "My Activity"
/reservations      → "Reservations"
/messages          → "Messages"
/profile           → "Profile"
/booking/[id]      → "Booking Details"
/chat/[bookingId]  → Recipient name (from booking data)
/wallet            → "Wallet"
/notifications     → "Notifications"
/listing/[id]      → "Trip Details"
/listing/create    → "New Trip"
/auth/login        → (no header/tab bar — standalone auth page)
/auth/register     → (no header/tab bar — standalone auth page)
```

**⚠️ Preserve `toggleLang` handler and `localStorage` persistence when redesigning** — this was broken and fixed (Mistake #5)

**File**: `apps/web/src/components/layout/Header.tsx`

---

### 4.3 Hide Footer on Mobile

One-line fix. The footer is a web concept — native apps don't have it.

```tsx
// apps/web/src/components/layout/Footer.tsx
<footer className="hidden md:block ...">
```

---

### 4.4 Main Content Padding

With bottom tab bar added, main content needs bottom padding so last items don't get hidden behind the tab bar.

> **⚠️ Do NOT add this to `layout.tsx`** — it has no `<main>`. Handled by the `@media (max-width: 767px)` CSS rule in §4.1. Desktop `<main>` elements receive zero additional padding from this rule.

---

## 5. Tier 2 — Interaction Patterns

### 5.1 Skeleton Loading Screens

Replace all spinner loading states with skeleton placeholder cards.

**Pattern**: Animated shimmer effect (gradient sweep left-to-right).

**Shimmer CSS** (add to `globals.css`):
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  /* Use design system tokens: blob1=#EDE7FF, bg=#F8F5FF */
  background: linear-gradient(90deg, var(--color-blob1, #EDE7FF) 25%, var(--color-bg, #F8F5FF) 50%, var(--color-blob1, #EDE7FF) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
```

**Border radius must match the component being loaded** (V2 design system — cards = `22px`):
- `TripCardSkeleton` → `rounded-[22px]`
- `ConversationCardSkeleton` → `rounded-[22px]`
- `BookingCardSkeleton` → `rounded-[22px]`
- Skeleton text lines → `rounded-full`
- Avatar skeleton circle → `rounded-full`

**Components needed**:
- `TripCardSkeleton` — matches TripCard dimensions
- `ConversationCardSkeleton` — matches ConversationCard
- `BookingCardSkeleton` — matches booking list items
- `ProfileSkeleton` — avatar circle + text lines

**File**: Create `apps/web/src/components/common/Skeleton.tsx`

---

### 5.2 Bottom Sheet

Replace centered modal dialogs with bottom sheets that slide up from the bottom edge.

**Use cases**:
- Filter/sort options on home page
- Confirmation dialogs (cancel booking, etc.)
- Action menus (trip card: Edit / Delete / Share)
- Create listing shortcut from FAB

**Spec**:
- Slides up with spring animation (`cubic-bezier(0.34, 1.56, 0.64, 1)`)
- Drag handle: `w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3`
- Can be dismissed by: swipe down, tap overlay, ESC key
- Max height: `80vh`
- Background: white, `rounded-t-[28px]`
- Overlay: `rgba(0,0,0,0.4)` with fade-in

**On desktop**: renders as standard centered modal (no change needed)

**⚠️ All `<button>` elements inside BottomSheet MUST have `type="button"` (Mistake #7)**

**File**: Create `apps/web/src/components/common/BottomSheet.tsx`
**Modify**: `apps/web/src/components/common/Modal.tsx` — detect mobile via `useMediaQuery('(max-width: 767px)')`, use BottomSheet on mobile, centered modal on desktop

---

### 5.3 Press/Active States

Remove hover-only states. Add press states that work on touch.

**Replace this pattern**:
```tsx
// Before
className="hover:bg-primary/10 hover:shadow-bubble-md"

// After — works on touch AND desktop
className="hover:bg-primary/10 active:bg-primary/20 active:scale-[0.97] transition-all duration-100"
```

Apply to: all `<button>`, `<Link>`, card components, list items.

**Remove on mobile**: `hover:` classes on touch-only elements (use CSS `@media (hover: none)` media query).

---

### 5.4 Horizontal Scroll Carousels on Mobile

Replace vertical stacked lists with horizontal swipeable rows on mobile.

**Apply to**:
- Popular Routes chips (home page) → horizontal pill scroll on mobile, wrapping flex on desktop
- Filter category chips → horizontal scroll row on mobile

**CSS pattern — must be responsive** (current desktop uses `flex flex-wrap`, must preserve that):
```tsx
{/* Mobile: horizontal scroll strip | Desktop: wrapping flex (unchanged) */}
<div className="
  flex gap-3
  overflow-x-auto md:overflow-x-visible
  md:flex-wrap
  pb-2 md:pb-0
  -mx-4 md:mx-0
  px-4 md:px-0
  scrollbar-none
  snap-x md:snap-none snap-mandatory
">
  {items.map(item => (
    <div className="flex-shrink-0 md:flex-shrink snap-start md:snap-align-none" key={item.id}>
      {/* card */}
    </div>
  ))}
</div>
```

**File**: `apps/web/src/components/home/PopularRoutes.tsx` (component file, not page.tsx)

---

### 5.5 Floating Action Button (FAB)

Primary action shortcut floating above the tab bar on relevant tabs.

| Tab | FAB action |
|-----|-----------|
| Home | None (search is primary) |
| Trips | `+` → Create Trip |
| Messages | None |
| Profile | None |

**Spec**:
- Size: `56px` circle
- Color: primary gradient (`#7C6AFF → #9D8FFF`)
- Shadow: `shadow-bubble-lg`
- Position: `fixed bottom-[88px] end-4` (above tab bar — **use `end-4` not `right-4` for RTL support**)
- Only on mobile (`md:hidden`)
- Press animation: `active:scale-90`
- **Must have `type="button"` explicitly** (Mistake #7)

**File**: Rendered inside `/trips` page layout or globally when on `/trips`

---

### 5.6 Chat Input Keyboard Avoidance

When the virtual keyboard opens on the chat page, the message input bar must stay above it.

**⚠️ DO NOT touch message-send logic in this file** — WebSocket gateway already persists messages. Adding any REST call = duplicate messages (Mistake #1). Only modify the layout/scroll behavior.

**Implementation** (Next.js / React):
```tsx
// In chat page — keyboard avoidance ONLY, do not touch sendMessage logic
useEffect(() => {
  const vp = window.visualViewport;
  if (!vp) return;
  const handleResize = () => {
    const keyboardH = Math.max(0, window.innerHeight - vp.height);
    setKeyboardHeight(keyboardH);
  };
  vp.addEventListener('resize', handleResize);
  return () => vp.removeEventListener('resize', handleResize);
}, []);
```

Apply `paddingBottom: keyboardHeight` to the chat container only.

**File**: `apps/web/src/app/chat/[bookingId]/page.tsx`

---

### 5.7 Illustrated Empty States

Replace plain text "No results" with illustrated empty states.

**Spec**:
- SVG illustration (suitcase + plane, or luggage + sparkles)
- Bold headline: short and friendly
- Subtext: helpful context
- Optional CTA button

**Examples**:
```
No trips yet
Start earning by sharing your luggage space
[+ Add Your First Trip]

No messages yet
Your conversations will appear here

No bookings yet
Find a traveler and send your first request
[Browse Trips]
```

**File**: Create `apps/web/src/components/common/EmptyState.tsx`

---

## 6. Tier 3 — Progressive Web App

### 6.1 PWA Manifest

Makes the app installable on iOS/Android from the browser.

**File**: Create `apps/web/public/manifest.json`
```json
{
  "name": "LuggageShare",
  "short_name": "LuggageShare",
  "description": "Send your luggage with travelers",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#F8F5FF",
  "theme_color": "#7C6AFF",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Add to layout** — Next.js 14 App Router uses `metadata` + `viewport` exports (not raw `<meta>` tags):
```tsx
// apps/web/src/app/layout.tsx
import type { Metadata, Viewport } from 'next';

// ⚠️ ADD to existing metadata export, do NOT replace — preserve existing title/description/openGraph
export const metadata: Metadata = {
  // ...existing fields...
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LuggageShare',
  },
};

// ADD this new export alongside metadata
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',          // enables safe-area-inset-* for notch/dynamic island
  themeColor: '#7C6AFF',
};
```

**Effect**: Browser hides address bar. App looks 100% native when launched from home screen.

**⚠️ Preserve the conditional `GoogleOAuthProvider` in `Providers.tsx`** when editing `layout.tsx` (Mistakes #2/#3)

---

### 6.2 Viewport & Status Bar Meta

**Handled by `export const viewport` in §6.1 above** — Next.js 14 generates the correct `<meta>` tags automatically from the `viewport` export. Do NOT add raw `<meta>` tags manually as they will conflict.

The `viewportFit: 'cover'` in the `viewport` export generates `viewport-fit=cover` for iPhone notch/dynamic island safe areas.

---

### 6.3 Splash Screen

**iOS**: Add apple-touch icons + startup image references in `<head>`:
```html
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
```

---

## 7. Tier 4 — Polish & Micro-details

### 7.1 Remove Web-Only Visual Artifacts

```css
/* globals.css — mobile overrides */
@media (hover: none) {
  /* Disable hover states on touch devices */
  .hover\:shadow-bubble-md:hover { box-shadow: none; }
  .hover\:bg-primary\/10:hover { background-color: transparent; }
}

/* Remove text underlines on touch links */
a { text-decoration: none; }

/* Remove tap highlight on mobile */
* { -webkit-tap-highlight-color: transparent; }
```

---

### 7.2 Momentum Scrolling

```css
/* globals.css */
/* Note: -webkit-overflow-scrolling is deprecated and removed from modern iOS — omit it */
body {
  overscroll-behavior-y: contain;
}
```

---

### 7.3 Notification Badge Dot

Add unread indicator to the Messages/Notifications icons in the header and bottom tab bar.

```tsx
// Notification dot component
<div className="relative">
  <MessageCircle size={22} />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</div>
```

---

### 7.4 Page Transitions

Slide pages in/out like native navigation.

**Implementation** (CSS + Next.js App Router):

```css
/* globals.css — MUST be inside mobile media query, slide transitions are a mobile
   navigation pattern; applying to desktop makes page changes feel like a broken slide show */
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

@media (max-width: 767px) {
  .page-enter { animation: slide-in-right 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards; }
}
/* Desktop: no page transition animation (instant render, standard web behavior) */
```

Apply via `template.tsx` wrappers in Next.js App Router.

---

### 7.5 Typography Tightening for Mobile

```css
@media (max-width: 768px) {
  /* Headings: slightly tighter line-height on mobile */
  h1 { line-height: 1.15; }
  h2 { line-height: 1.2; }

  /* Body text: slightly larger for readability */
  p, li { font-size: 15px; }
}
```

---

### 7.6 Sticky Section Headers in Lists

In trips and messages pages, date section headers (`Today`, `This Week`) should stick to the top as the user scrolls — like iOS grouped tables.

```tsx
{/* Use CSS variable for header height to avoid hardcoded 52px breaking if header changes */}
<div className="sticky top-[var(--header-height,52px)] z-10 bg-[#F8F5FF]/90 backdrop-blur-sm py-1 px-4">
  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Today</span>
</div>
```

Add to `globals.css`:
```css
:root {
  --header-height: 64px; /* h-16 = 64px — verified from Header.tsx line 70 */
}
```

---

## 8. Implementation Checklist

### Tier 1 — Shell (do first)
- [ ] **T1.1** Create `BottomTabBar.tsx` with 4 tabs — all `<button>` must have `type="button"`, use `usePathname()`, hide on `/auth/*`, add `z-50`
- [ ] **T1.2** Add BottomTabBar to `layout.tsx` — preserve conditional `GoogleOAuthProvider` in `Providers.tsx`
- [ ] **T1.3** Redesign `Header.tsx` — compact, page-title-aware (`usePathname()`), no hamburger on mobile, **preserve `toggleLang` handler**
- [ ] **T1.4** Hide `Footer.tsx` on mobile (`hidden md:block`)
- [ ] **T1.5** Add to `globals.css`: `.bottom-tab-bar` safe area + `@media (max-width: 767px) { main { padding-bottom: ... } }` + `:root { --header-height: 64px }`
- [ ] **T1.6** ~~Add bottom padding to `<main>` in `layout.tsx`~~ — handled by globals.css media query in T1.5 (layout.tsx has no `<main>`)

### Tier 2 — Interactions
- [ ] **T2.1** Create `Skeleton.tsx` + skeleton variants for TripCard, ConversationCard
- [ ] **T2.2** Replace spinners with skeletons in home, trips, messages pages
- [ ] **T2.3** Create `BottomSheet.tsx` component
- [ ] **T2.4** Use BottomSheet for filter panel on home page
- [ ] **T2.5** Add `active:scale-[0.97]` press states to all interactive elements
- [ ] **T2.6** Convert Popular Routes to responsive carousel: horizontal scroll on mobile, `md:flex-wrap` preserves desktop wrap — file is `PopularRoutes.tsx` not `page.tsx`
- [ ] **T2.7** Add FAB on `/trips` page — `type="button"`, use `end-4` (not `right-4`) for RTL
- [ ] **T2.8** Fix keyboard avoidance in chat page — **layout/scroll only, do NOT touch sendMessage logic** (Mistake #1)
- [ ] **T2.9** Create `EmptyState.tsx` and apply to all empty list states

### Tier 3 — PWA
- [ ] **T3.1** Create `public/manifest.json`
- [ ] **T3.2** Create app icons (192×192, 512×512) in `public/icons/`
- [ ] **T3.3** Add `manifest` to existing `metadata` export + add new `export const viewport: Viewport` in `layout.tsx` — do NOT use raw `<meta>` tags
- [ ] **T3.4** ~~Add `viewport-fit=cover` to viewport meta~~ — handled by `viewport` export in T3.3

### Tier 4 — Polish
- [ ] **T4.1** Add `-webkit-tap-highlight-color: transparent` to globals
- [ ] **T4.2** Add `overscroll-behavior-y: contain` to `globals.css` (no `-webkit-overflow-scrolling` — deprecated)
- [ ] **T4.3** Add notification badge dot to Messages tab and header bell
- [ ] **T4.4** Add page transition animations via `template.tsx` — wrap CSS in `@media (max-width: 767px)` so desktop pages don't slide
- [ ] **T4.5** Tighten mobile typography (line-height, font-size)
- [ ] **T4.6** Add sticky section headers to trips and messages lists
- [ ] **T4.7** Disable hover states on touch devices (`@media (hover: none)`)

---

## 9. File Reference Map

| File | Changes |
|------|---------|
| `apps/web/src/app/layout.tsx` | Add BottomTabBar, PWA metadata, safe area meta, bottom padding on main |
| `apps/web/src/app/globals.css` | Skeleton shimmer, safe area vars, tap highlight off, momentum scroll, page transitions |
| `apps/web/src/components/layout/Header.tsx` | Compact mobile header, page-title-aware, remove hamburger |
| `apps/web/src/components/layout/Footer.tsx` | `hidden md:block` |
| `apps/web/src/components/layout/BottomTabBar.tsx` | **NEW** — 4-tab bottom navigation |
| `apps/web/src/components/common/BottomSheet.tsx` | **NEW** — slide-up sheet component |
| `apps/web/src/components/common/Skeleton.tsx` | **NEW** — shimmer skeleton system |
| `apps/web/src/components/common/EmptyState.tsx` | **NEW** — illustrated empty states |
| `apps/web/src/app/page.tsx` | Apply skeletons, convert Popular Routes to horizontal scroll |
| `apps/web/src/app/trips/page.tsx` | Apply skeletons, add FAB, sticky section headers |
| `apps/web/src/app/messages/page.tsx` | Apply skeletons, sticky section headers |
| `apps/web/src/app/chat/[bookingId]/page.tsx` | Keyboard avoidance |
| `apps/web/public/manifest.json` | **NEW** — PWA manifest |
| `apps/web/public/icons/` | **NEW** — app icons |
| `tailwind.config.ts` | Add `scrollbar-none` utility if not present |
