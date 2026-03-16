# Changelog

All notable changes to LuggageShare will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-beta.1] - 2026-03-02

### Added

#### API
- **Auth**: Google & Apple OAuth with JWT access/refresh token rotation and family-based theft detection
- **Users**: Profile CRUD, public profile (PII-masked), verification requests, Terms of Service acceptance
- **Listings**: Full CRUD with city/date/weight search, pagination, carrier-only ownership
- **Bookings**: State machine (pending → accepted → picked_up → in_transit → delivered), payment proof submission, transactional creation with weight validation
- **Messages**: REST endpoints + WebSocket gateway (`/chat` namespace) with real-time messaging, typing indicators, profanity filtering
- **Notifications**: CRUD, Expo push token registration, push notification delivery via Expo REST API
- **Reviews**: Per-booking ratings (1-5) with one-review-per-booking enforcement
- **Wallet**: Balance calculation via aggregate, transaction history with pagination, withdrawal requests with transactional integrity
- **Disputes**: Report and track disputes per booking
- **Uploads**: Cloudflare R2 file upload with MIME whitelist, 5MB limit, and magic byte validation
- **Health**: Terminus-based health checks (`/health` + `/health/ready`) with DB ping and memory monitoring
- **Security**: Helmet headers, CORS hardening, rate limiting (ThrottlerGuard), JWT refresh secret, Swagger disabled in production, dev-login guard, PII masking (IBAN, phone)
- **Observability**: Pino structured logging, Sentry error tracking integration
- **Testing**: 10 test suites (257 tests) covering all modules + e2e integration tests

#### Mobile (React Native + Expo SDK 52)
- **Auth**: Google & Apple Sign-In with secure token storage (expo-secure-store)
- **Home**: Marketplace with search, listing cards (map + list view), post type tabs (sender/carrier)
- **Trips**: Booking management with status progression UI
- **Messages**: Real-time chat via WebSocket with typing indicators
- **Notifications**: Push notification registration, foreground handling, tap-to-navigate
- **Profile**: Edit profile, avatar upload, wallet, verification, settings, help, terms
- **Listings**: Create/view listings with image upload, date picker, weight input
- **Bookings**: Create/view bookings with payment proof upload and status tracking
- **i18n**: Full Arabic (RTL) + English localization via i18next
- **Offline**: Network status detection, offline banner, React Query offlineFirst mode
- **Accessibility**: Labels on all interactive elements (tabs, buttons, inputs, cards)
- **Error handling**: ErrorBoundary with Sentry reporting, graceful fallback UI
- **Dev tools**: Dev login bypass (behind `__DEV__` + env flag), demo user mode

#### Infrastructure
- **CI/CD**: GitHub Actions workflow (typecheck, lint, test, build) with Turbo cache
- **Docker**: Multi-stage Dockerfile for API, docker-compose for local dev (PostgreSQL + Redis)
- **Dependabot**: Automated dependency updates for npm and GitHub Actions
- **Monorepo**: Turborepo with npm workspaces (api, mobile, web, shared)

### Security
- Refresh token rotation with family-based revocation
- Magic byte file validation (prevents MIME spoofing)
- Rate limiting on auth endpoints (5/min login, 10/min refresh)
- Payment proof URL validation (must match configured CDN domain)
- Booking concurrency protection via `$transaction` with serializable isolation
- Notification token DTO validation
- CORS restricted to configured origins in production

## [Unreleased]

### Blocked (requires external setup)
- Sentry DSN configuration (code integrated, needs project creation)
- Domain & DNS setup (`api.luggageshare.com`, `cdn.luggageshare.com`)
- Supabase connection pooling (port 6543)
- Certificate pinning (needs production SSL cert)
- App Store / Play Store submission (needs Apple Developer account, EAS project ID)
- CD pipelines for API deploy, web deploy, and EAS Build
