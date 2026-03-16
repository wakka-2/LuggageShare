# LuggageShare Production Readiness Audit

**Date**: 2026-02-28
**Branch**: `sprint-7-8-polish-launch`
**Scope**: Full monorepo (API, Mobile, Web, Shared)

---

## Executive Verdict

### NOT READY FOR PRODUCTION — Soft-launch (closed beta) possible with targeted fixes

The app has a solid foundation — well-structured NestJS API, complete mobile screens, full bilingual i18n, real-time messaging, and a working payment flow. However, critical blockers exist across security, infrastructure, and data integrity that prevent a public launch. A closed beta with trusted users is feasible after addressing the **BLOCKING** items below.

---

## Readiness Scorecard

| Domain | Rating | Blockers | Needs Work | Ready |
|--------|--------|----------|------------|-------|
| **Security** | NOT READY | 2 critical, 8 high | 9 medium | 13 positive practices |
| **API/Backend** | MOSTLY READY | 1 (migrations) | 5 areas | 4 areas solid |
| **Mobile/Frontend** | MOSTLY READY | 3 (a11y, push, offline) | 4 areas | 5 areas solid |
| **Infrastructure** | NOT READY | 3 (DB, monitoring, domain) | 5 areas | 0 fully ready |

**Overall Score: ~55% production-ready**

---

## BLOCKING Issues (Must Fix Before Any Deployment)

### B-1. Wallet Race Condition — CRITICAL
**File**: `apps/api/src/modules/wallet/wallet.service.ts:44-68`

Balance check and withdrawal are not in a database transaction. Two concurrent withdrawals can both pass the balance check → double-spend. The balance is also computed by loading ALL history records into JS memory with `Number()` conversion (floating-point risk on financial data).

**Fix**: Wrap in `prisma.$transaction()` with serializable isolation. Use `prisma.balanceHistory.aggregate({ _sum: { amount: true } })` instead of `findMany` + JS reduce.

---

### B-2. No Refresh Token Revocation or Rotation — CRITICAL
**File**: `apps/api/src/modules/auth/auth.service.ts:93-112`

Refresh tokens are stateless JWTs with no revocation. A compromised token grants access for 7 days. Old tokens remain valid after refresh.

**Fix**: Store refresh tokens in DB, invalidate on refresh (rotation), implement token family detection.

---

### B-3. No Prisma Migrations — BLOCKING
**Path**: `apps/api/prisma/migrations/` does not exist

The project uses `db:push` which can cause data loss on schema changes. No way to roll back or forward safely. Production deployments require versioned migrations.

**Fix**: Run `prisma migrate dev --name init` to create the initial migration. Replace `db:push` with `prisma migrate deploy` in CI/CD.

---

### B-4. No Error Tracking / Monitoring — BLOCKING
No Sentry, Bugsnag, or any crash reporting in any of the 3 apps. No APM. No alerting. No centralized log aggregation. No uptime monitoring. The health endpoint only returns `{ status: 'ok' }` without checking DB/Redis connectivity.

**Fix**: Add Sentry to API + Mobile + Web. Set up @nestjs/terminus for deep health checks. Configure alerting channels.

---

### B-5. Domain / SSL / Hosting Not Configured — BLOCKING
References to `api.luggageshare.com`, `cdn.luggageshare.com` exist in code/config but no evidence of domain registration, DNS, SSL, or hosting infrastructure. EAS submit config has placeholder values (`appleId: "placeholder@email.com"`).

**Fix**: Register domain, configure DNS + SSL, set up hosting (API Docker → cloud provider, Web → Vercel, CDN → Cloudflare R2 custom domain).

---

### B-6. No Accessibility Attributes — BLOCKING (App Store)
Zero `accessibilityLabel`, `accessibilityRole`, or `accessibilityHint` props across the entire mobile codebase. Apple may reject the app for accessibility compliance. Screen reader users cannot use the app.

**Fix**: Add accessibility props to all interactive elements (buttons, inputs, cards, tabs). Priority: navigation, forms, listing cards.

---

### B-7. Push Notifications Not Wired End-to-End — BLOCKING
Backend has notification CRUD + push token storage, but the mobile app never calls `registerForPushNotificationsAsync()` from Expo. No notification listeners. Notifications are created server-side but never delivered.

**Fix**: Add Expo push notification registration on login, background/foreground notification handlers, and the Expo push sending call in the API.

---

### B-8. No Offline Support — BLOCKING
No network status detection, no offline queue, no cached data display. The app shows blank screens or errors when offline. React Query's cache provides brief offline reading but no explicit strategy.

**Fix**: Add NetInfo listener, offline banner, React Query `gcTime`/`staleTime` tuning, and optimistic writes for chat.

---

## HIGH PRIORITY (Before Beta Launch)

### H-1. Swagger Exposed in Production
**File**: `apps/api/src/main.ts:42-57`
Swagger UI at `/docs` is unconditionally enabled. Exposes full API schema.
**Fix**: Wrap in `if (process.env.NODE_ENV !== 'production')`.

### H-2. PII Leakage in API Responses
- **Booking detail** returns carrier's full IBAN, phone, bank name (`bookings.service.ts:67-103`)
- **User profile** endpoint returns full record to any authenticated user (IDOR)
- **Fix**: Create public profile DTO (id, name, avatar, rating, verified). Mask IBAN as `SA03****7519`.

### H-3. JWT_REFRESH_SECRET Falls Back to JWT_SECRET
**File**: `apps/api/src/modules/auth/auth.service.ts:95-97`
If `JWT_REFRESH_SECRET` is unset, access and refresh tokens share the same secret.
**Fix**: Make `JWT_REFRESH_SECRET` required in Joi schema. Add `type` claim to JWT payload.

### H-4. Dev Login Endpoint Risk
**File**: `apps/api/src/modules/auth/auth.controller.ts:40-45`
Only guarded by `NODE_ENV !== 'production'`. Undefined NODE_ENV = endpoint exposed.
**Fix**: Add `DEV_LOGIN_ENABLED=true` env guard. Conditionally register the module.

### H-5. No Certificate Pinning (Mobile)
No SSL pinning anywhere. MITM attacks on public WiFi can intercept all API traffic.
**Fix**: Implement certificate pinning via expo plugin or custom Axios adapter.

### H-6. CORS Falls Back to Localhost
**File**: `apps/api/src/main.ts:18-21`
Missing `CORS_ORIGINS` env → allows `http://localhost:3000`. Add to Joi schema as required in production.

### H-7. Demo Tokens in Mobile Bundle
Hardcoded `demo_apple_access_token`, `demo_apple_refresh_token` in `useAppleAuth.ts` and `useGoogleAuth.ts`. Present in release bundle even if gated by `__DEV__`.
**Fix**: Exclude from production bundle via Metro config.

### H-8. No CD Pipeline
CI runs typecheck/lint/test/build but no deployment. No EAS Build workflow, no Vercel deploy, no Docker push.
**Fix**: Add deployment workflows for each app.

### H-9. Balance Computed via Full History Scan
**File**: `apps/api/src/modules/wallet/wallet.service.ts:10-23`
`findMany` + JS reduce on all records. O(n) per balance check. Use Prisma `aggregate` or materialized balance.

### H-10. No Connection Pooling
No `?connection_limit=` in DATABASE_URL. No PgBouncer or Supabase pooler reference.

---

## MEDIUM PRIORITY (Before General Availability)

| # | Issue | Domain |
|---|-------|--------|
| M-1 | Google/Apple OAuth audience validation skipped when client ID unset | Security |
| M-2 | Auth endpoints not rate-limited independently (use global limits only) | Security |
| M-3 | `enableImplicitConversion: true` can cause type coercion edge cases | API |
| M-4 | No request body size limit configured | API |
| M-5 | Notification token registration uses inline type, no DTO validation | API |
| M-6 | User update DTO allows direct IBAN/bankName update without re-auth | Security |
| M-7 | No max withdrawal amount limit | Payment |
| M-8 | Payment proof URL accepts any domain (SSRF potential) | Security |
| M-9 | MIME type validation based on client header only, not magic bytes | Upload |
| M-10 | Web platform uses localStorage for tokens (XSS-vulnerable) | Mobile/Web |
| M-11 | SUPABASE_SERVICE_KEY optional with empty default | Config |
| M-12 | Missing tests: 0 mobile tests, 0 web tests, only 3/10+ API modules tested | Quality |
| M-13 | ESLint version mismatch across apps (v8 vs v9) | DevOps |
| M-14 | i18next major version mismatch (v24 mobile vs v23 web) | DevOps |
| M-15 | No `.dockerignore` — Docker builds copy unnecessary files | DevOps |
| M-16 | CI uses `npx prisma generate` risking Prisma 7.x breaking changes | DevOps |
| M-17 | No database backup strategy documented | DevOps |
| M-18 | Booking concurrency — no optimistic locking on weight/status | API |
| M-19 | Error boundaries missing in mobile app | Mobile |
| M-20 | No deep health check (@nestjs/terminus not installed) | API |

---

## LOW PRIORITY (Nice to Have)

| # | Issue |
|---|-------|
| L-1 | JwtAuthGuard not registered globally (default-open pattern) |
| L-2 | No per-user upload storage quota |
| L-3 | Deep link scheme not validated (no Universal Links / App Links) |
| L-4 | Socket.IO connection doesn't check token expiry |
| L-5 | Chat uses 5s polling (Socket.IO deps exist but no gateway) |
| L-6 | No docker-compose.yml for local dev orchestration |
| L-7 | README partially outdated (says "planned" for implemented features) |
| L-8 | No CHANGELOG.md |
| L-9 | Redis dependency installed but never used in application code |
| L-10 | Graceful shutdown hooks not enabled in main.ts |

---

## What's Already Working Well

### API (4 areas READY)
- **Endpoints**: All 8 modules complete with proper CRUD, filtering, pagination
- **Error handling**: Global exception filter, structured error envelopes, Pino logging
- **Middleware**: Helmet, CORS, rate limiting (3-tier), validation pipe
- **Documentation**: Swagger/OpenAPI fully configured with DTOs
- **Business logic**: Booking state machine (pending→accepted→picked_up→in_transit→delivered) with proper authorization checks

### Mobile (5 areas READY)
- **Screen completeness**: All 12+ screens functional with proper navigation
- **i18n**: Complete en/ar translations (400+ keys), RTL support, locale-aware date formatting
- **Auth flow**: Google/Apple OAuth, dev login bypass, secure token storage (native), auto-refresh
- **State management**: React Query with proper cache config, Zustand for local state
- **Web platform**: Responsive layout with sidebar nav, breadcrumbs, web-adapted components

### Security (13 positive practices)
- Helmet enabled globally
- ValidationPipe with whitelist + forbidNonWhitelisted
- 3-tier rate limiting
- Prisma prevents SQL injection
- Server-side price calculation
- Explicit field mapping in listings (prevents mass assignment)
- Path traversal prevention in uploads
- Secure token storage on native (expo-secure-store)
- Content filtering for profanity
- JWT secret min length enforcement (32 chars)
- Error response sanitization
- Apple JWKS verification with key caching
- Booking authorization checks (sender/carrier ownership)

---

## Recommended Launch Strategy

### Phase 1: Closed Alpha (1-2 weeks)
Fix blockers B-1 through B-4 (wallet transaction, token rotation, migrations, Sentry).
Deploy to staging with trusted testers. Skip domain/SSL (use staging URLs).

### Phase 2: Closed Beta (2-3 weeks)
Fix B-5 through B-8 (domain, accessibility, push notifications, offline).
Fix H-1 through H-4 (Swagger, PII masking, JWT secrets, dev login).
Deploy to production domain. TestFlight/Internal Testing track.

### Phase 3: Public Beta (2-4 weeks)
Fix H-5 through H-10 (cert pinning, CORS, demo tokens, CD, balance perf, pooling).
Address M-1 through M-10 (security medium items).
App Store / Play Store submission.

### Phase 4: General Availability
Address remaining medium and low priority items.
Implement WebSocket gateway for real-time chat.
Add comprehensive test coverage.

---

## OWASP Top 10 Coverage Summary

| # | Category | Status |
|---|----------|--------|
| A01 | Broken Access Control | PARTIAL — Auth guard not global, IDOR on profiles |
| A02 | Cryptographic Failures | NEEDS WORK — No PII encryption, shared JWT secrets possible |
| A03 | Injection | GOOD — Prisma ORM, class-validator, content filtering |
| A04 | Insecure Design | PARTIAL — Wallet race condition, no token revocation |
| A05 | Security Misconfiguration | NEEDS WORK — Swagger exposed, CORS fallback, optional secrets |
| A06 | Vulnerable Components | NOT ASSESSED — No npm audit in CI |
| A07 | Auth Failures | PARTIAL — No token rotation, dev login risk |
| A08 | Software & Data Integrity | GOOD — Explicit field mapping, server-side pricing |
| A09 | Logging & Monitoring | PARTIAL — Pino logging, but no alerting |
| A10 | SSRF | PARTIAL — Payment proof URL accepts any domain |

---

## File Quick Reference

| File | Issue |
|------|-------|
| `apps/api/src/modules/wallet/wallet.service.ts` | B-1: Race condition, B-9: Balance scan |
| `apps/api/src/modules/auth/auth.service.ts` | B-2: Token rotation, H-3: Shared secret |
| `apps/api/prisma/` | B-3: No migrations directory |
| `apps/api/src/main.ts` | H-1: Swagger, H-6: CORS, M-4: Body limit, L-10: Shutdown |
| `apps/api/src/modules/bookings/bookings.service.ts` | H-2: PII leakage |
| `apps/api/src/modules/users/users.controller.ts` | H-2: IDOR |
| `apps/api/src/modules/auth/auth.controller.ts` | H-4: Dev login |
| `apps/api/src/app.module.ts` | H-3: Joi schema, M-11: Optional secrets |
| `apps/mobile/hooks/useAppleAuth.ts` | H-7: Demo tokens |
| `apps/mobile/hooks/useGoogleAuth.ts` | H-7: Demo tokens |
| `apps/mobile/lib/storage.ts` | M-10: localStorage tokens |
| `apps/mobile/lib/socket.ts` | L-4: Token expiry |
| `apps/mobile/eas.json` | B-5: Placeholder values |
| `apps/mobile/app.json` | B-5: Placeholder project ID |
| `.github/workflows/ci.yml` | M-16: npx prisma, H-8: No CD |
| `apps/api/Dockerfile` | M-15: No .dockerignore, M-16: npx prisma |

---

*Generated by Claude Code production readiness audit — 2026-02-28*
