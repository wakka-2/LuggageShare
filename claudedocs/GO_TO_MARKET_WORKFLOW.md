# LuggageShare — Go-to-Market Implementation Workflow

**Created**: 2026-02-28
**Source**: [PRODUCTION_READINESS_AUDIT.md](PRODUCTION_READINESS_AUDIT.md)
**Branch**: `sprint-7-8-polish-launch`
**Target**: App Store + Play Store submission

---

## Timeline Overview

```
Week 1-2    ██████████  Sprint A: Security & Data Integrity (Alpha gate)
Week 3-4    ██████████  Sprint B: Infrastructure & Deployment (Staging gate)
Week 5-6    ██████████  Sprint C: Mobile Hardening & UX (TestFlight gate)
Week 7-8    ██████████  Sprint D: Security Hardening & QA (Store submission gate)
Week 9+     ░░░░░░░░░░  Sprint E: Post-launch & GA polish
```

**Total estimated effort to App Store submission: ~6-8 weeks**

---

## Sprint A: Security & Data Integrity (Week 1-2)

> **Gate**: Closed alpha with trusted testers on staging

### A-1. Wallet Transactional Integrity [B-1] — ~3h
**File**: `apps/api/src/modules/wallet/wallet.service.ts`
**Depends on**: Nothing
**Tasks**:
- [ ] Wrap `requestWithdrawal()` in `prisma.$transaction()` with serializable isolation
- [ ] Replace `findMany` + JS reduce with `prisma.balanceHistory.aggregate({ _sum: { amount: true } })`
- [ ] Add `@Max(10000)` decorator to `WithdrawalRequestDto` for per-transaction limit
- [ ] Add unit test for concurrent withdrawal race condition
- [ ] Verify Decimal handling (avoid `Number()` conversion — use `.toNumber()` from Prisma Decimal or keep as string)

### A-2. Refresh Token Rotation [B-2] — ~5h
**File**: `apps/api/src/modules/auth/auth.service.ts`
**Depends on**: A-3 (schema change for RefreshToken model)
**Tasks**:
- [ ] Add `RefreshToken` model to Prisma schema (id, token hash, userId, family, expiresAt, revokedAt)
- [ ] Store hashed refresh token on issue (use `crypto.createHash('sha256')`)
- [ ] On refresh: validate token exists in DB, is not revoked, and not expired
- [ ] Rotate: issue new refresh token, mark old as used
- [ ] Token family detection: if a used token is presented again, revoke entire family (theft detection)
- [ ] Add `type: 'access' | 'refresh'` claim to JWT payload, validate on each verify
- [ ] Clean up expired tokens via a scheduled task or on-demand

### A-3. Prisma Migrations Setup [B-3] — ~1h
**File**: `apps/api/prisma/`
**Depends on**: Nothing
**Tasks**:
- [ ] Run `npx prisma migrate dev --name init` to baseline current schema
- [ ] Replace `db:push` with `db:migrate` in `turbo.json` and `package.json`
- [ ] Update CI workflow to run `prisma migrate deploy` instead of `prisma db push`
- [ ] Document migration workflow in README or CONTRIBUTING.md

### A-4. JWT Secret Hardening [H-3] — ~30min
**File**: `apps/api/src/app.module.ts`
**Depends on**: Nothing
**Tasks**:
- [ ] Change `JWT_REFRESH_SECRET` from `optional()` to `required()` in Joi schema
- [ ] Add `NODE_ENV` to Joi schema: `Joi.string().valid('development', 'production', 'test').default('development')`
- [ ] Add `CORS_ORIGINS` as required when `NODE_ENV === 'production'`
- [ ] Update `.env.example` with `JWT_REFRESH_SECRET` placeholder

### A-5. Swagger Production Guard [H-1] — ~15min
**File**: `apps/api/src/main.ts`
**Depends on**: A-4 (NODE_ENV in Joi)
**Tasks**:
- [ ] Wrap `SwaggerModule.setup()` in `if (process.env.NODE_ENV !== 'production')`
- [ ] Add body size limit: `app.use(express.json({ limit: '1mb' }))`
- [ ] Enable graceful shutdown: `app.enableShutdownHooks()`

### A-6. PII Masking in API Responses [H-2] — ~2h
**File**: `apps/api/src/modules/bookings/bookings.service.ts`, `apps/api/src/modules/users/`
**Depends on**: Nothing
**Tasks**:
- [ ] Create `maskIban(iban: string)` utility: `SA03****7519`
- [ ] In booking detail: mask carrier IBAN, remove phone from default response
- [ ] Create `PublicProfileDto` with: id, name, avatarUrl, isVerified, bio, city, rating, stats
- [ ] `GET /users/:id` returns `PublicProfileDto` (not full record)
- [ ] `GET /users/me` returns full profile (existing behavior)

### A-7. Dev Login Hardening [H-4] — ~30min
**File**: `apps/api/src/modules/auth/auth.controller.ts`
**Depends on**: A-4 (NODE_ENV in Joi)
**Tasks**:
- [ ] Add `DEV_LOGIN_ENABLED` env var check alongside NODE_ENV
- [ ] Add to Joi schema: `DEV_LOGIN_ENABLED: Joi.boolean().default(false)`
- [ ] Guard: `if (NODE_ENV === 'production' || !DEV_LOGIN_ENABLED) throw`

**Sprint A Deliverable**: Staging API with hardened auth, transactional wallet, migration-ready DB, and masked PII responses.

---

## Sprint B: Infrastructure & Deployment (Week 3-4)

> **Gate**: App deployed to staging environment, CI/CD pipeline operational

### B-1. Error Tracking — Sentry Integration [B-4] — ~4h
**Depends on**: Nothing (parallel with all)
**Tasks**:
- [ ] `npm install @sentry/nestjs @sentry/node` in `apps/api/`
- [ ] Initialize Sentry in `main.ts` before app bootstrap
- [ ] Add Sentry exception filter integration
- [ ] `npx expo install @sentry/react-native` in `apps/mobile/`
- [ ] Initialize Sentry in `apps/mobile/app/_layout.tsx`
- [ ] Add `SENTRY_DSN` to `.env.example` and Joi schema
- [ ] Configure Sentry project, alert rules, and Slack/email notifications
- [ ] Test: trigger an unhandled error and verify it appears in Sentry dashboard

### B-2. Domain, DNS & Hosting Setup [B-5] — ~4h
**Depends on**: Nothing (infrastructure task)
**Tasks**:
- [ ] Register `luggageshare.com` (if not already registered)
- [ ] Configure DNS: `api.luggageshare.com` → API host, `cdn.luggageshare.com` → R2 bucket
- [ ] Set up SSL certificates (Cloudflare or Let's Encrypt)
- [ ] Deploy API Docker container to cloud provider (Railway / Render / AWS ECS / Fly.io)
- [ ] Configure Cloudflare R2 custom domain binding for `cdn.luggageshare.com`
- [ ] Deploy web app to Vercel with custom domain
- [ ] Update `eas.json` production `EXPO_PUBLIC_API_URL` to real domain
- [ ] Replace all placeholder values in `eas.json` (appleId, ascAppId, appleTeamId)
- [ ] Replace placeholder `projectId` in `app.json` with real EAS project ID

### B-3. CD Pipelines [H-8] — ~4h
**Depends on**: B-2 (hosting must exist)
**Tasks**:
- [ ] Create `.github/workflows/deploy-api.yml`: build Docker → push → deploy on `develop` merge
- [ ] Create `.github/workflows/deploy-web.yml`: Vercel deploy trigger
- [ ] Create `.github/workflows/eas-build.yml`: EAS Build on tag/release
- [ ] Fix CI Prisma command: replace `npx prisma generate` with local binary path
- [ ] Add `prisma migrate deploy` step to API deployment workflow
- [ ] Add `.dockerignore` file (exclude node_modules, .git, apps/mobile, apps/web, test files)

### B-4. Deep Health Checks [M-20] — ~1h
**Depends on**: B-1 (Sentry for alerting)
**Tasks**:
- [ ] `npm install @nestjs/terminus` in `apps/api/`
- [ ] Create `HealthModule` with database ping, disk storage, and memory checks
- [ ] Replace current `/health` with Terminus-based `/health` and `/health/ready`
- [ ] Add external uptime monitoring (UptimeRobot or Checkly) pointing to `/health`

### B-5. Connection Pooling [H-10] — ~30min
**Depends on**: B-2 (Supabase config)
**Tasks**:
- [ ] Switch `DATABASE_URL` to Supabase connection pooler URL (port 6543)
- [ ] Add `?connection_limit=10` to Prisma datasource URL
- [ ] Document connection pooling config in `.env.example`

### B-6. CORS Production Hardening [H-6] — ~15min
**File**: `apps/api/src/main.ts`
**Depends on**: A-4 (Joi schema)
**Tasks**:
- [ ] Remove localhost fallback from CORS origin
- [ ] Production CORS: only `CORS_ORIGINS` from env (no default)
- [ ] Development: keep localhost as explicit dev-only default

**Sprint B Deliverable**: Fully deployed staging environment with CI/CD, error tracking, health monitoring, and production-ready infrastructure config.

---

## Sprint C: Mobile Hardening & UX (Week 5-6)

> **Gate**: TestFlight / Internal Testing track submission

### C-1. Accessibility — Core Interactive Elements [B-6] — ~8h
**Depends on**: Nothing
**Tasks**:
- [ ] **Tab navigation** (`_layout.tsx`): Add `accessibilityLabel` to all tab icons
- [ ] **Buttons**: Add `accessibilityRole="button"` and `accessibilityLabel` to all TouchableOpacity/Pressable
- [ ] **Input fields** (`Input.tsx`): Add `accessibilityLabel`, `accessibilityHint`
- [ ] **ListingCard**: `accessibilityLabel` with listing summary, `accessibilityRole="button"`
- [ ] **TripCard**: `accessibilityLabel` with trip summary
- [ ] **Avatar**: `accessibilityLabel="User avatar"` or name-based label
- [ ] **Forms** (create listing, create booking, edit profile): Label all inputs
- [ ] **Alerts/Modals**: Ensure focus management for screen readers
- [ ] **Images**: `accessibilityLabel` for all user-uploaded images
- [ ] **Status badges**: `accessibilityLabel` with status text

### C-2. Push Notifications End-to-End [B-7] — ~5h
**Depends on**: B-1 (Sentry for error tracking)
**Tasks**:
- [ ] Create `hooks/usePushNotifications.ts`:
  - Request permission on login
  - Call `Notifications.getExpoPushTokenAsync()`
  - Register token via `POST /api/v1/notifications/register-token`
  - Set up foreground notification handler
  - Set up background/tap notification handler (navigate to relevant screen)
- [ ] Wire hook into `AuthProvider` (register on sign-in, unregister on sign-out)
- [ ] API: Add Expo push sending service using `expo-server-sdk`
  - `npm install expo-server-sdk` in `apps/api/`
  - Send push on: booking status change, new message, booking request received
- [ ] Create `RegisterTokenDto` with proper validation (`@IsString`, `@IsNotEmpty`, `@IsIn(['ios','android','web'])`)
- [ ] Test: full flow from booking acceptance → push notification → tap → navigate to booking

### C-3. Offline Support [B-8] — ~4h
**Depends on**: Nothing
**Tasks**:
- [ ] `npx expo install @react-native-community/netinfo`
- [ ] Create `hooks/useNetworkStatus.ts`: track online/offline state
- [ ] Create `components/common/OfflineBanner.tsx`: persistent banner when offline
- [ ] Wire into `_layout.tsx`: show banner app-wide
- [ ] React Query tuning:
  - Set `gcTime: 1000 * 60 * 30` (30 min garbage collection)
  - Set `staleTime: 1000 * 60 * 5` (5 min stale time)
  - Add `networkMode: 'offlineFirst'` for read queries
- [ ] Graceful degradation: show cached data with "Last updated X ago" indicator
- [ ] Chat: queue messages locally, send when back online (optimistic update)

### C-4. Error Boundaries [M-19] — ~2h
**Depends on**: B-1 (Sentry for reporting)
**Tasks**:
- [ ] Create `components/common/ErrorBoundary.tsx` with Sentry.captureException
- [ ] Add fallback UI: "Something went wrong" with retry button
- [ ] Wrap tab screens in ErrorBoundary
- [ ] Wrap modal screens in ErrorBoundary
- [ ] Test: throw error in a component, verify boundary catches it and reports to Sentry

### C-5. Demo Token Cleanup [H-7] — ~1h
**Depends on**: Nothing
**Tasks**:
- [ ] Move demo auth logic in `useAppleAuth.ts` and `useGoogleAuth.ts` behind `if (__DEV__)` blocks
- [ ] Verify Metro bundler strips `__DEV__` code in production builds
- [ ] Alternative: move demo auth to `dev/` directory excluded from production via `metro.config.js`

**Sprint C Deliverable**: Accessible app with push notifications, offline support, error boundaries — ready for TestFlight submission.

---

## Sprint D: Security Hardening & QA (Week 7-8)

> **Gate**: App Store / Play Store submission

### D-1. Certificate Pinning [H-5] — ~2h
**Depends on**: B-2 (real domain + SSL cert)
**Tasks**:
- [ ] Install `react-native-ssl-pinning` or configure via Expo plugin
- [ ] Pin against public key hash of `api.luggageshare.com` certificate
- [ ] Implement pin rotation strategy (pin both current and backup certs)
- [ ] Test: verify MITM proxy (Charles/mitmproxy) is blocked

### D-2. Auth Endpoint Rate Limiting [M-2] — ~30min
**File**: `apps/api/src/modules/auth/auth.controller.ts`
**Depends on**: Nothing
**Tasks**:
- [ ] Add `@Throttle({ short: { ttl: 60000, limit: 5 } })` to auth controller
- [ ] Add stricter limit on `/auth/refresh`: 10 per minute
- [ ] Add stricter limit on `/auth/dev-login`: 3 per minute

### D-3. Payment Proof URL Validation [M-8] — ~30min
**File**: `apps/api/src/modules/bookings/dto/submit-payment-proof.dto.ts`
**Depends on**: B-2 (R2 CDN domain configured)
**Tasks**:
- [ ] Add custom validator: `proofImageUrl` must start with configured `R2_PUBLIC_URL`
- [ ] Reject any URL not pointing to own storage
- [ ] Add `R2_PUBLIC_URL` to Joi schema as required in production

### D-4. File Upload Hardening [M-9] — ~1h
**File**: `apps/api/src/modules/uploads/uploads.service.ts`
**Depends on**: Nothing
**Tasks**:
- [ ] `npm install file-type` in `apps/api/`
- [ ] Validate actual file contents via magic bytes, not just client-provided MIME type
- [ ] Ensure R2 bucket serves with `X-Content-Type-Options: nosniff` header
- [ ] Add per-user storage quota tracking (optional — can defer)

### D-5. OAuth Audience Enforcement [M-1] — ~30min
**File**: `apps/api/src/app.module.ts`, `apps/api/src/modules/auth/auth.service.ts`
**Depends on**: Nothing
**Tasks**:
- [ ] Make `GOOGLE_CLIENT_ID` required (not just in production)
- [ ] Make `APPLE_CLIENT_ID` / `APPLE_TEAM_ID` required
- [ ] Remove conditional audience check — always validate

### D-6. Notification Token DTO [M-5] — ~30min
**File**: `apps/api/src/modules/notifications/notifications.controller.ts`
**Depends on**: Nothing
**Tasks**:
- [ ] Create `RegisterTokenDto` class with `@IsString()`, `@IsNotEmpty()`, `@IsIn(['ios','android','web'])`, `@MaxLength(200)`
- [ ] Replace inline `body: { token: string; platform: string }` with DTO

### D-7. Booking Concurrency [M-18] — ~2h
**File**: `apps/api/src/modules/bookings/bookings.service.ts`
**Depends on**: Nothing
**Tasks**:
- [ ] Add optimistic locking via `@UpdatedAt` / version field on Booking model
- [ ] Wrap booking creation in transaction: check available weight → create booking atomically
- [ ] Wrap status transitions in transaction: verify current status → update

### D-8. API Tests — Missing Module Coverage [M-12] — ~6h
**Depends on**: All API changes in Sprints A-D
**Tasks**:
- [ ] `wallet.service.spec.ts` — transaction integrity, balance calculation, withdrawal limits
- [ ] `users.service.spec.ts` — profile CRUD, public vs private profile, IBAN masking
- [ ] `notifications.service.spec.ts` — token registration, push sending
- [ ] `messages.service.spec.ts` — conversation CRUD, unread counts
- [ ] `reviews.service.spec.ts` — rating validation, one-review-per-booking
- [ ] `uploads.service.spec.ts` — MIME validation, file size, path sanitization
- [ ] Update CI to provision PostgreSQL for E2E tests

### D-9. App Store Preparation — ~2h
**Depends on**: C-1 (accessibility), B-2 (domain)
**Tasks**:
- [ ] Verify all EAS placeholders replaced with real values
- [ ] Generate app icons and splash screen for all required sizes
- [ ] Write App Store description (en + ar)
- [ ] Create privacy policy page at `luggageshare.com/privacy`
- [ ] Create terms of service page at `luggageshare.com/terms`
- [ ] Configure Universal Links (iOS) and App Links (Android)
- [ ] Run EAS Build production profile
- [ ] Submit to TestFlight / Internal Testing
- [ ] Review Apple's guidelines for marketplace/payment apps

**Sprint D Deliverable**: Security-hardened, tested, and App Store-ready build.

---

## Sprint E: Post-Launch & GA Polish (Week 9+)

> **Gate**: General Availability

| # | Task | Effort | Priority |
|---|------|--------|----------|
| E-1 | WebSocket gateway for real-time chat (replace 5s polling) | 6h | High |
| E-2 | Redis caching for listings, profiles, balance | 3h | High |
| E-3 | JwtAuthGuard as global guard + @Public() decorator | 2h | Medium |
| E-4 | Web: httpOnly cookies for token storage (BFF pattern) | 4h | Medium |
| E-5 | PII encryption at rest for document numbers | 3h | Medium |
| E-6 | npm audit in CI + Dependabot/Renovate | 1h | Medium |
| E-7 | Align dependency versions across apps | 2h | Low |
| E-8 | Mobile E2E tests (Maestro or Detox) | 8h | Low |
| E-9 | Web app tests | 4h | Low |
| E-10 | docker-compose.yml for local dev | 1h | Low |
| E-11 | Update README (remove "planned" labels) | 30min | Low |
| E-12 | CHANGELOG.md + release tagging | 30min | Low |
| E-13 | Universal Links / App Links for deep linking | 2h | Low |

---

## Dependency Graph

```
A-3 (Migrations) ──────────────────────────────────────────┐
A-4 (Joi schema) ──► A-5 (Swagger guard)                   │
                 ──► A-7 (Dev login)                        │
                 ──► B-6 (CORS)                             │
A-2 (Token rotation) ◄── A-3 (needs RefreshToken model)    │
                                                            │
B-2 (Domain/Hosting) ──► B-3 (CD pipelines)                │
                     ──► B-5 (Connection pooling)           │
                     ──► D-1 (Cert pinning)                 │
                     ──► D-3 (Payment proof URL)            │
                     ──► D-9 (App Store prep)               │
                                                            │
B-1 (Sentry) ──► C-2 (Push notifications)                  │
             ──► C-4 (Error boundaries)                     │
                                                            │
C-1 (Accessibility) ──► D-9 (App Store prep)               │
                                                            │
D-8 (Tests) ◄── All API changes (Sprints A-D)              │
```

---

## Parallel Execution Opportunities

### Sprint A — Can run in parallel:
```
Track 1 (API Security):     A-1 → A-6 → A-7
Track 2 (Auth):             A-3 → A-2 → A-4 → A-5
```

### Sprint B — Can run in parallel:
```
Track 1 (Infrastructure):   B-2 → B-3 → B-5
Track 2 (Monitoring):       B-1 → B-4
Track 3 (Config):           B-6
```

### Sprint C — Can run in parallel:
```
Track 1 (Mobile UX):        C-1 (Accessibility — largest task)
Track 2 (Features):         C-2 → C-3
Track 3 (Stability):        C-4 → C-5
```

### Sprint D — Can run in parallel:
```
Track 1 (Security):         D-1 → D-2 → D-3 → D-4 → D-5 → D-6
Track 2 (Data Integrity):   D-7
Track 3 (Quality):          D-8
Track 4 (Store):            D-9
```

---

## Effort Summary

| Sprint | Tasks | Estimated Hours | Calendar Weeks |
|--------|-------|----------------|----------------|
| A: Security & Data Integrity | 7 tasks | ~12h | 1-2 |
| B: Infrastructure & Deployment | 6 tasks | ~14h | 3-4 |
| C: Mobile Hardening & UX | 5 tasks | ~20h | 5-6 |
| D: Security Hardening & QA | 9 tasks | ~15h | 7-8 |
| **Total to Store submission** | **27 tasks** | **~61h** | **~8 weeks** |
| E: Post-launch polish | 13 tasks | ~37h | 9+ |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Apple rejects app for accessibility | HIGH — delays launch 2+ weeks | Sprint C-1 is largest task; start early, use Accessibility Inspector |
| Prisma migration baseline fails on existing data | MEDIUM — blocks deploys | Test migration on a copy of production DB first |
| Push notification permission denial rate high | MEDIUM — low engagement | Implement in-app pre-permission dialog explaining value |
| Token rotation breaks existing sessions | HIGH — all users logged out | Implement gradual rollout: accept both old and new tokens for 7 days |
| App Store review for payment/marketplace category | MEDIUM — additional compliance | Review Apple's marketplace guidelines early; may need in-app purchase consideration |
| Supabase connection limits hit under load | MEDIUM — API errors | B-5 connection pooling is critical; monitor connections in Sentry |

---

## Success Criteria

### Alpha Gate (end of Sprint A)
- [ ] Wallet withdrawal is transactional (no race condition)
- [ ] Refresh tokens are rotated and revocable
- [ ] Prisma migrations exist and are versioned
- [ ] API responses don't leak IBAN/phone
- [ ] Swagger disabled in production

### Staging Gate (end of Sprint B)
- [ ] App deployed to `api.luggageshare.com`
- [ ] Sentry receives errors from all 3 apps
- [ ] CI/CD deploys automatically on merge to develop
- [ ] Health check verifies DB connectivity

### TestFlight Gate (end of Sprint C)
- [ ] VoiceOver reads all interactive elements
- [ ] Push notifications delivered end-to-end
- [ ] App works (read-only) when offline
- [ ] Error boundaries catch and report crashes

### Store Submission Gate (end of Sprint D)
- [ ] All security HIGH items resolved
- [ ] API test coverage >60% for critical modules
- [ ] Privacy policy and ToS accessible via web
- [ ] Production EAS build succeeds
- [ ] Internal testing feedback addressed

---

*Generated from PRODUCTION_READINESS_AUDIT.md — 2026-02-28*
