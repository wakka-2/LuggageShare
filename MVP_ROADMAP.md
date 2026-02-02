# LuggageShare MVP Development Roadmap

> **Comprehensive implementation guide with branch strategy, CI/CD, and milestone tracking**

**Created:** February 2, 2026
**Current Status:** Phase 1 - 55% Complete
**Target MVP Launch:** TBD

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Branch Strategy](#branch-strategy)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [MVP Milestones](#mvp-milestones)
5. [Implementation Steps](#implementation-steps)
6. [Quality Gates](#quality-gates)
7. [Release Process](#release-process)

---

## Current State Assessment

### What's Complete (55-60%)

| Component | Status | Notes |
|-----------|--------|-------|
| Project Structure | ✅ 100% | Turborepo monorepo configured |
| Navigation | ✅ 95% | Expo Router with tabs and auth groups |
| UI Components | ✅ 90% | ListingCard, SearchBar, EmptyState, etc. |
| Marketplace Browse | ✅ 85% | Grid/list views, filtering, search |
| Theme System | ✅ 95% | Dark/light mode, RTL support |
| i18n (AR/EN) | ✅ 95% | Full Arabic and English translations |
| Auth Infrastructure | ⚠️ 40% | Context exists, OAuth not wired |

### What's Missing (Critical for MVP)

| Component | Priority | Blocking? |
|-----------|----------|-----------|
| Create Listing Screen | 🔴 P0 | Yes - No supply side |
| Listing Detail Screen | 🔴 P0 | Yes - Can't view full listing |
| Booking Flow | 🔴 P0 | Yes - Can't transact |
| Messages/Chat | 🔴 P0 | Yes - Can't communicate |
| Backend API | 🔴 P0 | Yes - Mock data only |
| Real OAuth | 🟡 P1 | Yes for production |
| Profile Screens | 🟡 P1 | Partial blocking |
| Payment UI | 🟡 P1 | Bank transfer flow |
| Notifications | 🟢 P2 | Nice to have |
| Reviews/Ratings | 🟢 P2 | Post-MVP acceptable |

---

## Branch Strategy

### Git Flow Model

```
main (production)
  │
  └── develop (integration)
        │
        ├── phase1-mvp (current milestone)
        │     │
        │     ├── feature/create-listing
        │     ├── feature/listing-detail
        │     ├── feature/booking-flow
        │     ├── feature/messaging
        │     └── feature/profile-screens
        │
        ├── phase2-growth (future)
        │     ├── feature/payments
        │     ├── feature/reviews
        │     └── feature/analytics
        │
        └── phase3-scale (future)
              ├── feature/multi-region
              └── feature/enterprise
```

### Branch Naming Convention

```
feature/[ticket-id]-short-description    # New features
bugfix/[ticket-id]-short-description     # Bug fixes
hotfix/[ticket-id]-short-description     # Production hotfixes
chore/short-description                  # Maintenance tasks
docs/short-description                   # Documentation updates
```

### Branch Rules

| Branch | Protection | Merge Strategy | Approvals |
|--------|------------|----------------|-----------|
| `main` | Protected | Squash merge | 2 required |
| `develop` | Protected | Merge commit | 1 required |
| `phase1-mvp` | Protected | Merge commit | 1 required |
| `feature/*` | None | Squash to phase | Self-merge OK |

### Workflow

```bash
# Starting new feature
git checkout phase1-mvp
git pull origin phase1-mvp
git checkout -b feature/create-listing

# Working on feature
git add .
git commit -m "feat: Add listing creation form"
git push origin feature/create-listing

# When feature complete
# Create PR: feature/create-listing → phase1-mvp
# After merge, delete feature branch

# When milestone complete
# Create PR: phase1-mvp → develop
# Create PR: develop → main (release)
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. PR Validation (`.github/workflows/pr-check.yml`)

```yaml
name: PR Validation

on:
  pull_request:
    branches: [main, develop, phase1-mvp, phase2-growth, phase3-scale]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build check
        run: npm run build

  mobile-preview:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Create preview build
        run: eas build --platform all --profile preview --non-interactive
```

#### 2. Deploy to Staging (`.github/workflows/staging.yml`)

```yaml
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy API to staging
        run: |
          # Deploy to Railway/Render/Fly.io
          echo "Deploying API to staging..."

  deploy-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build and submit to TestFlight/Internal Testing
        run: |
          eas build --platform all --profile staging --non-interactive
          eas submit --platform all --profile staging --non-interactive
```

#### 3. Production Release (`.github/workflows/release.yml`)

```yaml
name: Production Release

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build production
        run: eas build --platform all --profile production --non-interactive

      - name: Submit to stores
        run: eas submit --platform all --profile production --non-interactive

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          generate_release_notes: true
```

### EAS Build Profiles (`eas.json`)

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "staging": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "API_URL": "https://staging-api.luggageshare.com"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "API_URL": "https://api.luggageshare.com"
      }
    }
  },
  "submit": {
    "staging": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "YOUR_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "track": "internal"
      }
    },
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "YOUR_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "track": "production"
      }
    }
  }
}
```

### Environment Configuration

| Environment | Branch | API URL | Build Profile |
|-------------|--------|---------|---------------|
| Development | `feature/*` | localhost:3000 | development |
| Preview | PR branches | staging API | preview |
| Staging | `develop` | staging-api.luggageshare.com | staging |
| Production | `main` | api.luggageshare.com | production |

---

## MVP Milestones

### Milestone 1: Core Listing Flow (Week 1-2) ✅ COMPLETE
**Branch:** `feature/create-listing` → `phase1-mvp`

| Task | Priority | Status |
|------|----------|--------|
| Create listing screen route | P0 | ✅ |
| Listing type selector (offer/request) | P0 | ✅ |
| Route selection (from/to cities) | P0 | ✅ |
| Date picker component | P0 | ✅ |
| Weight/capacity input | P0 | ✅ |
| Pricing tier inputs | P0 | ✅ |
| Item restrictions selector | P0 | ✅ |
| Handoff options selector | P0 | ✅ |
| Form validation | P0 | ✅ |
| Submit flow (mock) | P0 | ✅ |
| Success/confirmation screen | P1 | ✅ |

**Deliverable:** Users can create carrier offers and sender requests

---

### Milestone 2: Listing Detail & Discovery (Week 2-3)
**Branch:** `feature/listing-detail` → `phase1-mvp`

| Task | Priority | Status |
|------|----------|--------|
| Listing detail screen route | P0 | ⬜ |
| Full listing information display | P0 | ⬜ |
| User profile card | P0 | ⬜ |
| Contact/book action buttons | P0 | ⬜ |
| Share listing functionality | P1 | ⬜ |
| Report listing option | P2 | ⬜ |
| Similar listings section | P2 | ⬜ |
| Navigation from listing card | P0 | ⬜ |

**Deliverable:** Users can view full listing details and initiate contact

---

### Milestone 3: Booking System (Week 3-4)
**Branch:** `feature/booking-flow` → `phase1-mvp`

| Task | Priority | Status |
|------|----------|--------|
| Booking request screen | P0 | ⬜ |
| Item details form | P0 | ⬜ |
| Handoff selection | P0 | ⬜ |
| Price confirmation | P0 | ⬜ |
| Booking submission | P0 | ⬜ |
| Booking confirmation screen | P0 | ⬜ |
| My bookings list (trips tab) | P0 | ⬜ |
| Booking detail screen | P0 | ⬜ |
| Booking status tracking | P1 | ⬜ |
| Cancel booking flow | P1 | ⬜ |

**Deliverable:** Complete booking lifecycle from request to completion

---

### Milestone 4: Messaging System (Week 4-5)
**Branch:** `feature/messaging` → `phase1-mvp`

| Task | Priority | Status |
|------|----------|--------|
| Chat list screen | P0 | ⬜ |
| Individual chat screen | P0 | ⬜ |
| Message input component | P0 | ⬜ |
| Message bubbles (sent/received) | P0 | ⬜ |
| Timestamps and read status | P1 | ⬜ |
| Image sharing | P2 | ⬜ |
| Chat from listing detail | P0 | ⬜ |
| Chat from booking | P0 | ⬜ |
| Unread message badges | P1 | ⬜ |

**Deliverable:** Real-time messaging between carriers and senders

---

### Milestone 5: User Profile & Settings (Week 5-6)
**Branch:** `feature/profile-screens` → `phase1-mvp`

| Task | Priority | Status |
|------|----------|--------|
| Edit profile screen | P0 | ⬜ |
| Profile photo upload | P1 | ⬜ |
| Settings screen | P1 | ⬜ |
| Language switcher | P1 | ⬜ |
| Notification preferences | P2 | ⬜ |
| Verification screen | P1 | ⬜ |
| ID document upload | P1 | ⬜ |
| Help/support screen | P2 | ⬜ |
| About screen | P2 | ⬜ |
| Logout flow | P0 | ⬜ |

**Deliverable:** Complete user profile management

---

### Milestone 6: Backend Integration (Week 6-7)
**Branch:** `feature/backend-integration` → `phase1-mvp`

| Task | Priority | Status |
|------|----------|--------|
| API client setup (axios) | P0 | ⬜ |
| Auth endpoints integration | P0 | ⬜ |
| Google OAuth configuration | P0 | ⬜ |
| Apple OAuth configuration | P0 | ⬜ |
| Listings API integration | P0 | ⬜ |
| Bookings API integration | P0 | ⬜ |
| Messages API integration | P0 | ⬜ |
| User API integration | P0 | ⬜ |
| Error handling | P0 | ⬜ |
| Offline support (basic) | P2 | ⬜ |

**Deliverable:** App connected to real backend with live data

---

### Milestone 7: Polish & Launch Prep (Week 7-8)
**Branch:** `phase1-mvp` → `develop` → `main`

| Task | Priority | Status |
|------|----------|--------|
| Error boundaries | P0 | ⬜ |
| Loading states | P0 | ⬜ |
| Empty states (all screens) | P0 | ⬜ |
| Performance optimization | P1 | ⬜ |
| Crash reporting (Sentry) | P1 | ⬜ |
| Analytics setup | P2 | ⬜ |
| App store assets | P0 | ⬜ |
| Privacy policy integration | P0 | ⬜ |
| Terms of service integration | P0 | ⬜ |
| Beta testing (50-100 users) | P0 | ⬜ |
| Bug fixes from beta | P0 | ⬜ |
| Store submission | P0 | ⬜ |

**Deliverable:** Production-ready app submitted to App Store and Play Store

---

## Implementation Steps

### Step 1: Create Listing Screen

```bash
# Create feature branch
git checkout phase1-mvp
git checkout -b feature/create-listing
```

**Files to create:**
```
apps/mobile/
├── app/
│   └── listing/
│       ├── _layout.tsx          # Listing stack navigator
│       └── create.tsx           # Create listing screen
├── components/
│   └── listing-form/
│       ├── index.ts             # Exports
│       ├── ListingTypeSelector.tsx
│       ├── RouteSelector.tsx
│       ├── DateSelector.tsx
│       ├── PricingInputs.tsx
│       ├── RestrictionsSelector.tsx
│       ├── HandoffSelector.tsx
│       └── FormSummary.tsx
└── hooks/
    └── useCreateListing.ts      # Form state and submission
```

**Implementation order:**
1. Create route structure (`app/listing/_layout.tsx`, `app/listing/create.tsx`)
2. Build `ListingTypeSelector` (offer vs request toggle)
3. Build `RouteSelector` (city picker with search)
4. Build `DateSelector` (calendar picker)
5. Build `PricingInputs` (tiered pricing with negotiable toggle)
6. Build `RestrictionsSelector` (checkboxes from ITEM_CATEGORIES)
7. Build `HandoffSelector` (pickup/meetup/airport options)
8. Build `FormSummary` (review before submit)
9. Implement form validation
10. Add submission flow with success screen

---

### Step 2: Listing Detail Screen

```bash
git checkout phase1-mvp
git checkout -b feature/listing-detail
```

**Files to create:**
```
apps/mobile/
├── app/
│   └── listing/
│       └── [id].tsx             # Dynamic listing detail
├── components/
│   └── listing-detail/
│       ├── index.ts
│       ├── ListingHeader.tsx
│       ├── UserCard.tsx
│       ├── PricingCard.tsx
│       ├── RestrictionsCard.tsx
│       ├── HandoffCard.tsx
│       └── ActionButtons.tsx
```

---

### Step 3: Booking Flow

```bash
git checkout phase1-mvp
git checkout -b feature/booking-flow
```

**Files to create:**
```
apps/mobile/
├── app/
│   └── booking/
│       ├── _layout.tsx
│       ├── create.tsx           # Create booking from listing
│       ├── [id].tsx             # Booking detail
│       └── confirm.tsx          # Booking confirmation
├── components/
│   └── booking/
│       ├── index.ts
│       ├── ItemDetailsForm.tsx
│       ├── HandoffSelector.tsx
│       ├── PriceBreakdown.tsx
│       ├── BookingCard.tsx
│       └── BookingStatus.tsx
```

---

### Step 4: Messaging System

```bash
git checkout phase1-mvp
git checkout -b feature/messaging
```

**Files to create:**
```
apps/mobile/
├── app/
│   └── chat/
│       ├── _layout.tsx
│       └── [id].tsx             # Individual chat
├── components/
│   └── chat/
│       ├── index.ts
│       ├── ChatList.tsx
│       ├── ChatBubble.tsx
│       ├── MessageInput.tsx
│       └── ChatHeader.tsx
```

---

### Step 5: Profile Screens

```bash
git checkout phase1-mvp
git checkout -b feature/profile-screens
```

**Files to create:**
```
apps/mobile/
├── app/
│   └── profile/
│       ├── _layout.tsx
│       ├── edit.tsx
│       ├── settings.tsx
│       ├── verification.tsx
│       └── help.tsx
├── components/
│   └── profile/
│       ├── index.ts
│       ├── ProfileForm.tsx
│       ├── AvatarUpload.tsx
│       ├── SettingsMenu.tsx
│       └── VerificationSteps.tsx
```

---

## Quality Gates

### Before Merging Feature → Phase Branch

- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] All new components have proper types
- [ ] Translations added for AR and EN
- [ ] RTL layout tested
- [ ] Dark mode tested
- [ ] Basic error handling implemented
- [ ] Loading states implemented

### Before Merging Phase → Develop

- [ ] All milestone tasks complete
- [ ] Manual QA on iOS simulator
- [ ] Manual QA on Android emulator
- [ ] Web preview tested
- [ ] No console errors/warnings
- [ ] Performance acceptable (no jank)
- [ ] Accessibility basics (labels, contrast)

### Before Merging Develop → Main

- [ ] Full regression testing
- [ ] Beta user feedback addressed
- [ ] Crash-free rate > 99%
- [ ] Store assets prepared
- [ ] Legal documents reviewed
- [ ] Security review complete

---

## Release Process

### Version Numbering

```
MAJOR.MINOR.PATCH

1.0.0  - MVP Launch
1.1.0  - New feature (payments)
1.1.1  - Bug fix
2.0.0  - Major redesign
```

### Release Checklist

```markdown
## Release v1.0.0 Checklist

### Pre-Release
- [ ] All PRs merged to main
- [ ] Changelog updated
- [ ] Version bumped in app.json
- [ ] Release notes drafted

### Build & Submit
- [ ] EAS build triggered
- [ ] iOS build successful
- [ ] Android build successful
- [ ] TestFlight submission
- [ ] Play Store internal testing

### Post-Release
- [ ] GitHub release created
- [ ] Team notified
- [ ] Monitoring enabled
- [ ] Support team briefed
```

### Rollback Procedure

```bash
# If critical bug in production
git checkout main
git revert HEAD  # Revert problematic commit
git push origin main

# Trigger hotfix build
eas build --platform all --profile production
eas submit --platform all --profile production
```

---

## Summary

### Immediate Next Steps

1. **Set up GitHub Actions** - Create `.github/workflows/` directory with CI/CD files
2. **Create `eas.json`** - Configure EAS Build profiles
3. **Start Milestone 1** - Create listing screen on `feature/create-listing` branch

### Timeline Overview

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| 1-2 | Core Listing Flow | Create listing screen |
| 2-3 | Listing Detail | View full listings |
| 3-4 | Booking System | Complete bookings |
| 4-5 | Messaging | User communication |
| 5-6 | Profile Screens | User management |
| 6-7 | Backend Integration | Live data |
| 7-8 | Polish & Launch | Store submission |

**Total estimated time to MVP: 6-8 weeks**

---

*This document should be updated as milestones are completed and priorities shift.*
