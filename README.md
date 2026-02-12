# LuggageShare

> A peer-to-peer luggage sharing marketplace connecting travelers with excess luggage space to those who need to send items

[![React Native](https://img.shields.io/badge/React%20Native-0.76-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.3-EF4444.svg)](https://turbo.build/)

## Overview

LuggageShare creates a **Haraj-style classifieds marketplace** where:

- **Carriers** post travel listings with available luggage space, pricing, and meeting preferences
- **Senders** post requests for items they need delivered to specific destinations
- Both parties connect, negotiate, and complete peer-to-peer deliveries

### Key Features

- **Dual Marketplace**: Carriers can offer space, Senders can request deliveries
- **Flexible Pricing**: Tiered pricing (small/medium/large) with negotiable options
- **Smart Filtering**: Search by route, date, and listing type
- **Multiple Handoff Options**: Home pickup, mall meetup, airport drop-off
- **Bilingual Support**: Full Arabic (RTL) and English localization
- **Beautiful Animations**: Smooth transitions with react-native-reanimated and Lottie

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo |
| **Mobile App** | React Native + Expo (SDK 52) |
| **Navigation** | Expo Router (file-based) |
| **State** | Zustand + React Query |
| **Styling** | StyleSheet + expo-linear-gradient |
| **Animations** | react-native-reanimated + Lottie |
| **i18n** | i18next (AR/EN) |
| **API** | NestJS (scaffolded) |
| **Web** | Next.js 14 (Phase 1 MVP) |

## Project Structure

```
LuggageShare/
├── apps/
│   ├── mobile/              # React Native + Expo app
│   │   ├── app/             # Expo Router screens
│   │   │   ├── (auth)/      # Authentication screens
│   │   │   └── (tabs)/      # Main tab navigation
│   │   ├── components/
│   │   │   ├── common/      # Reusable UI components
│   │   │   ├── home/        # Home screen components
│   │   │   └── listings/    # Marketplace listing components
│   │   ├── providers/       # Context providers (Auth, Theme)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Internationalization
│   │   └── assets/          # Images, animations
│   ├── api/                 # NestJS backend (scaffolded)
│   └── web/                 # Next.js web app (Phase 1 MVP)
├── packages/
│   └── shared/              # Shared utilities and types
└── scripts/                 # Development scripts
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.9.0
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/wakka-2/LuggageShare.git
cd LuggageShare

# Install dependencies
npm install

# Start the mobile app
npm run dev:mobile
```

### Available Scripts

```bash
# Development
npm run dev              # Start all apps
npm run dev:mobile       # Start mobile app only
npm run dev:web          # Start web app only
npm run dev:api          # Start API server only

# Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript checks
npm run test             # Run tests
npm run format           # Format code with Prettier

# Database (API)
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
```

## Mobile App Features

### Marketplace Components

| Component | Description |
|-----------|-------------|
| `ListingCard` | Haraj-style card with grid/list views, pricing tiers, user info |
| `SearchBar` | Route search with date filtering and popular routes |
| `PostTypeTabs` | Toggle between Carrier Offers and Sender Requests |
| `ViewToggle` | Switch between grid and list layouts |
| `EmptyState` | Animated empty state with Lottie animations |

### Listing Types

**Carrier Offers** (I have space):
- Available weight capacity
- Travel date and route
- Pricing tiers (small/medium/large)
- Item restrictions (allowed/not allowed)
- Handoff preferences

**Sender Requests** (I need to send):
- Required weight
- Desired delivery date
- Offered price
- Item description

### Supported Routes

The marketplace focuses on **Middle East and North Africa** routes:
- Saudi Arabia (Riyadh, Jeddah, Dammam)
- UAE (Dubai)
- Egypt (Cairo)
- Jordan (Amman)
- Bahrain (Manama)
- Turkey (Istanbul)

## Development

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Code Style

The project uses:
- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** for type safety

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `develop` | Active development |
| `phase1-web-mvp` | Web MVP (current) |
| `phase2-mobile` | Mobile app (planned) |

## Documentation

All documentation lives in the [docs/](docs/) folder.

| Document | Description | Status |
|----------|-------------|--------|
| [ROADMAP.md](docs/ROADMAP.md) | **Canonical project plan and status** | Current |
| [DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) | Original technical planning | Reference |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Aspirational database design | Reference |
| [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) | REST API endpoints | Reference |
| [UI_UX_DESIGN.md](docs/UI_UX_DESIGN.md) | Design system and patterns | Reference |
| [NOTIFICATIONS.md](docs/NOTIFICATIONS.md) | Push notification spec | Current |
| [PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md) | Privacy policy | Current |
| [TERMS_OF_SERVICE.md](docs/TERMS_OF_SERVICE.md) | Terms of service | Current |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is **UNLICENSED** - proprietary software.

---

Built with React Native, Expo, and TypeScript
