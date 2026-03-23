# LuggageShare: Issues & Quality Improvement Roadmap

> Generated from code analysis on 2026-02-19. Distributes all found issues across existing sprint phases with best practice recommendations.

---

## Current State Summary

| Metric | Value |
|--------|-------|
| **Overall MVP** | ~65% |
| **API Modules** | 8/8 built (auth, users, listings, bookings, messages, notifications, reviews, wallet) |
| **Mobile Screens** | 12 routes connected to real API |
| **Test Coverage** | 0% |
| **CI/CD** | None |
| **Critical Issues** | 7 |
| **High Issues** | 10 |
| **Medium Issues** | 8 |
| **Low Issues** | 6 |

### What Already Exists (But Is Underutilized)

These assets were built but are NOT being consumed by the code that needs them:

| Asset | Location | Status |
|-------|----------|--------|
| `ValidationPipe` with `whitelist: true` | `apps/api/src/main.ts:20-29` | Configured but defeated by `any`-typed DTOs |
| `ApiResponse<T>`, `PaginatedResponse<T>` types | `packages/shared/src/types/index.ts:134-148` | Defined but never imported by API |
| Shared validators (`validateBooking`, `validateListing`, etc.) | `packages/shared/src/validation/index.ts` | Built but never called by mobile hooks or API |
| Translation files (en.json / ar.json) | `apps/mobile/i18n/locales/` | 120+ keys exist but ~15 screens use inline `isRTL ? ...` instead |
| Auth DTOs with class-validator | `apps/api/src/modules/auth/dto/` | Properly validated — other modules don't follow this pattern |

---

## Sprint 1-2: Foundation Fixes (Auth & Infrastructure)

**Current Status**: ~98% features, but critical security gaps in auth

### CRITICAL

| ID | Issue | File | Effort | Fix |
|----|-------|------|--------|-----|
| F-1 | **Apple auth has zero JWT verification** — `jwtService.decode()` trusts unverified claims. Any forged token is accepted. | `apps/api/src/modules/auth/auth.service.ts:51` | 2-4h | Use `apple-signin-auth` package or manual JWKS verification against `https://appleid.apple.com/auth/keys`. Validate `iss`, `aud`, and signature. |
| F-2 | **Google auth missing audience check** — any Google app's token is accepted | `apps/api/src/modules/auth/auth.service.ts:21-25` | 15min | After line 25, verify `response.data.aud === configService.get('GOOGLE_CLIENT_ID')`. Reject mismatches. |
| F-3 | **`DEV_SKIP_AUTH = __DEV__`** bypasses all auth in dev/TestFlight builds | `apps/mobile/providers/AuthProvider.tsx:28` | 30min | Change to `__DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === 'true'`. Require explicit opt-in. |
| F-4 | **Demo credentials in production code** — fake tokens stored in hook, could leak to production bundle | `apps/mobile/hooks/useGoogleAuth.ts:41-53` | 30min | Guard with same `EXPO_PUBLIC_DEV_SKIP_AUTH` check. Or remove entirely and require real auth config. |

### HIGH

| ID | Issue | File | Effort | Fix |
|----|-------|------|--------|-----|
| F-5 | **useGoogleAuth violates Rules of Hooks** — `Google.useAuthRequest()` called conditionally | `apps/mobile/hooks/useGoogleAuth.ts:31-33` | 1h | Always call the hook. Use the `isConfigured` flag to skip the OAuth flow in the handler, not the hook call. |
| F-6 | **Token refresh race condition** — concurrent 401s trigger parallel refresh calls | `apps/mobile/lib/api.ts:36-74` | 1-2h | Add promise-based mutex: store `refreshPromise` at module level, piggyback concurrent 401 handlers on the in-flight refresh. |
| F-7 | **No token validation on startup** — stale/expired tokens in SecureStore are blindly trusted | `apps/mobile/providers/AuthProvider.tsx:67-81` | 1-2h | In `checkAuth()`, make a lightweight API call (e.g., `GET /users/me`) to validate the token. If 401, clear tokens and redirect to login. |
| F-8 | **Login screen has no error handling** for failed OAuth | `apps/mobile/app/(auth)/login.tsx` | 1h | Add try/catch around sign-in calls, show error alert/toast on failure. |

### MEDIUM

| ID | Issue | File | Effort | Fix |
|----|-------|------|--------|-----|
| F-9 | **Refresh token uses same JWT_SECRET** as access token — replay risk | `apps/api/src/modules/auth/auth.service.ts:80-107` | 1h | Add `JWT_REFRESH_SECRET` env var. Use separate secret for refresh token signing/verification. |
| F-10 | **`generateTokens()` accepts `user: any`** — no type safety | `apps/api/src/modules/auth/auth.service.ts:98` | 15min | Type parameter as `{ id: string; email: string; name: string; avatarUrl: string | null; isVerified: boolean }`. |
| F-11 | **No environment validation** — missing env vars only discovered at runtime | `apps/api/src/app.module.ts` | 1-2h | Add Joi `validationSchema` to `ConfigModule.forRoot()`. Validate `DATABASE_URL`, `JWT_SECRET` (min 32 chars), `GOOGLE_CLIENT_ID`, etc. Fail fast on startup. |

### NEW: Best Practice Additions

| ID | Addition | Effort | Description |
|----|----------|--------|-------------|
| F-BP1 | **Global Exception Filter** | 2-3h | Create `AllExceptionsFilter` that normalizes all errors to `{ error: { code, message, statusCode, details } }`. Map Prisma errors, validation errors, and HTTP exceptions consistently. |
| F-BP2 | **Structured Logging** | 2-3h | Install `nestjs-pino`. Replace all `console.*` with injected `Logger`. Add request correlation IDs. JSON in production, pretty-print in dev. |

---

## Sprint 3-4: Core Features Fixes (Listings, Bookings, Messages)

**Current Status**: ~90% features, but input validation and data integrity gaps

### CRITICAL

| ID | Issue | File | Effort | Fix |
|----|-------|------|--------|-----|
| C-1 | **Client-controlled pricing** — `totalPrice` sent by client, no server calculation | `apps/api/src/modules/bookings/bookings.service.ts:98` | 30min | Replace `totalPrice: createBookingDto.totalPrice` with `totalPrice: listing.pricePerKg * createBookingDto.totalWeight`. Remove `totalPrice` from booking creation DTO. |
| C-2 | **Mass assignment via spread** — `...createListingDto` directly into Prisma data | `apps/api/src/modules/listings/listings.service.ts:68-74` | 30min | Replace spread with explicit field mapping: `{ departureCity, arrivalCity, departureDate, flightNumber, availableWeight, pricePerKg, currency, preferences, notes }`. |
| C-3 | **All DTOs typed as `any`** — ValidationPipe is useless without proper DTOs | `bookings.controller.ts:44`, `listings.controller.ts:54,66`, `messages.controller.ts`, `reviews.controller.ts`, `wallet.controller.ts` | 4-6h | Create DTOs with `class-validator` decorators for every `@Body()` parameter in all 5 modules. Follow the pattern from `apps/api/src/modules/auth/dto/`. |

### HIGH

| ID | Issue | File | Effort | Fix |
|----|-------|------|--------|-----|
| C-4 | **No weight validation on booking** — can exceed listing's `availableWeight` | `apps/api/src/modules/bookings/bookings.service.ts:74-107` | 30min | After fetching listing, add: `if (dto.totalWeight > listing.availableWeight) throw new BadRequestException('Exceeds available weight')`. The shared validator `validateBooking()` already has this logic — import and use it. |
| C-5 | **No API response envelope** — raw Prisma objects returned (leaks all fields) | All controllers | 2h | Create `TransformInterceptor` that wraps responses in `{ data: ... }` matching `ApiResponse<T>` from `packages/shared`. Register globally in `main.ts`. |
| C-6 | **No pagination on any list endpoint** — `findMany()` returns entire tables | All service `findMany()` calls | 4-6h | Add `skip`/`take` parameters to search methods. Use `PaginatedResponse<T>` from `packages/shared`. Start with listings search and bookings list. |
| C-7 | **Dead navigation routes** — profile navigates to non-existent screens | `apps/mobile/app/(tabs)/profile.tsx` | 2h | Either create placeholder screens for `/profile/verification`, `/profile/settings`, `/profile/help` — or remove the menu items until they're built. |

### MEDIUM

| ID | Issue | File | Effort | Fix |
|----|-------|------|--------|-----|
| C-8 | **Date input is plain text** — no date picker, no format validation | `apps/mobile/app/listing/create.tsx` | 2-3h | Replace `TextInput` with `@react-native-community/datetimepicker`. Validate format server-side in DTO. |
| C-9 | **Chat `markAsRead` fires every 5s poll** — should fire once when entering chat | `apps/mobile/app/chat/[bookingId].tsx` | 15min | Add condition: only call `markAsRead` if there are unread messages from the other user. Use a `hasMarkedRead` ref to prevent re-firing. |
| C-10 | **Notification badge hardcoded to 3** — `useUnreadCount` hook exists but is unused | `apps/mobile/app/(tabs)/index.tsx:93` | 15min | Import `useUnreadCount()` from `@/hooks/useNotifications`. Replace `const notificationCount = 3`. |
| C-11 | **Listing update uses spread** — same mass assignment risk as create | `apps/api/src/modules/listings/listings.service.ts:84-87` | 15min | Explicit field mapping for update, same as create fix. |

### NEW: Best Practice Additions

| ID | Addition | Effort | Description |
|----|----------|--------|-------------|
| C-BP1 | **Use shared validators on mobile** | 2h | Import `validateListing`, `validateBooking` from `@luggageshare/shared` in create forms. Validate before mutation call. Gives instant client-side feedback + server guards against bypass. |
| C-BP2 | **API integration tests** | 4-6h | Use `@nestjs/testing` with test DB. Test booking create (price computation, weight limit, self-booking prevention), listing create (field whitelisting). |

---

## Sprint 5-6: Trust & Safety Fixes (Reviews, Verification, Photos)

**Current Status**: ~55% features (reviews + wallet done, verification + photos + disputes missing)

### Features Still Needed

| ID | Feature | Effort | Description |
|----|---------|--------|-------------|
| T-1 | **Image upload service** | 6-8h | Cloudflare R2 integration for avatar photos, item photos, proof of delivery. Presigned URL flow: mobile requests upload URL -> uploads directly to R2 -> sends URL to API. |
| T-2 | **Verification flow screens** | 4-6h | ID verification UI: `/profile/verification` screen. Upload ID photo, selfie. Backend: store in R2 (encrypted bucket), manual admin review for MVP. |
| T-3 | **Basic dispute flow** | 4-6h | Dispute creation for completed bookings. Status: open -> investigating -> resolved. Admin review for MVP. |
| T-4 | **Terms of Service agreement** | 1-2h | ToS acceptance on signup. Store `tosAcceptedAt` timestamp. Block usage without acceptance. |

### Issues in Existing Code

| ID | Issue | File | Effort | Fix |
|----|-------|------|--------|-----|
| T-5 | **Reviews module has no DTO** — `@Body()` typed as `any` | `apps/api/src/modules/reviews/reviews.controller.ts` | 1h | Create `CreateReviewDto` with `@IsInt()` `@Min(1)` `@Max(5)` for rating, `@IsOptional()` `@IsString()` `@MaxLength(500)` for comment. |
| T-6 | **Wallet module has no DTO** | `apps/api/src/modules/wallet/wallet.controller.ts` | 30min | Create query DTOs for filtering transaction history (date range, type filter). |
| T-7 | **Review star component not reusable** — inline in booking detail | `apps/mobile/app/booking/[id].tsx` | 1h | Extract `StarRating` into `components/common/StarRating.tsx`. Will be needed in profile public view, listing detail, etc. |

### NEW: Best Practice Additions

| ID | Addition | Effort | Description |
|----|----------|--------|-------------|
| T-BP1 | **Rate limiting** | 2h | Add `@nestjs/throttler` to prevent review spam, message flooding, booking abuse. Configure per-route limits (e.g., 1 review per booking, 60 messages per minute). |
| T-BP2 | **Content moderation** | 2-3h | Basic profanity filter for reviews and messages. Can use simple word list for MVP, upgrade to AI moderation later. |

---

## Sprint 7-8: Polish & Launch Fixes (i18n, Payments, Testing, CI/CD)

**Current Status**: ~5% features

### HIGH

| ID | Issue | File | Effort | Fix |
|----|-------|------|--------|-----|
| L-1 | **Hardcoded i18n strings everywhere** — ~15 screens bypass `t()` translation | 20+ files with `isRTL ? 'عربي' : 'English'` | 3-4h | Audit all `.tsx` files for `isRTL ?` pattern. Add missing keys to `en.json`/`ar.json`. Replace inline ternaries with `t()` calls. Translation files already have 120+ keys — just need consistency enforcement. |
| L-2 | **No ESLint configuration** | Project-wide | 2-3h | Add `@typescript-eslint` + `eslint-plugin-react` + `eslint-plugin-react-hooks`. Add custom rule or CI check to flag hardcoded Arabic strings in `.tsx` files. |
| L-3 | **Zero test coverage** | Project-wide | 8-12h | Priority order: (1) Auth service unit tests (security), (2) Booking service unit tests (financial), (3) Listing service unit tests (data integrity), (4) API integration tests. |
| L-4 | **No CI/CD pipeline** | `.github/workflows/` | 2-3h | GitHub Actions: `typecheck` -> `lint` -> `test` -> `build` on push/PR. Add Prisma schema validation. Add `prettier --check`. |

### Features Still Needed

| ID | Feature | Effort | Description |
|----|---------|--------|-------------|
| L-5 | **Settings screen** | 3-4h | `/profile/settings` — language toggle (ar/en), theme (light/dark/system), notification preferences, delete account. |
| L-6 | **Help screen** | 2h | `/profile/help` — FAQ, contact support, report a problem. |
| L-7 | **Payment flow screens (Phase 1)** | 4-6h | Bank transfer details display, IBAN copy button, transfer screenshot upload (requires image upload from T-1). |
| L-8 | **WebSocket gateway** | 8-12h | Replace 5s polling with real-time. NestJS `@WebSocketGateway`, Socket.IO client on mobile. Events: new message, booking status change, notification. |
| L-9 | **App store preparation** | 4-6h | Expo EAS build config, app icons, splash screen, app store screenshots, privacy declarations. |

### MEDIUM

| ID | Issue | Effort | Fix |
|----|-------|--------|-----|
| L-10 | **CORS wildcard in development** — should be restricted | 30min | Review `CORS_ORIGINS` env var. Ensure production only allows app domains. |
| L-11 | **No Dockerfile** for API deployment | 1-2h | Multi-stage Dockerfile: build stage (compile TS + generate Prisma) -> run stage (node + production deps). |

### NEW: Best Practice Additions

| ID | Addition | Effort | Description |
|----|----------|--------|-------------|
| L-BP1 | **Pre-commit hooks** | 1h | Install `husky` + `lint-staged`. Run typecheck + lint on staged files before commit. Prevents broken code from entering the repo. |
| L-BP2 | **Error boundary (mobile)** | 1-2h | Add React error boundary wrapper. Catch rendering crashes gracefully, show "Something went wrong" screen with retry button. Report errors to console/future monitoring. |
| L-BP3 | **API health check endpoint** | 30min | `GET /api/v1/health` — returns DB connection status, uptime, version. Required for deployment monitoring. |

---

## Quick Wins Summary (< 1 hour each, high impact)

These can be done in any session as "warm-up" tasks:

| # | Fix | Time | Sprint | Impact |
|---|-----|------|--------|--------|
| 1 | Server-side price computation (C-1) | 30min | 3-4 | Prevents financial manipulation |
| 2 | Google audience check (F-2) | 15min | 1-2 | Closes auth bypass |
| 3 | Fix listing mass assignment (C-2) | 30min | 3-4 | Prevents data corruption |
| 4 | DEV_SKIP_AUTH guard (F-3) | 30min | 1-2 | Prevents auth bypass in builds |
| 5 | Fix markAsRead spam (C-9) | 15min | 3-4 | Reduces unnecessary API calls by ~90% |
| 6 | Fix notification count (C-10) | 15min | 3-4 | Uses existing hook instead of hardcode |
| 7 | Fix listing update spread (C-11) | 15min | 3-4 | Prevents mass assignment on update |
| 8 | Type `generateTokens` param (F-10) | 15min | 1-2 | Removes `any` in auth core |

**Total quick wins time**: ~2.5 hours for 8 fixes

---

## Recommended Fix Order (Across All Sprints)

### Phase A: "Stop the Bleeding" (Day 1-2, ~4 hours)

Security and financial integrity fixes that require minimal codebase disruption:

1. Server-side price computation (C-1)
2. Google audience check (F-2)
3. Listing mass assignment fix (C-2 + C-11)
4. DEV_SKIP_AUTH guard (F-3 + F-4)
5. Fix `generateTokens` type (F-10)

### Phase B: "Structural Hardening" (Day 3-7, ~12 hours)

Add the validation and typing infrastructure that prevents entire classes of bugs:

6. Create all missing DTOs (C-3) — bookings, listings, messages, reviews, wallet
7. Apple auth JWT verification (F-1)
8. Response envelope interceptor (C-5)
9. Environment validation (F-11)
10. Token refresh mutex (F-6)

### Phase C: "Mobile Stabilization" (Day 8-12, ~8 hours)

Fix mobile-specific issues affecting UX and correctness:

11. Fix useGoogleAuth hooks violation (F-5)
12. Token validation on startup (F-7)
13. Complete i18n consistency (L-1)
14. Fix markAsRead + notification count (C-9, C-10)
15. Dead route handling (C-7)

### Phase D: "Quality Infrastructure" (Day 13-20, ~16 hours)

Testing, CI/CD, and observability:

16. Auth service unit tests
17. Booking service unit tests
18. GitHub Actions CI pipeline (L-4)
19. ESLint configuration (L-2)
20. Structured logging (F-BP2)

### Phase E: "Feature Completion" (Day 21+)

Remaining features and polish:

21. Image upload service (T-1)
22. Verification flow (T-2)
23. Pagination (C-6)
24. Settings + Help screens (L-5, L-6)
25. WebSocket gateway (L-8)
26. Payment flow screens (L-7)

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **API Validation** | Continue with `class-validator` (NOT Zod) | NestJS `ValidationPipe` already configured. Auth DTOs already use decorators. Adding Zod creates dual ecosystem with no benefit. |
| **Response Envelope** | Global NestJS interceptor | Controllers return domain objects. Interceptor wraps consistently. Matches `ApiResponse<T>` already defined in shared package. |
| **Shared Validators** | Keep hand-written validators (defer Zod migration) | `packages/shared/src/validation/` works well. Migration cost not justified at 65% MVP. |
| **WebSocket** | Defer to Sprint 7-8, fix polling first | WebSocket requires gateway + client socket + reconnection logic. Fix `markAsRead` spam first (15min), increase poll to 10s. |
| **Testing Priority** | Auth > Bookings > Listings > Integration | Auth has security bugs. Bookings have financial impact. Listings have data integrity. Mobile hooks are thin wrappers — low ROI to test. |
| **Logging** | `nestjs-pino` over Winston | Pino is faster, NestJS integration is cleaner, structured JSON by default. |

---

## Metrics Targets

| Metric | Current | After Phase B | After Phase D | Launch |
|--------|---------|---------------|---------------|--------|
| Critical issues | 7 | 0 | 0 | 0 |
| High issues | 10 | 3 | 0 | 0 |
| Test coverage | 0% | 0% | 30%+ | 50%+ |
| DTOs with validation | 3/8 modules | 8/8 | 8/8 | 8/8 |
| i18n consistency | ~60% | ~60% | ~95% | 100% |
| CI/CD | None | None | Lint + Type + Build | Full pipeline |

---

*Last updated: 2026-02-19*
*Next review: After Phase B completion*
