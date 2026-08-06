# LuggageShare — Production Readiness Audit

**Date:** 2026-08-06
**Scope:** Full end-to-end review of all user cycles (auth, listings/flights, offers, bookings, chat, wallet/balance, payments, reviews, disputes, notifications, uploads), traced UI → API → DB and verified against live production.
**Branch:** `feature/pwa-webpush-flexdate`

---

## Verdict

**Not yet ready for paying customers — for one reason: the money layer.** Everything else is production-grade.

- ✅ **Ready today for a controlled beta *without real money*** — auth, marketplace, chat, and infra are solid and secure.
- 🔴 **Not ready for real transactions** until the payment/earnings loop is closed (see Blockers).

---

## Live production verification

| Check | Result |
|---|---|
| `GET /health` | ✅ 200 |
| `GET /api/v1/listings` (public browse) | ✅ 200 + real data |
| `GET /api/v1/bookings` (no token) | ✅ 401 (guard blocks) |
| `GET /api/v1/wallet/balance` (no token) | ✅ 401 |
| `POST /api/v1/auth/google` (bad token) | ✅ 401 "Invalid Google token" (route + verify wired) |
| CORS preflight (web origin) | ✅ `Access-Control-Allow-Origin` echoes web domain |

API: `https://luggageshare-api.vercel.app` · Web: `https://luggageshare-iota.vercel.app`

---

## What works (verified)

| Cycle | Status | Notes |
|---|---|---|
| **Infra / deploy** | ✅ | Web + API on Vercel; realtime on Supabase; cron on Vercel Cron |
| **Auth** | ✅ | Email register/login, Google, Apple, refresh, logout. Global `JwtAuthGuard` (APP_GUARD); `@Public()` only on browse + auth |
| **Authorization** | ✅ | Every booking/offer/message/review/dispute action checks participant + role |
| **Listings → Bookings** | ✅ | Server-side price calc (never trusts client), weight validation, race-safe `$transaction`, full state machine `pending → accepted → picked_up → in_transit → delivered` + cancel |
| **Flights → Offers → Bookings** | ✅ | Accept creates booking + decrements flight weight atomically; reject/withdraw/expiry cron |
| **Chat** | ✅ | Supabase Realtime broadcast (web + mobile + server); booking + offer chat; typing; read receipts |
| **Reviews** | ✅ | Gated on `delivered`, 1 per booking, rating 1–5, profanity filter |
| **Disputes** | ⚠️ | Can file (gated on delivered, 1 per booking) — **no resolution/admin path** |
| **Notifications** | ✅ | Push wired into booking lifecycle events |
| **Uploads** | ✅ | Avatar + image via Cloudflare R2 |

---

## 🔴 Blockers (money layer)

### 1. Wallet / balance is non-functional
`BalanceHistory` is **only ever debited** (withdrawals). Nothing anywhere credits it — no code path adds balance on delivery or confirmed payment.
- **Only write:** `wallet.service.ts:62` (negative withdrawal entry).
- **Consequence:** every balance is `0`; every withdrawal fails with `"Insufficient balance"`.
- The `/wallet` page is a customer-facing feature that cannot work.

### 2. Payment loop has no destination
The sender's payment page (`apps/web/src/app/booking/[id]/payment/page.tsx`) only **uploads a proof image** — the sender is **never shown where to send the money**.
- Carrier IBAN is masked to the sender: `bookings.service.ts:171`.
- No platform account is shown either.
- The flow only works if users improvise bank details in chat.

### 3. No processor / no escrow
- Payment "confirmation" is the carrier clicking a button on an **unverified** proof image: `bookings.service.ts:318`.
- No escrow → whoever moves first (pays / delivers) can be defrauded.

### 4. Delivery not tied to payment
`markPickedUp` requires status `accepted`, **not** `paymentStatus: confirmed` (`bookings.service.ts:335`). Items can be picked up → delivered with payment never confirmed.

---

## 🟡 Important (fix around launch)

- **Two parallel marketplaces.** Both **Listings → Bookings** and **Flights → Offers → Bookings** are live and both create bookings. Confusing for users, doubles surface area. Pick one primary path (or clearly separate their purposes).
- **Disputes have no resolution tooling** — acceptable only if handled manually off-platform; no ops surface exists.
- **Identity verification is store-only** (`users.service.ts:90`) — no KYC provider. The "verified" badge implies more than it does.
- **Withdrawal payouts are manual** with no admin queue / reversal path (even once balances work).

---

## 🟢 Minor / hygiene

- **Dead code:** `generateMockBookings` in `apps/web/src/hooks/useBookings.ts` (~180 lines, never called). Confirmed it does **not** leak to customers — remove for hygiene.
- **Unused post-migration deps:** `socket.io-client` (web + mobile), `@nestjs/websockets` + `@nestjs/platform-socket.io` (api).
- **Rotate secrets** pasted in chat during setup: Supabase `sb_secret_…` key and the Postgres DB password.

---

## Recommended path to ship

Decide the money model, then execute one of:

**Option A — Real processor (recommended for a SAR marketplace).**
Integrate **Moyasar / HyperPay / Tap** (or Stripe, now in SA) with **escrow + platform fee**. Credit the ledger on captured payment; release to carrier on confirmed delivery.

**Option B — Formalize the manual model.**
1. Show the payment destination to the sender.
2. Credit `BalanceHistory` on confirmed payment.
3. Gate `markPickedUp` on `paymentStatus === 'confirmed'`.
4. Build a small admin surface for payouts + disputes.

Either path is well-scoped — the rest of the app is ready to carry it.

---

## Recent changes in this branch (context)

- Migrated web + API to **Vercel** (API serverless-wrapped via Express adapter; `vercel.json`).
- Replaced **Socket.io** realtime with **Supabase Realtime broadcast** across server, web, and mobile; removed the WebSocket gateway.
- Migrated the offer-expiry cron from `@nestjs/schedule` to **Vercel Cron** (`/api/v1/cron/offers-expiry`).
- Fixed **Google auth**: web (`NEXT_PUBLIC_GOOGLE_CLIENT_ID` env + redeploy) and mobile (`/auth/social` → `/auth/google`, response double-unwrap, config wiring).
- Added Prisma `rhel-openssl-3.0.x` binary target for the Lambda runtime.
