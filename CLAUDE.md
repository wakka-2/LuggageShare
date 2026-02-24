# LuggageShare - Claude Code Rules

## Git Workflow (CRITICAL - NEVER VIOLATE)

### Session Start Checklist
1. **ALWAYS** run `git branch` and `git status` before ANY code changes
2. **NEVER** work directly on `develop` - it is the protected main branch
3. Create a feature branch BEFORE writing any code

### Branch Naming
```
feature/<description>     - For individual features (e.g. feature/create-listing)
sprint-<N>-<description>  - For sprint-scoped work (e.g. sprint-3-4-core-features)
fix/<description>          - For bug fixes
```

### Branch Strategy
| Branch | Purpose | Direct commits? |
|--------|---------|-----------------|
| `develop` | Main development branch | **NO - PR only** |
| `phase1-mvp` | MVP milestone snapshot | NO |
| `phase2-growth` | Growth features snapshot | NO |
| `phase3-scale` | Scale features snapshot | NO |
| `feature/*` | Feature work | YES |
| `sprint-*` | Sprint-scoped work | YES |
| `fix/*` | Bug fixes | YES |

### Commit Convention
```
feat: <description>    - New feature
fix: <description>     - Bug fix
docs: <description>    - Documentation only
refactor: <description> - Code restructuring
chore: <description>   - Build/tooling changes
```

### Workflow
1. `git checkout develop && git pull`
2. `git checkout -b feature/<name>` or `git checkout -b sprint-<N>-<name>`
3. Work + commit incrementally
4. Push branch, open PR to `develop`
5. Merge via PR only

## Project Structure

```
LuggageShare/
├── apps/
│   ├── api/          # NestJS backend (PostgreSQL via Supabase, Prisma ORM)
│   ├── mobile/       # React Native + Expo (SDK 52, Expo Router)
│   └── web/          # Next.js 14
├── packages/         # Shared packages
├── claudedocs/       # Session logs and analysis docs
└── CLAUDE.md         # THIS FILE
```

## Tech Stack Quick Reference

- **Mobile**: React Native 0.76 + Expo 52, Expo Router (file-based), React Query, Zustand, i18next, Reanimated
- **API**: NestJS, Prisma 5.x, JWT auth (Google/Apple OAuth), Swagger at /docs
- **Database**: PostgreSQL on Supabase
- **API prefix**: `/api/v1` (NestJS global prefix)
- **Monorepo**: Turborepo with npm workspaces

## Development Commands

```bash
npm run dev              # All apps
npm run dev:mobile       # Mobile only
npm run dev:api          # API only
npm run build            # Build all
npm run typecheck        # TypeScript check
npm run lint             # ESLint
```

## Sprint Plan (from DEVELOPMENT_PLAN.md)

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1-2 | Foundation (setup, schema, auth, profiles) | ~98% |
| Sprint 3-4 | Core Features (listings, bookings, messaging, notifications) | ~90% |
| Sprint 5-6 | Trust & Safety (reviews, verification, photos, disputes) | ~55% |
| Sprint 7-8 | Polish & Launch (i18n, payments, app store, beta) | ~5% |

## API Modules (8 total)

1. **Auth** - Google/Apple OAuth + JWT refresh
2. **Users** - Profile CRUD + stats
3. **Listings** - Search/CRUD with city/date/weight filters
4. **Bookings** - State machine: pending → accepted → picked_up → in_transit → delivered
5. **Messages** - Conversations + per-booking chat
6. **Notifications** - CRUD + Expo push tokens
7. **Reviews** - Per-booking ratings (1-5) + comments
8. **Wallet** - Balance (computed from history) + transactions

## Mobile Screens & Routes

| Route | Screen | Presentation |
|-------|--------|-------------|
| `(tabs)/` | Home (marketplace) | Tab |
| `(tabs)/trips` | My bookings | Tab |
| `(tabs)/messages` | Conversations | Tab |
| `(tabs)/profile` | Profile + menu | Tab |
| `listing/[id]` | Listing detail | Card |
| `listing/create` | Create listing form | Modal |
| `booking/[id]` | Booking detail + review | Card |
| `booking/create` | Create booking | Modal |
| `chat/[bookingId]` | Chat messages | Card |
| `notifications` | Notification list | Card |
| `profile/edit` | Edit profile form | Modal |
| `profile/wallet` | Wallet + transactions | Card |

## Key Conventions

- **Bilingual**: All UI text must support Arabic (ar) + English (en) with RTL
- **React Query**: All API data fetching uses React Query hooks (useListings, useBookings, etc.)
- **Prisma**: Use version 5.x only. Global npx pulls 7.x which has breaking changes - use local `node_modules/prisma`
- **Avatar component**: Accepts both named sizes (`'small'`, `'large'`) and numeric sizes (`44`, `72`)
- **Theme**: Use `ThemeColors` type from `@/providers/ThemeProvider`, never `Record<string, string>`
- **Session docs**: Save session logs to `claudedocs/SESSION_YYYY-MM-DD.md`

## Known Gotchas

- `.env` must exist in BOTH project root AND `apps/api/` for Prisma to find DATABASE_URL
- Prisma generate: Use `node ../../node_modules/prisma/build/index.js generate` from apps/api (not global npx)
- Chat uses 5s polling (no WebSocket gateway yet)
- Mock data fallback on home screen when API is unavailable
