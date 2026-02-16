# LuggageShare - Database Setup Guide

> **Last Updated**: February 2026
> **Database**: PostgreSQL 16
> **ORM**: Prisma 5.x
> **Target**: Local development (Homebrew) + Production (Supabase)

---

## Quick Start (Local Development)

### Prerequisites

- macOS with Homebrew
- Node.js 18+
- npm or pnpm

### 1. Install PostgreSQL

```bash
brew install postgresql@16
```

### 2. Start PostgreSQL

```bash
brew services start postgresql@16
```

Verify it's running:

```bash
/usr/local/opt/postgresql@16/bin/pg_isready
# Expected: /tmp:5432 - accepting connections
```

### 3. Create the Database

```bash
/usr/local/opt/postgresql@16/bin/createdb luggageshare
```

### 4. Configure Environment

Create `apps/api/.env` (copy from `.env.example` at project root):

```env
DATABASE_URL="postgresql://<your-username>@localhost:5432/luggageshare"
JWT_SECRET="local-dev-jwt-secret-key-min-32-chars-long"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
GOOGLE_CLIENT_ID="placeholder.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="placeholder"
API_PORT=3001
CORS_ORIGINS="http://localhost:3000,http://localhost:8081"
NODE_ENV="development"
```

Replace `<your-username>` with your macOS username (run `whoami`).

### 5. Run Migrations

```bash
cd apps/api
npx prisma migrate dev
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Start the API

```bash
npx nest start --watch
# API: http://localhost:3001
# Swagger: http://localhost:3001/docs
```

---

## Database Schema Overview

### Tables (11 total)

| Table | Description | Key Fields |
|-------|------------|------------|
| `users` | User accounts | email, name, provider, balance |
| `user_settings` | Per-user preferences | language, currency, notifications |
| `listings` | Carrier trip listings | route, tiered pricing, type |
| `bookings` | Sender booking requests | bookingRef, packageSize, status |
| `items` | Items within a booking | name, weight, value |
| `conversations` | Chat conversations | participants, listing/booking link |
| `messages` | Individual messages | content, messageType, isRead |
| `reviews` | Post-delivery reviews | rating (1-5), comment |
| `notifications` | Push notification records | title, body, isRead |
| `push_tokens` | Device push tokens | token, platform |
| `balance_history` | Financial transactions | amount, type, status |

### Entity Relationship Diagram

```
User 1──* Listing (carrier)
User 1──* Booking (sender)
User 1──* Booking (carrier)
User 1──* Conversation (participant1)
User 1──* Conversation (participant2)
User 1──* Message (sender)
User 1──1 UserSettings

Listing 1──* Booking
Listing 1──* Conversation

Booking 1──* Item
Booking 1──1 Conversation (optional)
Booking 1──1 Review (optional)

Conversation 1──* Message
```

### Pricing Model

The schema uses **tiered pricing** (not per-kg):

```
Listing:
  priceSmall   DECIMAL(8,2)  -- Up to 5 kg
  priceMedium  DECIMAL(8,2)  -- 5-10 kg
  priceLarge   DECIMAL(8,2)  -- 10-20 kg
  negotiable   BOOLEAN       -- Whether price is negotiable
```

Carriers set three fixed prices. Senders pick a tier when booking.

### Messaging Model

Conversations are **decoupled from bookings** to support pre-booking messaging:

```
Conversation:
  listingId       -- Optional: links to a listing
  bookingId       -- Optional: links to a booking (1:1, unique)
  participant1Id  -- First participant
  participant2Id  -- Second participant
```

- Pre-booking: `listingId` set, `bookingId` null
- Booking conversation: both `listingId` and `bookingId` set
- Unique constraint: `[participant1Id, participant2Id, listingId]`

### Booking References

Bookings have a human-readable reference:

```
bookingRef: "LS-X4K7NP"  -- Format: LS-XXXXXX
```

Uses a 32-char alphabet (excludes I, O, 0, 1) for readability.

---

## Common Commands

### Prisma CLI

```bash
# Run from apps/api/

# Apply pending migrations
npx prisma migrate dev

# Create a new migration
npx prisma migrate dev --name describe-change

# Reset database (drops all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio

# Validate schema
npx prisma validate

# View migration status
npx prisma migrate status
```

### PostgreSQL CLI

```bash
# Connect to database
/usr/local/opt/postgresql@16/bin/psql -d luggageshare

# List tables
\dt

# Describe a table
\d users

# Run a query
SELECT * FROM users LIMIT 5;

# Quit
\q
```

### Service Management

```bash
# Start PostgreSQL
brew services start postgresql@16

# Stop PostgreSQL
brew services stop postgresql@16

# Restart PostgreSQL
brew services restart postgresql@16

# Check status
brew services list | grep postgresql
```

---

## Production Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose the region closest to your users (for Saudi Arabia: `eu-central-1` or `ap-southeast-1`)
3. Set a strong database password

### 2. Get Connection String

From Supabase Dashboard > Settings > Database:

```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### 3. Apply Migrations

```bash
cd apps/api
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" npx prisma migrate deploy
```

### 4. Additional Supabase Keys

```env
SUPABASE_URL="https://[PROJECT].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## Troubleshooting

### PostgreSQL won't start

```bash
# Check logs
tail -20 /usr/local/var/log/postgresql@16.log

# Check if port 5432 is in use
lsof -i :5432

# Reset data directory (WARNING: destroys data)
rm -rf /usr/local/var/postgresql@16
/usr/local/opt/postgresql@16/bin/initdb --locale=en_US.UTF-8 -E UTF-8 /usr/local/var/postgresql@16
```

### Prisma migration errors

```bash
# Reset database and re-run all migrations
npx prisma migrate reset

# If schema is out of sync
npx prisma db push --force-reset
```

### Connection refused

```bash
# Verify PostgreSQL is running
/usr/local/opt/postgresql@16/bin/pg_isready

# Verify DATABASE_URL in .env
cat apps/api/.env | grep DATABASE_URL

# Test connection
/usr/local/opt/postgresql@16/bin/psql -d luggageshare -c "SELECT 1"
```

### "relation does not exist" errors

```bash
# Run pending migrations
cd apps/api && npx prisma migrate dev

# Verify tables exist
/usr/local/opt/postgresql@16/bin/psql -d luggageshare -c "\dt"
```

---

## Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| `initial_schema` | 2026-02-16 | All 11 tables with tiered pricing, conversations, balance |

---

## File Locations

| File | Purpose |
|------|---------|
| `apps/api/prisma/schema.prisma` | Prisma schema (source of truth) |
| `apps/api/prisma/migrations/` | Migration SQL files |
| `apps/api/src/prisma/prisma.service.ts` | NestJS Prisma service |
| `apps/api/src/prisma/prisma.module.ts` | Global Prisma module |
| `apps/api/.env` | Local environment variables (gitignored) |
| `.env.example` | Template for environment setup |
