# LuggageShare — Mobile Web Implementation Workflow

> **Created**: 2026-03-11
> **Source Spec**: [MOBILE_WEB_DESIGN_PLAN.md](MOBILE_WEB_DESIGN_PLAN.md)
> **Base Branch**: `feature/v2-design-system`
> **Target Branch**: `develop` (via final PR from base branch)
> **Strategy**: 8 focused feature branches, 3 execution waves, all PRing back to `feature/v2-design-system`

---

## Branch Map

```
develop
  └── feature/v2-design-system          ← base for ALL mobile work
        │
        ├── Wave 1 (start simultaneously — all independent)
        │     ├── feature/mobile-shell            T1.1 T1.2 T1.4 T1.5
        │     ├── feature/mobile-header           T1.3
        │     └── feature/mobile-pwa              T3.1 T3.2 T3.3
        │
        ├── Wave 2 (start after mobile-shell merges — can run in parallel)
        │     ├── feature/mobile-skeletons         T2.1 T2.2
        │     ├── feature/mobile-bottomsheet       T2.3 T2.4
        │     ├── feature/mobile-interactions      T2.5 T2.6 T2.7 T2.9
        │     └── feature/mobile-chat-keyboard     T2.8
        │
        └── Wave 3 (after all Wave 2 merged)
              └── feature/mobile-polish            T4.1 T4.2 T4.3 T4.4 T4.5 T4.6 T4.7
                  (branch already exists locally + remote)
```

---

## Wave 1 — Foundation (Start Immediately, No Prerequisites)

### Branch: `feature/mobile-shell`

**Purpose**: The structural foundation — bottom tab bar + safe area + footer hide

```bash
git checkout feature/v2-design-system
git pull
git checkout -b feature/mobile-shell
```

**Tasks**:
| Task | File | Action |
|------|------|--------|
| T1.1 | `apps/web/src/components/layout/BottomTabBar.tsx` | CREATE |
| T1.2 | `apps/web/src/app/layout.tsx` | MODIFY — add `<BottomTabBar />` after `<Providers>` |
| T1.4 | `apps/web/src/components/layout/Footer.tsx` | MODIFY — `hidden md:block` |
| T1.5 | `apps/web/src/app/globals.css` | MODIFY — safe area CSS + `--header-height: 64px` |

**Checklist before PR**:
- [ ] BottomTabBar has `type="button"` on all 4 tab buttons (Mistake #7)
- [ ] BottomTabBar hidden on `/auth/*` via `usePathname()` check
- [ ] BottomTabBar has `z-50`
- [ ] `layout.tsx` edit preserves conditional `GoogleOAuthProvider` in `Providers.tsx` (Mistakes #2/#3)
- [ ] Footer still renders on desktop (`hidden md:block` not `hidden`)
- [ ] globals.css `main` padding is inside `@media (max-width: 767px)` (no desktop impact)
- [ ] `--header-height: 64px` (not 52px)
- [ ] No hamburger menu removed yet (that's `mobile-header` branch)

**Files changed**: 4 (1 new, 3 modified)

---

### Branch: `feature/mobile-header`

**Purpose**: Redesign the mobile header to be compact + page-title-aware

```bash
git checkout feature/v2-design-system
git checkout -b feature/mobile-header
```

> ⚠️ **This branch is INDEPENDENT of `mobile-shell`** — work in parallel. No merge dependency.

**Tasks**:
| Task | File | Action |
|------|------|--------|
| T1.3 | `apps/web/src/components/layout/Header.tsx` | MODIFY |

**What changes in Header.tsx**:
- Mobile: hide hamburger (`md:hidden` on hamburger button)
- Mobile: show compact title bar using `usePathname()` with route → title map
- Mobile: avatar tap → navigate to `/profile` directly (no dropdown on mobile)
- Desktop: ZERO changes to `hidden md:flex` nav, dropdown, bell, avatar dropdown

**Checklist before PR**:
- [ ] `toggleLang` handler preserved — still toggles `lang`/`dir` on `<html>`, persists to `localStorage` (Mistake #5)
- [ ] Language toggle button still visible on mobile
- [ ] Desktop nav (`hidden md:flex`) unchanged
- [ ] Desktop dropdown (`hidden md:block`) unchanged
- [ ] Page titles map complete (includes `/reservations` route)
- [ ] Back chevron shows on non-root pages on mobile

**Files changed**: 1

---

### Branch: `feature/mobile-pwa`

**Purpose**: Make the app installable (PWA) — completely independent of all other branches

```bash
git checkout feature/v2-design-system
git checkout -b feature/mobile-pwa
```

**Tasks**:
| Task | File | Action |
|------|------|--------|
| T3.1 | `apps/web/public/manifest.json` | CREATE |
| T3.2 | `apps/web/public/icons/icon-192.png` | CREATE (placeholder or real icon) |
| T3.2 | `apps/web/public/icons/icon-512.png` | CREATE |
| T3.2 | `apps/web/public/icons/apple-touch-icon.png` | CREATE (180×180) |
| T3.3 | `apps/web/src/app/layout.tsx` | MODIFY — add `viewport` export + `manifest` to metadata |

**Checklist before PR**:
- [ ] `export const viewport: Viewport` added (NOT raw `<meta>` tags)
- [ ] `manifest` added to existing `metadata` export — does NOT replace existing fields
- [ ] `appleWebApp` config in metadata
- [ ] `layout.tsx` conditional `GoogleOAuthProvider` preserved (Mistakes #2/#3)
- [ ] manifest.json has correct colors (`#F8F5FF` background, `#7C6AFF` theme)
- [ ] Icons exist at specified paths (at minimum placeholder PNGs)

**Files changed**: 5 (4 new, 1 modified)

---

## Wave 2 — Interactions (Start After `mobile-shell` Merges)

> Branch all of these from `feature/v2-design-system` AFTER `feature/mobile-shell` is merged into it.
> These 4 branches can run **fully in parallel** — no dependencies between them.

```bash
# After mobile-shell PR is merged:
git checkout feature/v2-design-system && git pull
git checkout -b feature/mobile-skeletons       # from updated base
git checkout feature/v2-design-system && git pull
git checkout -b feature/mobile-bottomsheet     # from updated base
# ... etc
```

---

### Branch: `feature/mobile-skeletons`

**Purpose**: Replace all spinner loading states with shimmer skeleton cards

**Tasks**:
| Task | File | Action |
|------|------|--------|
| T2.1 | `apps/web/src/components/common/Skeleton.tsx` | CREATE |
| T2.2 | `apps/web/src/app/page.tsx` | MODIFY — replace home spinner with `TripCardSkeleton` |
| T2.2 | `apps/web/src/app/trips/page.tsx` | MODIFY — replace trips spinner |
| T2.2 | `apps/web/src/app/messages/page.tsx` | MODIFY — replace messages spinner |

**`Skeleton.tsx` exports**:
```
TripCardSkeleton         → rounded-[22px], matches TripCard height
ConversationCardSkeleton → rounded-[22px], matches ConversationCard height
BookingCardSkeleton      → rounded-[22px]
ProfileSkeleton          → avatar circle + text lines
SkeletonLine             → generic text line (rounded-full)
```

**Checklist before PR**:
- [ ] Skeleton shimmer uses design system colors (CSS variables), not hardcoded hex
- [ ] All skeleton border-radii match their component (`rounded-[22px]` for cards)
- [ ] Skeletons improve both mobile AND desktop loading (intentional)
- [ ] No spinner `<div>` or loading text left in pages that have skeletons

**Files changed**: 4 (1 new, 3 modified)

---

### Branch: `feature/mobile-bottomsheet`

**Purpose**: New BottomSheet component + use it for the home filter panel

**Tasks**:
| Task | File | Action |
|------|------|--------|
| T2.3 | `apps/web/src/components/common/BottomSheet.tsx` | CREATE |
| T2.4 | `apps/web/src/app/page.tsx` | MODIFY — filter uses BottomSheet on mobile |

**`BottomSheet.tsx` spec**:
- Mobile: slides up from bottom with spring animation
- Desktop: renders as standard centered modal (no visual change on desktop)
- Detection: `useMediaQuery('(max-width: 767px)')` hook
- Dismiss: swipe down, overlay tap, ESC key

**Checklist before PR**:
- [ ] All `<button>` elements in BottomSheet have `type="button"` (Mistake #7)
- [ ] Desktop still shows centered modal (not a BottomSheet)
- [ ] Drag-to-dismiss works on mobile
- [ ] Filter state preserved when opening/closing sheet
- [ ] Overlay blocks interaction with content behind

**Files changed**: 2 (1 new, 1 modified)

---

### Branch: `feature/mobile-interactions`

**Purpose**: Press states, carousel, FAB, empty states

**Tasks**:
| Task | File | Action |
|------|------|--------|
| T2.5 | Multiple files | MODIFY — add `active:scale-[0.97]` press states |
| T2.6 | `apps/web/src/components/home/PopularRoutes.tsx` | MODIFY — responsive carousel |
| T2.7 | `apps/web/src/app/trips/page.tsx` | MODIFY — add FAB |
| T2.9 | `apps/web/src/components/common/EmptyState.tsx` | CREATE |
| T2.9 | trips/messages/home pages | MODIFY — replace text-only empty states |

**Files for T2.5 press states** (add `active:scale-[0.97] transition-all duration-100`):
- `apps/web/src/components/home/TripCard.tsx`
- `apps/web/src/components/messages/ConversationCard.tsx`
- Any `<button>` or `<Link>` that acts as a card/row

**T2.6 carousel must be responsive**:
```tsx
// Mobile: horizontal scroll | Desktop: wrapping flex (unchanged)
className="flex gap-3 overflow-x-auto md:overflow-x-visible md:flex-wrap
           pb-2 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0 scrollbar-none"
```

**Checklist before PR**:
- [ ] FAB has `type="button"` (Mistake #7)
- [ ] FAB uses `end-4` not `right-4` (RTL-safe)
- [ ] FAB hidden on desktop (`md:hidden`)
- [ ] PopularRoutes desktop layout unchanged (still wraps to multiple lines)
- [ ] Press states don't break hover states on desktop
- [ ] EmptyState component is bilingual (ar/en)

**Files changed**: ~7 (1 new, ~6 modified)

---

### Branch: `feature/mobile-chat-keyboard`

**Purpose**: Fix chat input being buried under virtual keyboard on mobile

```bash
git checkout feature/v2-design-system && git pull
git checkout -b feature/mobile-chat-keyboard
```

**Tasks**:
| Task | File | Action |
|------|------|--------|
| T2.8 | `apps/web/src/app/chat/[bookingId]/page.tsx` | MODIFY — keyboard avoidance layout only |

**Checklist before PR**:
- [ ] ⛔ **ZERO changes to `sendMessage` logic** — WebSocket gateway persists messages; adding REST = duplicates (Mistake #1)
- [ ] Only `paddingBottom: keyboardHeight` added to the chat scroll container
- [ ] `keyboardHeight` state initialized to `0` (no layout shift on desktop)
- [ ] `visualViewport` listener properly cleaned up in `useEffect` return
- [ ] Chat still works on desktop (keyboardH = 0, no effect)
- [ ] Chat still works when keyboard is dismissed (height resets to 0)

**Files changed**: 1

---

## Wave 3 — Polish (After All Wave 2 Branches Merged)

### Branch: `feature/mobile-polish`

> **This branch already exists** (`feature/mobile-polish` local + remote).
> Rebase it onto the updated `feature/v2-design-system` before starting.

```bash
git checkout feature/mobile-polish
git rebase feature/v2-design-system
# Resolve any conflicts, then continue
```

**Tasks**:
| Task | File | Action |
|------|------|--------|
| T4.1 | `apps/web/src/app/globals.css` | `-webkit-tap-highlight-color: transparent` |
| T4.2 | `apps/web/src/app/globals.css` | `overscroll-behavior-y: contain` |
| T4.3 | `apps/web/src/components/layout/BottomTabBar.tsx` | Notification badge (unread count) |
| T4.4 | `apps/web/src/app/template.tsx` | CREATE — page transitions (mobile only) |
| T4.5 | `apps/web/src/app/globals.css` | Mobile typography tightening |
| T4.6 | `apps/web/src/app/trips/page.tsx` | Sticky section headers |
| T4.6 | `apps/web/src/app/messages/page.tsx` | Sticky section headers |
| T4.7 | `apps/web/src/app/globals.css` | `@media (hover: none)` hover disable |

**Checklist before PR**:
- [ ] Page transition animation wrapped in `@media (max-width: 767px)` (no desktop slide effect)
- [ ] Sticky headers use `top-[var(--header-height,64px)]` CSS variable (not hardcoded)
- [ ] `overscroll-behavior-y: contain` is on `body` (not `html`)
- [ ] Badge dot positioned using `-top-1 -end-1` (RTL-safe, not `-right-1`)

**Files changed**: ~4 (1 new, ~3 modified)

---

## Execution Timeline

```
Day 1 ──────────────────────────────────────────────────────────────────
  START simultaneously:
  ┌─ feature/mobile-shell      (estimated: 2-3h)
  ├─ feature/mobile-header     (estimated: 2-3h)
  └─ feature/mobile-pwa        (estimated: 1h)

Day 1-2 ─────────────────────────────────────────────────────────────────
  mobile-shell PR reviewed + merged ──► update base
  START simultaneously:
  ┌─ feature/mobile-skeletons        (estimated: 2h)
  ├─ feature/mobile-bottomsheet      (estimated: 2-3h)
  ├─ feature/mobile-interactions     (estimated: 3h)
  └─ feature/mobile-chat-keyboard    (estimated: 1h)

Day 2-3 ─────────────────────────────────────────────────────────────────
  All Wave 2 PRs reviewed + merged ──► update base
  START:
  └─ feature/mobile-polish           (estimated: 2h)

Day 3 ───────────────────────────────────────────────────────────────────
  mobile-polish merged
  feature/v2-design-system ──► PR to develop
```

---

## Git Commands — Full Setup

```bash
# === WAVE 1: START SIMULTANEOUSLY ===

# Branch 1: Shell
git checkout feature/v2-design-system && git pull origin feature/v2-design-system
git checkout -b feature/mobile-shell

# Branch 2: Header (in a separate terminal)
git checkout feature/v2-design-system
git checkout -b feature/mobile-header

# Branch 3: PWA (in a separate terminal)
git checkout feature/v2-design-system
git checkout -b feature/mobile-pwa

# === WAVE 2: AFTER mobile-shell IS MERGED ===

git checkout feature/v2-design-system && git pull origin feature/v2-design-system

git checkout -b feature/mobile-skeletons
# work → push → PR

git checkout feature/v2-design-system
git checkout -b feature/mobile-bottomsheet
# work → push → PR

git checkout feature/v2-design-system
git checkout -b feature/mobile-interactions
# work → push → PR

git checkout feature/v2-design-system
git checkout -b feature/mobile-chat-keyboard
# work → push → PR

# === WAVE 3: AFTER ALL WAVE 2 MERGED ===

git checkout feature/mobile-polish
git rebase feature/v2-design-system
# resolve conflicts → push --force-with-lease → PR

# === FINAL: MERGE TO DEVELOP ===
# Create PR: feature/v2-design-system → develop
```

---

## PR Template

Use this description for each PR:

```markdown
## Mobile Web — [Branch Purpose]

### Changes
- [ brief list of what was added/changed ]

### Desktop Impact
None — all changes are either:
- `md:hidden` (invisible on desktop)
- `@media (max-width: 767px)` (CSS only applies on mobile)
- New components that improve both (skeletons, empty states)

### Checklist
- [ ] No `type="button"` missing on new buttons
- [ ] Language toggle preserved in Header (if Header.tsx touched)
- [ ] Conditional GoogleOAuthProvider preserved (if layout.tsx touched)
- [ ] No REST send added to chat (if chat page touched)
- [ ] Tested on mobile viewport (375px)
- [ ] Desktop layout visually unchanged
```

---

## Branch Summary

| Branch | Wave | Tasks | Risk | Est. |
|--------|------|-------|------|------|
| `feature/mobile-shell` | 1 | T1.1 T1.2 T1.4 T1.5 | Medium | 2-3h |
| `feature/mobile-header` | 1 | T1.3 | High | 2-3h |
| `feature/mobile-pwa` | 1 | T3.1 T3.2 T3.3 | Low | 1h |
| `feature/mobile-skeletons` | 2 | T2.1 T2.2 | Low | 2h |
| `feature/mobile-bottomsheet` | 2 | T2.3 T2.4 | Low-Med | 2-3h |
| `feature/mobile-interactions` | 2 | T2.5 T2.6 T2.7 T2.9 | Low | 3h |
| `feature/mobile-chat-keyboard` | 2 | T2.8 | **High*** | 1h |
| `feature/mobile-polish` | 3 | T4.1–T4.7 | Low | 2h |

> *`mobile-chat-keyboard` is marked High risk not because of complexity but because of the Mistake #1 guard (no-dual-send). The change itself is ~15 lines.

**Total**: ~16-18h across 3 waves
