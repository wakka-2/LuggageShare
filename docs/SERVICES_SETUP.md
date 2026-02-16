# External Services Setup Guide

All third-party services required by LuggageShare, their current implementation status, and setup instructions.

> **Quick Reference**: See `.env.example` at project root for all environment variables.

---

## Status Overview

| Service | Purpose | Status | Required For |
|---------|---------|--------|-------------|
| **PostgreSQL** | Database | Running (local) | API startup |
| **Supabase** | Production DB hosting | Not connected | Production deploy |
| **Google OAuth** | User authentication | Implemented | User sign-in |
| **Apple Sign-In** | User authentication | Partial (insecure) | iOS sign-in |
| **Cloudflare R2** | File/image storage | Not started | Photo uploads |
| **Expo Push** | Push notifications | Partial | Mobile notifications |
| **Resend** | Transactional email | Not started | Email notifications |
| **Upstash Redis** | Caching/sessions | Not started | Performance/sessions |
| **Sentry** | Error monitoring | Not started | Production monitoring |
| **Vercel** | Web frontend hosting | Not configured | Web deploy |
| **Railway** | API hosting | Not configured | API deploy |

---

## 1. PostgreSQL (Local Development)

**Status**: Running locally via Homebrew

Already set up. See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for full details.

```bash
# Verify it's running
brew services list | grep postgresql

# Connection string (in apps/api/.env)
DATABASE_URL="postgresql://aiman@localhost:5432/luggageshare"
```

**Env vars**: `DATABASE_URL`

---

## 2. Supabase (Production Database)

**Status**: Package installed (`@supabase/supabase-js` in `apps/api/package.json`) but not connected. Currently using Prisma directly against local PostgreSQL.

**Purpose**: Managed PostgreSQL hosting for production. Provides connection pooling, backups, and a dashboard.

### Setup Steps

1. Create a project at [supabase.com](https://supabase.com)
2. Choose region: **Bahrain (me-south-1)** for Saudi users
3. Save the database password securely
4. Go to **Settings > Database** and copy the connection string

### Environment Variables

```bash
# Production DATABASE_URL (replace with your Supabase values)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Optional: Direct Supabase client access (not currently used in code)
SUPABASE_URL="https://[PROJECT].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### After Setup

```bash
# Run migrations against Supabase
cd apps/api
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres" npx prisma migrate deploy
```

### Cost

- **Free tier**: 500MB database, 2 projects
- **Pro ($25/mo)**: 8GB database, daily backups, no pause after inactivity

### Note

The `@supabase/supabase-js` package is installed but the codebase uses Prisma ORM exclusively for database access. The Supabase client SDK is not imported anywhere. You can either:
- Keep the package for future Supabase features (Auth, Storage, Realtime)
- Remove it if you only need Supabase as a PostgreSQL host: `cd apps/api && npm uninstall @supabase/supabase-js`

---

## 3. Google OAuth

**Status**: Implemented in [auth.service.ts](../apps/api/src/modules/auth/auth.service.ts)

**How it works**: Frontend sends Google `idToken` -> API verifies via `https://oauth2.googleapis.com/tokeninfo` -> finds or creates user.

### Setup Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use existing)
3. Enable **Google Identity Services**
4. Go to **APIs & Services > Credentials**
5. Create **OAuth 2.0 Client IDs**:
   - **Web application**: For the Next.js frontend
     - Authorized JavaScript origins: `http://localhost:3000`, `https://yourdomain.com`
     - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - **iOS**: For the mobile app
     - Bundle ID: `com.luggageshare.app`
   - **Android**: For the mobile app
     - Package name: `com.luggageshare.app`
     - SHA-1 signing certificate fingerprint (from `keytool`)
6. Configure **OAuth consent screen**:
   - App name: LuggageShare
   - Scopes: `email`, `profile`, `openid`

### Environment Variables

```bash
GOOGLE_CLIENT_ID="123456789.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
```

### Cost

Free.

---

## 4. Apple Sign-In

**Status**: Partially implemented in [auth.service.ts](../apps/api/src/modules/auth/auth.service.ts)

**Current issue**: The API decodes the Apple identity token using `jwtService.decode()` which does **not** verify the signature. Production must verify against Apple's public keys (`https://appleid.apple.com/auth/keys`).

### Setup Steps

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. **Requires**: Apple Developer Program ($99/year)
3. Register an **App ID** with "Sign In with Apple" capability
4. Create a **Services ID** for web authentication
5. Create a **Key** with "Sign In with Apple" enabled
6. Download the `.p8` key file

### Environment Variables

```bash
APPLE_CLIENT_ID="com.luggageshare.app"
APPLE_TEAM_ID="XXXXXXXXXX"
APPLE_KEY_ID="XXXXXXXXXX"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Before Production

The `appleAuth()` method in `auth.service.ts` needs to be updated to:
1. Fetch Apple's public keys from `https://appleid.apple.com/auth/keys`
2. Verify the JWT signature using the matching key (by `kid` header)
3. Validate `iss`, `aud`, and `exp` claims

### Cost

- Apple Developer Program: **$99/year**

---

## 5. Cloudflare R2 (File Storage)

**Status**: Not started. No upload endpoints exist in the API.

**Purpose**: Store user avatars, item photos, payment proof screenshots, KYC documents.

### Setup Steps

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage**
3. Create a bucket named `luggageshare`
4. Create an **API Token** with R2 read/write permissions
5. Optionally connect a custom domain for the public URL (`cdn.luggageshare.com`)

### Environment Variables

```bash
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="luggageshare"
R2_PUBLIC_URL="https://cdn.luggageshare.com"
```

### What Needs Building

- Upload module/service in the API (`modules/uploads/`)
- Signed URL generation for direct client uploads
- Image resizing/optimization (consider Cloudflare Image Transformations)
- Integration with:
  - `Item.imageUrls` (item photos)
  - `User.avatarUrl` (profile pictures)
  - `BalanceHistory.paymentProofUrl` (payment screenshots)

### Cost

- **Free tier**: 10GB storage, 10M reads/month, 1M writes/month
- Egress: Always free (unlike AWS S3)

---

## 6. Expo Push Notifications

**Status**: Partially implemented in [notifications.service.ts](../apps/api/src/modules/notifications/notifications.service.ts)

**What works**:
- `registerToken()`: Saves device push tokens to database
- `sendPushNotification()`: Sends via Expo's push API (`https://exp.host/--/api/v2/push/send`)
- Notification CRUD: get, mark as read, mark all as read

**What's missing**: `sendPushNotification()` is not called from any business event (booking created, message received, etc.).

### Setup Steps

1. Go to [expo.dev](https://expo.dev) and create an account
2. Create a project for LuggageShare
3. Generate an access token at **Account Settings > Access Tokens**

### Environment Variables

```bash
EXPO_ACCESS_TOKEN="your-expo-access-token"
```

### What Needs Building

Wire `sendPushNotification()` into business events:
- New message received
- Booking request created/accepted/rejected
- Booking status changes (picked up, delivered)
- Review received

Example integration point in `bookings.service.ts`:
```typescript
// After creating a booking:
await this.notificationsService.sendPushNotification(
  listing.carrierId,
  'New Booking Request',
  `${sender.name} wants to send a package on your trip`,
  { type: 'booking', bookingId: booking.id }
);
```

### Cost

Free (Expo push service is free for all tiers).

---

## 7. Resend (Transactional Email)

**Status**: Not started. No email service exists in the codebase.

**Purpose**: Send transactional emails (booking confirmations, receipts, account notifications).

### Setup Steps

1. Go to [resend.com](https://resend.com) and create an account
2. Add and verify your domain (add DNS records)
3. Generate an API key

### Environment Variables

```bash
RESEND_API_KEY="re_your-resend-api-key"
EMAIL_FROM="LuggageShare <noreply@luggageshare.com>"
```

### What Needs Building

- Email service module (`modules/email/`)
- Email templates (booking confirmation, welcome, receipt)
- Integration with business events

### Cost

- **Free tier**: 3,000 emails/month, 1 domain
- **Pro ($20/mo)**: 50,000 emails/month

---

## 8. Upstash Redis

**Status**: Package installed (`ioredis` in `apps/api/package.json`) but not imported or used anywhere in the codebase.

**Purpose**: Caching, rate limiting state, session storage, real-time presence.

### Setup Steps

1. Go to [upstash.com](https://upstash.com) and create an account
2. Create a **Redis** database
3. Choose region: closest to your API server
4. Copy the connection URL

### Environment Variables

```bash
REDIS_URL="redis://default:xxx@xxx.upstash.io:6379"
```

### What Needs Building

- Redis module/service in the API
- Integration with ThrottlerModule (currently using in-memory)
- Optional: Cache frequently accessed data (listings search results)

### Note

The `ioredis` package is installed but unused. You can either:
- Keep it for when you implement Redis caching
- Remove it until needed: `cd apps/api && npm uninstall ioredis`

### Cost

- **Free tier**: 10,000 commands/day
- **Pay-as-you-go**: $0.2 per 100K commands

---

## 9. Sentry (Error Monitoring)

**Status**: Not started. No error monitoring configured.

**Purpose**: Track errors, performance issues, and crashes in production.

### Setup Steps

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create projects for:
   - `luggageshare-api` (Node.js / NestJS)
   - `luggageshare-web` (Next.js)
   - `luggageshare-mobile` (React Native / Expo)
3. Install SDKs and configure DSN

### Environment Variables

```bash
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_AUTH_TOKEN="sntrys_xxx"  # For source maps
```

### What Needs Building

- Install `@sentry/nestjs` for API
- Install `@sentry/nextjs` for web
- Install `@sentry/react-native` for mobile
- Configure source map uploads in CI/CD

### Cost

- **Free tier (Developer)**: 5,000 errors/month
- **Team ($26/mo)**: 50,000 errors/month

---

## 10. Vercel (Web Hosting)

**Status**: Not configured. No `vercel.json` or deployment config.

**Purpose**: Host the Next.js web frontend.

### Setup Steps

1. Go to [vercel.com](https://vercel.com) and connect your GitHub repo
2. Set the root directory to `apps/web`
3. Set framework preset to **Next.js**
4. Add environment variables in Vercel dashboard

### Environment Variables (Vercel Dashboard)

```bash
NEXT_PUBLIC_API_URL="https://api.luggageshare.com"
NEXT_PUBLIC_APP_URL="https://luggageshare.com"
```

### Cost

- **Free tier (Hobby)**: 100GB bandwidth, serverless functions
- **Pro ($20/mo)**: Team features, more bandwidth

---

## 11. Railway (API Hosting)

**Status**: Not configured. No deployment config.

**Purpose**: Host the NestJS API backend.

### Setup Steps

1. Go to [railway.app](https://railway.app) and connect your GitHub repo
2. Create a new service from `apps/api`
3. Set build command: `npm run build`
4. Set start command: `npm run start:prod`
5. Add environment variables in Railway dashboard

### Environment Variables (Railway Dashboard)

All variables from `apps/api/.env` plus production values for:
- `DATABASE_URL` (Supabase connection string)
- `NODE_ENV=production`
- `CORS_ORIGINS` (your Vercel domain)

### Cost

- **Free tier ($5 credit/mo)**: 512MB RAM, shared CPU
- **Pro ($5/mo + usage)**: 8GB RAM, dedicated CPU

---

## Complete .env Template

All environment variables in one place. Copy to `apps/api/.env` for local development:

```bash
# Database
DATABASE_URL="postgresql://aiman@localhost:5432/luggageshare"

# Auth
JWT_SECRET="local-dev-jwt-secret-key-min-32-chars-long"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Apple Sign-In (production only)
# APPLE_CLIENT_ID="com.luggageshare.app"
# APPLE_TEAM_ID=""
# APPLE_KEY_ID=""
# APPLE_PRIVATE_KEY=""

# Cloudflare R2 (not yet implemented)
# R2_ACCOUNT_ID=""
# R2_ACCESS_KEY_ID=""
# R2_SECRET_ACCESS_KEY=""
# R2_BUCKET_NAME="luggageshare"
# R2_PUBLIC_URL=""

# Expo Push
# EXPO_ACCESS_TOKEN=""

# Resend Email (not yet implemented)
# RESEND_API_KEY=""
# EMAIL_FROM="LuggageShare <noreply@luggageshare.com>"

# Redis (not yet implemented)
# REDIS_URL=""

# Sentry (not yet implemented)
# SENTRY_DSN=""

# API Config
API_PORT=3001
API_URL="http://localhost:3001"
CORS_ORIGINS="http://localhost:3000,http://localhost:8081"
NODE_ENV="development"
```

---

## Priority Order for Implementation

Based on what the application needs to function end-to-end:

| Priority | Service | Why |
|----------|---------|-----|
| 1 | **Google OAuth** (real credentials) | Users can't sign in without it |
| 2 | **Cloudflare R2** | Item photos and avatars are core UX |
| 3 | **Expo Push** (wire events) | Users need booking/message notifications |
| 4 | **Apple Sign-In** (fix verification) | Required for iOS App Store |
| 5 | **Supabase** | Production database hosting |
| 6 | **Vercel + Railway** | Production deployment |
| 7 | **Resend** | Email confirmations |
| 8 | **Sentry** | Error tracking in production |
| 9 | **Upstash Redis** | Performance optimization |

---

## Unused Packages

These npm packages are installed but not imported anywhere:

| Package | Location | Action |
|---------|----------|--------|
| `@supabase/supabase-js` | `apps/api` | Keep (needed when connecting to Supabase) or remove if using Prisma only |
| `ioredis` | `apps/api` | Keep (needed when implementing Redis) or remove until needed |

To clean up unused packages:
```bash
cd apps/api
npm uninstall @supabase/supabase-js ioredis
```

---

*Last updated: February 2026*
