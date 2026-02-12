# LuggageShare - Project Roadmap

> **Last Updated**: February 2026
> **Strategy**: Web-first MVP → Mobile expansion → Regional growth
> **Branch**: `phase1-web-mvp`

---

## Strategy Change Notice

The original DEVELOPMENT_PLAN.md recommended a mobile-first approach. After evaluation, the strategy was changed to **web-first** for faster iteration and easier testing. Mobile development is now Phase 2.

**Decisions Made**:
- Framework: React Native + Expo (not Flutter)
- ORM: Prisma (not TypeORM)
- Development order: Web first, Mobile second
- Pricing model: Tiered (S/M/L) not per-kg
- Messaging: Pre-booking conversations supported (not booking-only)

---

## Current State Summary

| Component | Status | Details |
|-----------|--------|---------|
| **Web Frontend** | ~85% UI complete | 14 pages, 21 components, mock data only |
| **API Backend** | Scaffolded | 6 modules wired, simplified schema |
| **Mobile App** | Shell only | Basic tabs and auth screen |
| **Database** | Schema defined | Not deployed, needs Supabase setup |
| **Authentication** | Code written | Not tested (needs Google/Apple credentials) |
| **Real-time Chat** | Not started | REST polling only |
| **Payments** | Not started | No module, no schema |
| **File Storage** | Not started | No upload endpoints |
| **Tests** | Not started | Zero test files |
| **CI/CD** | Not started | No GitHub Actions |

---

## Phase 1: Web MVP (Current)

**Goal**: Fully functional web marketplace with real data
**Branch**: `phase1-web-mvp`
**Target**: 8 weeks from API integration start

### Milestone 1: Foundation (DONE)
- [x] Monorepo setup (Turborepo)
- [x] Next.js 14 web app with TypeScript
- [x] NestJS API scaffolding
- [x] Prisma schema (basic)
- [x] Arabic RTL layout
- [x] Tailwind CSS design system

### Milestone 2: Web UI (DONE)
- [x] Homepage with search, popular routes, how-it-works
- [x] Browse listings with search/filters/grid-list toggle
- [x] Listing detail pages
- [x] Create listing (7-step wizard)
- [x] Bookings (list, detail, create, confirmation)
- [x] Messages (conversation list, chat interface)
- [x] Profile (view, edit, settings, my listings)
- [x] Header with navigation and notification badge
- [x] Footer

### Milestone 3: Arabic Localization (IN PROGRESS)
- [x] All pages in Arabic
- [x] Create listing page title/buttons in Arabic
- [ ] **8 create-listing sub-components still in English**
- [ ] Error messages in Arabic
- [ ] Form validation messages in Arabic

### Milestone 4: Data Model Alignment (NOT STARTED)
- [ ] Update Prisma schema to match decisions:
  - Tiered pricing (small/medium/large) instead of pricePerKg
  - Conversations model (pre-booking messaging)
  - User balance field for credit system
  - Listing expiresAt field
  - Booking bookingRef (human-readable)
  - Soft deletes (deletedAt)
- [ ] Create shared types package in `packages/shared/`
- [ ] Align web frontend types with Prisma models
- [ ] Run Prisma migrations

### Milestone 5: API Integration (NOT STARTED)
- [ ] Set up Supabase project and deploy database
- [ ] Generate JWT secret
- [ ] Configure Google OAuth credentials
- [ ] Connect web frontend to real API (replace mock data)
- [ ] Implement proper Apple Sign-In token verification
- [ ] Add input validation DTOs (class-validator) to all endpoints
- [ ] Add CORS, helmet, rate limiting
- [ ] Implement file upload (Supabase Storage or Cloudflare R2)

### Milestone 6: Core Features Live (NOT STARTED)
- [ ] Real listing creation and browsing
- [ ] Real booking flow
- [ ] Pre-booking messaging (conversations)
- [ ] Push notifications (Expo Push)
- [ ] User reviews module
- [ ] Basic admin dashboard

### Milestone 7: Launch Readiness (NOT STARTED)
- [ ] Automated tests (API + Web)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Prisma migrations (replace db push)
- [ ] Error tracking (Sentry)
- [ ] Structured logging
- [ ] Deploy web to Vercel
- [ ] Deploy API to Railway/Render

---

## Phase 2: Mobile App

**Goal**: React Native mobile app for iOS and Android
**Branch**: `phase2-mobile`
**Prerequisite**: Phase 1 API fully working

### Milestone 8: Mobile Foundation
- [ ] Connect mobile app to real API
- [ ] Implement Google + Apple Sign-In on mobile
- [ ] Push notification registration
- [ ] Core navigation (tabs: home, trips, messages, profile)

### Milestone 9: Mobile Features
- [ ] Browse and search listings
- [ ] Create listing flow
- [ ] Booking flow
- [ ] Chat/messaging with real-time updates
- [ ] Profile management
- [ ] Camera integration for item photos

### Milestone 10: Mobile Polish
- [ ] Arabic/English language toggle
- [ ] Offline support (basic caching)
- [ ] Deep linking
- [ ] App Store assets and screenshots

### Milestone 11: App Store Submission
- [ ] EAS Build configuration
- [ ] TestFlight beta (iOS)
- [ ] Internal testing (Android)
- [ ] App Store + Google Play submission

---

## Phase 3: Trust & Safety

**Goal**: Build user trust for the Saudi market
**Prerequisite**: Both web and mobile live

### Features
- [ ] ID verification flow (national ID / Iqama)
- [ ] Phone number verification (OTP via WhatsApp/SMS)
- [ ] Photo upload for items with moderation
- [ ] Dispute resolution system
- [ ] User reputation system (badges, levels)
- [ ] Prohibited items detection
- [ ] Report/block users

---

## Phase 4: Monetization

**Goal**: Sustainable revenue model

### Phase 4a: Soft Monetization (0% → 5%)
- [ ] Credit balance system (carrier-side commission tracking)
- [ ] Balance top-up via bank transfer
- [ ] Admin verification of top-ups
- [ ] Balance restriction when debt exceeds threshold

### Phase 4b: Full Monetization (5% → 10-15%)
- [ ] Payment gateway integration (e.g., Moyasar, HyperPay)
- [ ] Escrow system
- [ ] Automated commission deduction
- [ ] Insurance integration
- [ ] Premium carrier subscriptions

---

## Phase 5: Growth & Scale

**Goal**: Regional expansion and advanced features

### Features
- [ ] AI-powered listing matching
- [ ] Flight data integration
- [ ] Advanced search (maps, filters, recommendations)
- [ ] Referral program
- [ ] B2B API for travel agencies
- [ ] Multi-region support (GCC countries)
- [ ] Admin panel (full)
- [ ] Analytics dashboard
- [ ] Help center / FAQ

---

## Tech Stack (Actual)

| Layer | Technology | Status |
|-------|-----------|--------|
| **Web** | Next.js 14, React 18, TypeScript, Tailwind CSS | In use |
| **Mobile** | React Native, Expo SDK 52, TypeScript | Shell only |
| **API** | NestJS 10, TypeScript | Scaffolded |
| **Database** | PostgreSQL via Supabase, Prisma ORM | Schema defined |
| **Auth** | JWT + Google OAuth + Apple Sign-In | Code written |
| **State** | Zustand (client), React Query (server) | Configured |
| **Real-time** | Socket.io (planned) | Not started |
| **Storage** | Cloudflare R2 (planned) | Not started |
| **Email** | Resend (planned) | Not started |
| **Cache** | Redis via Upstash (planned) | Not started |
| **Notifications** | Expo Push API | Code written |
| **Monorepo** | Turborepo | In use |
| **Deployment** | Vercel (web), Railway (API) | Planned |

---

## Required External Services

### Must Have (Before Launch)
| Service | Purpose | Cost |
|---------|---------|------|
| Supabase | Database + Auth | Free tier |
| Google Cloud | OAuth credentials | Free |
| Apple Developer | Apple Sign-In | $99/year |
| Expo | Push notifications + builds | Free tier |

### Nice to Have (MVP)
| Service | Purpose | Cost |
|---------|---------|------|
| Cloudflare R2 | File storage | $0.015/GB |
| Resend | Transactional email | Free tier |
| Upstash | Redis caching | Free tier |
| Sentry | Error tracking | Free tier |

---

## Known Issues & Technical Debt

1. **Documentation Divergence**: DATABASE_SCHEMA.md describes a more complex schema than what's in Prisma. This roadmap is now the canonical source of truth.
2. **Web/API Data Model Mismatch**: Web frontend types don't match Prisma models (pricing, messaging, fields). Must be aligned in Milestone 4.
3. **Apple Auth Not Verified**: Token decoding without cryptographic verification. Must fix before launch.
4. **No Input Validation**: API controllers accept `any` types. Must add DTOs with class-validator.
5. **No Tests**: Zero test files in the project. Must add before launch.
6. **Create-Listing Components in English**: 8 sub-components need Arabic translation.

---

## Document Index

| Document | Purpose | Canonical? |
|----------|---------|-----------|
| **ROADMAP.md** (this file) | Single source of truth for project status and plan | YES |
| DEVELOPMENT_PLAN.md | Original technical planning (partially outdated) | Reference only |
| DATABASE_SCHEMA.md | Aspirational database design (partially outdated) | Reference only |
| API_SPECIFICATION.md | API endpoint documentation | Reference only |
| UI_UX_DESIGN.md | Design system and wireframes | Reference only |
| NOTIFICATIONS.md | Push notification specification | Current |
| PRIVACY_POLICY.md | PDPL-compliant privacy policy | Current |
| TERMS_OF_SERVICE.md | Terms of service | Current |
| README.md | Project overview | Needs update |
