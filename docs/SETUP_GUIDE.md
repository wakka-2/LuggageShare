# LuggageShare - Step-by-Step Setup Guide

Complete guide to set up LuggageShare from zero to production, divided into phases.

> **Time estimate**: Phase 0-4 (local dev running): ~30 minutes
> **Prerequisite knowledge**: Node.js, TypeScript, basic terminal usage
> **OS**: macOS (Homebrew). Linux/Windows users adapt package manager commands.

---

## Phase Overview

| Phase | What You Get | Prerequisite | Time |
|-------|-------------|--------------|------|
| **0** | Prerequisites installed | Fresh machine | 10 min |
| **1** | Repo cloned, deps installed | Phase 0 | 5 min |
| **2** | Local database running with schema | Phase 1 | 5 min |
| **3** | API server running at localhost:3001 | Phase 2 | 3 min |
| **4** | Web app running at localhost:3000 | Phase 1 | 2 min |
| **5** | Real Google/Apple auth working | Phase 3 | 30 min |
| **6** | File uploads, push, email, caching | Phase 3 | 1-2 hr |
| **7** | Mobile app running in simulator | Phase 3 | 15 min |
| **8** | Deployed to Vercel + Railway | Phase 5-6 | 1-2 hr |
| **9** | Error tracking + CI/CD pipeline | Phase 8 | 1-2 hr |

---

## Phase 0: Prerequisites

Install the tools needed to run the project.

### 0.1 Node.js (v20+)

```bash
# Check if already installed
node --version  # must be >= 20.0.0

# Install via Homebrew (recommended)
brew install node@20

# Or install via nvm (for version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

### 0.2 npm (v10+)

Comes with Node.js. Verify:

```bash
npm --version  # must be >= 10.0.0
```

### 0.3 Git

```bash
git --version  # any recent version works

# If not installed:
brew install git
```

### 0.4 PostgreSQL 16

```bash
# Install
brew install postgresql@16

# Add to PATH (required since it's keg-only)
echo 'export PATH="/usr/local/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Start the service
brew services start postgresql@16

# Verify it's running
pg_isready  # should print "accepting connections"
```

### 0.5 Verify Everything

```bash
node --version    # >= 20.0.0
npm --version     # >= 10.0.0
git --version     # any
psql --version    # 16.x
pg_isready        # accepting connections
```

**Phase 0 complete.** You have all the tools installed.

---

## Phase 1: Repository & Dependencies

Clone the project and install all workspace dependencies.

### 1.1 Clone the Repository

```bash
cd ~/Documents/GitHub  # or your preferred directory
git clone https://github.com/YOUR_USERNAME/LuggageShare.git
cd LuggageShare
```

### 1.2 Install Dependencies

This single command installs deps for all workspaces (web, api, mobile, shared):

```bash
npm install
```

This installs:
- Root: Turborepo, Prettier, TypeScript
- `apps/web`: Next.js 14, React 18, Tailwind CSS, i18next, Zustand, React Query
- `apps/api`: NestJS 10, Prisma, Passport JWT, class-validator, Helmet
- `apps/mobile`: Expo SDK 52, React Native, expo-router
- `packages/shared`: Shared types, utils, validation

### 1.3 Generate Prisma Client

```bash
cd apps/api
npx prisma generate
cd ../..
```

### 1.4 Verify Installation

```bash
# Should list all workspaces
npm ls --depth=0 2>/dev/null | head -5

# Should show the turbo binary
npx turbo --version
```

**Phase 1 complete.** All dependencies are installed.

---

## Phase 2: Database Setup

Create the local PostgreSQL database and apply migrations.

### 2.1 Create the Database

```bash
createdb luggageshare
```

If you get "role does not exist", create it first:

```bash
psql postgres -c "CREATE ROLE $(whoami) WITH LOGIN SUPERUSER;"
createdb luggageshare
```

### 2.2 Create the API Environment File

```bash
cat > apps/api/.env << 'EOF'
# Database (Local PostgreSQL)
DATABASE_URL="postgresql://$(whoami)@localhost:5432/luggageshare"

# Authentication
JWT_SECRET="local-dev-jwt-secret-key-min-32-chars-long"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Google OAuth (placeholder - replace in Phase 5)
GOOGLE_CLIENT_ID="placeholder.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="placeholder"

# API Configuration
API_PORT=3001
API_URL="http://localhost:3001"
CORS_ORIGINS="http://localhost:3000,http://localhost:8081"
NODE_ENV="development"
EOF
```

> **Note**: Replace `$(whoami)` with your actual macOS username if the heredoc doesn't expand it.

### 2.3 Run Database Migrations

```bash
cd apps/api
npx prisma migrate dev
cd ../..
```

This creates all 11 tables:
- `users`, `user_settings` - User accounts
- `listings` - Carrier luggage space offers
- `bookings`, `items` - Booking and item tracking
- `conversations`, `messages` - Chat system
- `reviews` - Rating system
- `notifications`, `push_tokens` - Push notifications
- `balance_history` - Commission tracking

### 2.4 Verify Database

```bash
psql luggageshare -c "\dt"
```

Expected output: 12 tables (11 models + `_prisma_migrations`).

### 2.5 (Optional) Open Prisma Studio

Visual database browser:

```bash
cd apps/api && npx prisma studio
# Opens at http://localhost:5555
```

**Phase 2 complete.** Database is running with full schema.

---

## Phase 3: API Server

Start the NestJS backend.

### 3.1 Start the API

```bash
npm run dev:api
```

Or directly:

```bash
cd apps/api && npm run dev
```

### 3.2 Verify API is Running

Wait for the startup message, then check:

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 3.3 Open Swagger Docs

Open in browser: [http://localhost:3001/docs](http://localhost:3001/docs)

This shows all available API endpoints:
- `POST /api/v1/auth/google` - Google sign-in
- `POST /api/v1/auth/apple` - Apple sign-in
- `GET /api/v1/listings` - Browse listings
- `POST /api/v1/listings` - Create listing
- `GET /api/v1/bookings` - List bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/messages/conversations` - List conversations
- `GET /api/v1/notifications` - Get notifications

### 3.4 Configuration Reference

| Setting | Value | Source |
|---------|-------|--------|
| Port | 3001 | `API_PORT` env var |
| Prefix | `/api/v1` | `main.ts` |
| Swagger | `/docs` | `main.ts` |
| CORS | localhost:3000, :8081 | `CORS_ORIGINS` env var |
| Rate limiting | 3/sec, 20/10sec, 100/min | `app.module.ts` ThrottlerModule |
| Validation | Whitelist + transform | `main.ts` ValidationPipe |

**Phase 3 complete.** API server is running with all routes.

---

## Phase 4: Web Frontend

Start the Next.js web application.

### 4.1 Start the Web App

In a new terminal:

```bash
npm run dev:web
```

Or directly:

```bash
cd apps/web && npm run dev
```

### 4.2 Open in Browser

Go to: [http://localhost:3000](http://localhost:3000)

You should see the LuggageShare homepage with:
- Search section (Arabic RTL layout)
- Popular routes
- How it works section

### 4.3 Pages Available

| URL | Page |
|-----|------|
| `/` | Homepage |
| `/listings` | Browse listings |
| `/listings/[id]` | Listing detail |
| `/create-listing` | Create listing wizard (7 steps) |
| `/bookings` | My bookings |
| `/bookings/[id]` | Booking detail |
| `/bookings/create` | Create booking |
| `/messages` | Conversations list |
| `/messages/[id]` | Chat interface |
| `/profile` | My profile |
| `/profile/edit` | Edit profile |
| `/profile/settings` | Settings |
| `/profile/listings` | My listings |

> **Note**: The web app currently uses **mock data** from `apps/web/src/lib/data/`. Connecting to the real API is Milestone 5 in the roadmap.

### 4.4 Run Both Together

To run API + Web simultaneously with Turborepo:

```bash
# From project root
npm run dev
```

This starts all apps in parallel. Use `Ctrl+C` to stop all.

**Phase 4 complete.** Web app is running with mock data. Local development environment is fully operational.

---

## Phase 5: Authentication Setup

Set up real OAuth credentials so users can sign in.

### 5.1 Google OAuth

**Time**: ~15 minutes

#### 5.1.1 Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select a project** > **New Project**
3. Name: `LuggageShare`
4. Click **Create**

#### 5.1.2 Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Select **External** > **Create**
3. Fill in:
   - App name: `LuggageShare`
   - User support email: your email
   - Developer contact: your email
4. Scopes: Add `email`, `profile`, `openid`
5. Test users: Add your email
6. Click **Save and Continue** through all steps

#### 5.1.3 Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **+ Create Credentials > OAuth client ID**
3. Create **three** client IDs:

**Web Application**:
- Name: `LuggageShare Web`
- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://yourdomain.com` (add later)
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`

**iOS App** (for mobile, Phase 7):
- Name: `LuggageShare iOS`
- Bundle ID: `com.luggageshare.app`

**Android App** (for mobile, Phase 7):
- Name: `LuggageShare Android`
- Package name: `com.luggageshare.app`
- SHA-1: Run `keytool -keystore ~/.android/debug.keystore -list -v -storepass android`

#### 5.1.4 Update Environment Variables

```bash
# Edit apps/api/.env
GOOGLE_CLIENT_ID="123456789-xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
```

#### 5.1.5 Verify

Restart the API server. The `POST /api/v1/auth/google` endpoint now accepts real Google tokens.

---

### 5.2 Apple Sign-In

**Time**: ~15 minutes
**Cost**: Apple Developer Program - $99/year
**Required for**: iOS App Store submission

#### 5.2.1 Apple Developer Setup

1. Go to [developer.apple.com](https://developer.apple.com)
2. Enroll in the Apple Developer Program ($99/year)
3. Go to **Certificates, Identifiers & Profiles**

#### 5.2.2 Register App ID

1. **Identifiers** > **+** > **App IDs** > **App**
2. Description: `LuggageShare`
3. Bundle ID: `com.luggageshare.app`
4. Capabilities: Check **Sign In with Apple**
5. **Continue** > **Register**

#### 5.2.3 Create Services ID (for web)

1. **Identifiers** > **+** > **Services IDs**
2. Description: `LuggageShare Web`
3. Identifier: `com.luggageshare.web`
4. Enable **Sign In with Apple**
5. Configure:
   - Primary App ID: `com.luggageshare.app`
   - Domains: `yourdomain.com`, `localhost`
   - Return URLs: `http://localhost:3000/api/auth/callback/apple`

#### 5.2.4 Create a Key

1. **Keys** > **+**
2. Name: `LuggageShare SignIn`
3. Enable **Sign In with Apple**
4. Configure: Select Primary App ID
5. **Register** > **Download** the `.p8` file

#### 5.2.5 Update Environment Variables

```bash
# Add to apps/api/.env
APPLE_CLIENT_ID="com.luggageshare.app"
APPLE_TEAM_ID="XXXXXXXXXX"    # From Apple Developer account
APPLE_KEY_ID="XXXXXXXXXX"     # From the key you created
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGT...contents of .p8 file...\n-----END PRIVATE KEY-----"
```

#### 5.2.6 Security Note

The current `auth.service.ts` decodes Apple tokens without verifying the signature. Before production, update the `appleAuth()` method to:
1. Fetch Apple's public keys from `https://appleid.apple.com/auth/keys`
2. Verify the JWT signature using the matching `kid`
3. Validate `iss`, `aud`, and `exp` claims

See: [Apple Sign In verification docs](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user)

**Phase 5 complete.** Users can sign in with Google (and Apple on iOS).

---

## Phase 6: External Services

Set up the services needed for a fully functional app.

### 6.1 Cloudflare R2 (File Storage)

**Purpose**: User avatars, item photos, payment proof screenshots
**Cost**: Free tier (10GB storage, no egress fees)

#### Setup

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **R2 Object Storage** > **Create bucket**
3. Name: `luggageshare`
4. Location: Automatic (or EU/ME for lower latency to Saudi)
5. **R2** > **Manage R2 API Tokens** > **Create API Token**
   - Permissions: Object Read & Write
   - Bucket: `luggageshare`

#### Environment Variables

```bash
# Add to apps/api/.env
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="luggageshare"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"  # or custom domain
```

#### What Needs Building

An upload module doesn't exist yet. You'll need to create:
- `apps/api/src/modules/uploads/` - Upload controller, service, module
- Signed URL generation for direct client uploads
- Integration with `Item.imageUrls`, `User.avatarUrl`, `BalanceHistory.paymentProofUrl`

---

### 6.2 Expo Push Notifications

**Purpose**: Notify users of new messages, booking updates
**Cost**: Free

#### Setup

1. Go to [expo.dev](https://expo.dev) > Create account
2. **Account Settings** > **Access Tokens** > **Create Token**

#### Environment Variables

```bash
# Add to apps/api/.env
EXPO_ACCESS_TOKEN="your-expo-access-token"
```

#### Current State

The `sendPushNotification()` method exists in `notifications.service.ts` and calls the Expo Push API. However, it isn't called from any business event. You need to wire it into:
- `bookings.service.ts` - when a booking is created, accepted, rejected
- `messages.service.ts` - when a new message is sent
- `reviews.service.ts` - when a review is received

---

### 6.3 Resend (Transactional Email)

**Purpose**: Booking confirmations, welcome emails, receipts
**Cost**: Free tier (3,000 emails/month)

#### Setup

1. Go to [resend.com](https://resend.com) > Create account
2. **Domains** > Add your domain > Add DNS records (DKIM, SPF)
3. **API Keys** > Create key

#### Environment Variables

```bash
# Add to apps/api/.env
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="LuggageShare <noreply@luggageshare.com>"
```

#### What Needs Building

No email module exists yet. Create:
- `apps/api/src/modules/email/` - Email service using Resend SDK
- Email templates (welcome, booking confirmation, receipt)
- Integration with business events

---

### 6.4 Upstash Redis (Caching)

**Purpose**: Rate limiting state, session cache, listing cache
**Cost**: Free tier (10,000 commands/day)

#### Setup

1. Go to [upstash.com](https://upstash.com) > Create account
2. **Create Database** > Choose region closest to your API server
3. Copy the Redis URL

#### Environment Variables

```bash
# Add to apps/api/.env
REDIS_URL="redis://default:xxxxx@xxx.upstash.io:6379"
```

#### What Needs Building

The `ioredis` package is installed but not used. Create:
- Redis module/service in the API
- Integrate with ThrottlerModule (currently in-memory)
- Cache hot data (popular listings, user sessions)

---

### 6.5 Sentry (Error Monitoring)

**Purpose**: Track errors and crashes in production
**Cost**: Free tier (5,000 errors/month)

#### Setup

1. Go to [sentry.io](https://sentry.io) > Create account
2. Create projects:
   - `luggageshare-api` (Platform: Node.js)
   - `luggageshare-web` (Platform: Next.js)
   - `luggageshare-mobile` (Platform: React Native)
3. Note the DSN for each project

#### Environment Variables

```bash
# Add to apps/api/.env
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"

# Add to apps/web (Vercel dashboard or .env.local)
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
```

#### What Needs Building

Install SDKs and initialize:
- API: `npm install @sentry/nestjs` in `apps/api`
- Web: `npx @sentry/wizard@latest -i nextjs` in `apps/web`
- Mobile: `npx expo install @sentry/react-native` in `apps/mobile`

**Phase 6 complete.** All external services are configured.

---

## Phase 7: Mobile App

Set up the React Native mobile app.

### 7.1 Prerequisites

```bash
# Expo CLI (comes with npx, no global install needed)
npx expo --version

# For iOS simulator (macOS only)
# Install Xcode from the Mac App Store
# Then install command-line tools:
xcode-select --install

# For Android emulator
# Install Android Studio: https://developer.android.com/studio
# Create an AVD (Android Virtual Device) from the AVD Manager
```

### 7.2 Start the Development Server

```bash
npm run dev:mobile
```

Or directly:

```bash
cd apps/mobile && npx expo start
```

### 7.3 Run on Simulator/Device

From the Expo dev server menu:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

### 7.4 Configure API Connection

Edit `apps/mobile/lib/api.ts` to point to your API:

```typescript
// For simulator (localhost works)
const API_URL = 'http://localhost:3001/api/v1';

// For physical device (use your machine's local IP)
const API_URL = 'http://192.168.x.x:3001/api/v1';
```

### 7.5 Mobile Auth Setup

The mobile app uses Expo modules for authentication:
- `expo-auth-session` + `expo-web-browser` for Google Sign-In
- `expo-apple-authentication` for Apple Sign-In

These require the OAuth credentials from Phase 5. The Google iOS client ID and Android client ID are separate from the web client ID.

### 7.6 Current State

The mobile app is a shell with:
- Tab navigation (Home, Trips, Messages, Profile)
- Auth screen with Google/Apple sign-in buttons
- Basic UI components (Avatar, Button, Card, Input)
- Theme provider (light/dark)
- i18n setup (Arabic/English)

It is **not yet connected** to the real API.

**Phase 7 complete.** Mobile app is running in simulator.

---

## Phase 8: Production Deployment

Deploy the application to production infrastructure.

### 8.1 Supabase (Production Database)

**Cost**: Free tier → $25/mo (Pro)

#### Setup

1. Go to [supabase.com](https://supabase.com) > **New Project**
2. **Organization**: Create or select
3. **Project settings**:
   - Name: `luggageshare`
   - Database password: Generate a strong password (save it!)
   - Region: **Bahrain (me-south-1)** (closest to Saudi Arabia)
4. Wait for the project to initialize (~2 minutes)
5. Go to **Settings > Database** > **Connection string** > **URI**
6. Copy the connection string

#### Apply Migrations

```bash
cd apps/api
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres" \
  npx prisma migrate deploy
```

#### Verify

```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres" \
  npx prisma studio
```

---

### 8.2 Vercel (Web Frontend)

**Cost**: Free tier (Hobby)

#### Setup

1. Go to [vercel.com](https://vercel.com) > **Add New Project**
2. **Import Git Repository** > Select `LuggageShare`
3. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && npx turbo run build --filter=@luggageshare/web`
   - Output Directory: `.next`
4. **Environment Variables** (add in Vercel dashboard):

```
NEXT_PUBLIC_API_URL=https://api.luggageshare.com
NEXT_PUBLIC_APP_URL=https://luggageshare.com
```

5. Click **Deploy**

#### Custom Domain (Optional)

1. **Settings > Domains** > Add `luggageshare.com`
2. Configure DNS records as shown by Vercel

---

### 8.3 Railway (API Backend)

**Cost**: $5/mo + usage

#### Setup

1. Go to [railway.app](https://railway.app) > **New Project**
2. **Deploy from GitHub repo** > Select `LuggageShare`
3. **Configure Service**:
   - Root Directory: `apps/api`
   - Build Command: `npm run build`
   - Start Command: `npm run start:prod`
4. **Variables** (add in Railway dashboard):

```
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
JWT_SECRET=your-production-secret-minimum-32-characters-long
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=com.luggageshare.app
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
EXPO_ACCESS_TOKEN=your-expo-token
R2_ACCOUNT_ID=your-r2-account
R2_ACCESS_KEY_ID=your-r2-key
R2_SECRET_ACCESS_KEY=your-r2-secret
R2_BUCKET_NAME=luggageshare
R2_PUBLIC_URL=https://cdn.luggageshare.com
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=LuggageShare <noreply@luggageshare.com>
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
API_PORT=3001
CORS_ORIGINS=https://luggageshare.com,https://www.luggageshare.com
NODE_ENV=production
```

5. **Generate Domain**: Railway gives you `xxx.up.railway.app`
6. **Custom Domain**: Add `api.luggageshare.com` and configure DNS

#### Generate Production JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use the output as your `JWT_SECRET` in production.

---

### 8.4 Post-Deployment Checklist

- [ ] Supabase database created in Bahrain region
- [ ] Migrations applied to production database
- [ ] Vercel deployment successful
- [ ] Railway deployment successful
- [ ] Custom domains configured (luggageshare.com, api.luggageshare.com)
- [ ] CORS_ORIGINS updated to production domains
- [ ] Google OAuth redirect URIs updated with production domain
- [ ] Apple Sign-In domains updated with production domain
- [ ] SSL/HTTPS working on both domains
- [ ] API health check passing: `curl https://api.luggageshare.com/api/v1/health`
- [ ] Web app loads and renders correctly
- [ ] JWT_SECRET is unique to production (not the dev value)

**Phase 8 complete.** App is deployed to production.

---

## Phase 9: Monitoring & CI/CD

Set up automated pipelines and monitoring.

### 9.1 GitHub Actions CI/CD

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test-api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: luggageshare_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: cd apps/api && npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/luggageshare_test
      - run: npm run test --filter=@luggageshare/api
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/luggageshare_test
          JWT_SECRET: test-secret-key-minimum-32-characters

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
```

### 9.2 Sentry Integration

After creating Sentry projects (Phase 6.5), initialize in each app:

**API** (`apps/api/src/main.ts`):
```typescript
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Web** (run the Sentry wizard):
```bash
cd apps/web && npx @sentry/wizard@latest -i nextjs
```

### 9.3 Uptime Monitoring

Use a free uptime monitor to track API health:
- [UptimeRobot](https://uptimerobot.com) (free tier: 50 monitors)
- Monitor: `https://api.luggageshare.com/api/v1/health`
- Check interval: 5 minutes
- Alert via email when down

**Phase 9 complete.** CI/CD pipeline and monitoring are configured.

---

## Quick Reference

### Daily Development Commands

```bash
# Start everything
npm run dev

# Start individual apps
npm run dev:api        # API at localhost:3001
npm run dev:web        # Web at localhost:3000
npm run dev:mobile     # Mobile Expo server

# Database
cd apps/api
npx prisma studio     # Visual DB browser
npx prisma migrate dev # Create new migration
npx prisma generate   # Regenerate client after schema change

# Code quality
npm run lint           # Lint all workspaces
npm run typecheck      # Type-check all workspaces
npm run format         # Format all files with Prettier

# Testing
npm run test           # Run all tests
npm run test:e2e       # Run E2E tests
```

### Environment Variables Summary

| Variable | Where | Required By |
|----------|-------|-------------|
| `DATABASE_URL` | `apps/api/.env` | Phase 2 |
| `JWT_SECRET` | `apps/api/.env` | Phase 2 |
| `GOOGLE_CLIENT_ID` | `apps/api/.env` | Phase 5 |
| `GOOGLE_CLIENT_SECRET` | `apps/api/.env` | Phase 5 |
| `APPLE_CLIENT_ID` | `apps/api/.env` | Phase 5 |
| `APPLE_TEAM_ID` | `apps/api/.env` | Phase 5 |
| `APPLE_KEY_ID` | `apps/api/.env` | Phase 5 |
| `APPLE_PRIVATE_KEY` | `apps/api/.env` | Phase 5 |
| `R2_ACCOUNT_ID` | `apps/api/.env` | Phase 6 |
| `R2_ACCESS_KEY_ID` | `apps/api/.env` | Phase 6 |
| `R2_SECRET_ACCESS_KEY` | `apps/api/.env` | Phase 6 |
| `EXPO_ACCESS_TOKEN` | `apps/api/.env` | Phase 6 |
| `RESEND_API_KEY` | `apps/api/.env` | Phase 6 |
| `REDIS_URL` | `apps/api/.env` | Phase 6 |
| `SENTRY_DSN` | `apps/api/.env` | Phase 6 |
| `NEXT_PUBLIC_API_URL` | Vercel dashboard | Phase 8 |

### Port Map

| Service | Port | URL |
|---------|------|-----|
| Web (Next.js) | 3000 | http://localhost:3000 |
| API (NestJS) | 3001 | http://localhost:3001 |
| Swagger Docs | 3001 | http://localhost:3001/docs |
| Prisma Studio | 5555 | http://localhost:5555 |
| PostgreSQL | 5432 | localhost |
| Expo Dev Server | 8081 | http://localhost:8081 |

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Delete `node_modules` and `package-lock.json`, retry |
| Prisma generate fails | Check `DATABASE_URL` in `apps/api/.env` |
| PostgreSQL not running | `brew services start postgresql@16` |
| Port 3001 already in use | `lsof -ti:3001 \| xargs kill` |
| Port 3000 already in use | `lsof -ti:3000 \| xargs kill` |
| CORS errors in browser | Check `CORS_ORIGINS` includes your frontend URL |
| Prisma migration fails | Check DB exists: `psql -l \| grep luggageshare` |
| Mobile can't reach API | Use machine IP instead of localhost for physical devices |

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | Detailed PostgreSQL and Prisma guide |
| [SERVICES_SETUP.md](./SERVICES_SETUP.md) | All external services with implementation status |
| [API_SPECIFICATION.md](./API_SPECIFICATION.md) | Full REST API endpoint reference |
| [ROADMAP.md](./ROADMAP.md) | Project roadmap and milestone tracking (source of truth) |

---

*Last updated: February 2026*
