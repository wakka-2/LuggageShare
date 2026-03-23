# Database Indexes — Explained Like You're 5 (But With Real Code)

## What Is An Index?

Imagine you have a **huge book** with 10,000 pages — like a dictionary. You want to find the word "Zebra."

**Without an index (the back-of-book kind):**
You start at page 1. Read every page. Page 2. Page 3... You might find "Zebra" on page 9,847. That took 9,847 page reads. This is called a **full table scan** in database terms.

**With an index:**
You flip to the back of the book, find "Z... Ze... Zebra → page 9847." Done. Two lookups instead of 9,847.

A database index works exactly the same way. It's a **separate, sorted lookup table** that says:
> "Hey, the row you're looking for? It's over *there*."

---

## How Does It Actually Work?

Under the hood, PostgreSQL uses a data structure called a **B-tree** (balanced tree). Think of it like a family tree, but for data:

```
                    [M]
                   /   \
              [D, H]    [R, V]
             / | \      / | \
          [A-C][E-G][I-L][N-Q][S-U][W-Z]
```

To find "Riyadh" in a city column:
1. Start at root → "R" comes after "M" → go right
2. "R" matches the "R" bucket → go to [N-Q... wait, R is between R and V] → go to that leaf
3. Found it! **3 steps instead of scanning thousands of rows**

This is called **O(log n)** — even with 1 million rows, you only need ~20 steps.

---

## Your Project's Indexes — The Before & After

Let me walk through every index we added to LuggageShare, using the **actual queries** from your code.

---

### 1. `flights(status, departureDate)` — The Search Page

**The query** (from `flights.service.ts` line 35-66):
```typescript
// Every time someone opens the home page and searches for flights:
where: {
  status: 'active',              // ← always filtered
  departureDate: { gte: now() }, // ← always filtered
  // + optional: from, to, minWeight
}
orderBy: { departureDate: 'asc' }
```

**Without index:**
```
📋 flights table (10,000 rows)
┌──────┬────────────┬─────────────┬───────────┐
│  id  │   status   │ departureDate │   city   │
├──────┼────────────┼─────────────┼───────────┤
│  1   │ cancelled  │ 2026-01-15  │ Riyadh    │  ← read, skip (cancelled)
│  2   │ active     │ 2025-12-01  │ Cairo     │  ← read, skip (past date)
│  3   │ active     │ 2026-04-10  │ Jeddah    │  ← read, MATCH! ✅
│  4   │ completed  │ 2026-05-01  │ Riyadh    │  ← read, skip (completed)
│  5   │ active     │ 2026-03-25  │ Dammam    │  ← read, MATCH! ✅
│ ...  │ ...        │ ...         │ ...       │
│10000 │ active     │ 2026-06-01  │ Riyadh    │  ← read, MATCH! ✅
└──────┴────────────┴─────────────┴───────────┘

PostgreSQL reads ALL 10,000 rows to find the ~200 active future flights.
```

**With index `(status, departureDate)`:**
```
📑 Index (sorted mini-table — only status + date + pointer)
┌────────────┬─────────────┬──────────┐
│   status   │ departureDate │ row_ptr │
├────────────┼─────────────┼──────────┤
│ active     │ 2026-03-25  │ → row 5  │  ← Start here (status='active', date>=now)
│ active     │ 2026-04-10  │ → row 3  │  ← Next match
│ active     │ 2026-06-01  │ → row 10k│  ← Next match
│ cancelled  │ ...         │          │  ← STOP (status changed, done with 'active')
│ completed  │ ...         │          │
└────────────┴─────────────┴──────────┘

PostgreSQL jumps directly to "active" + "date >= today" = reads only ~200 rows.
```

**Speed improvement:** 10,000 reads → ~200 reads = **~50x faster**

---

### 2. `offers(flightId, status)` — Accept & Auto-Reject

**The query** (from `offers.service.ts` line 220-226):
```typescript
// When a poster accepts an offer, find oversized pending offers to auto-reject:
where: {
  flightId: flight.id,        // ← specific flight
  status: 'pending',          // ← only pending ones
  offeredWeight: { gt: 5 },   // ← heavier than remaining capacity
}
```

**Also used in** `flights.service.ts` line 152-154:
```typescript
// Before updating a flight, check if any offer was accepted:
where: { flightId: id, status: 'accepted' }
```

**Without index:**
Scan ALL offers in the entire database (could be 50,000+) to find the 3 pending offers on this specific flight.

**With index `(flightId, status)`:**
```
📑 Index
┌───────────┬──────────┬──────────┐
│ flightId  │  status  │ row_ptr  │
├───────────┼──────────┼──────────┤
│ flight-A  │ accepted │ → row 7  │
│ flight-A  │ pending  │ → row 2  │  ← Jump right here
│ flight-A  │ pending  │ → row 9  │  ← And here
│ flight-A  │ rejected │ → row 4  │  ← Stop (past 'pending')
│ flight-B  │ pending  │ → row 11 │  ← Different flight, stop
└───────────┴──────────┴──────────┘

Jump to flightId + status = read only 2 rows instead of 50,000.
```

**Why TWO columns?** Because the query filters on BOTH `flightId` AND `status`. A single-column index on `flightId` would find all offers for that flight (say 20), then still need to check each one's status. The compound index narrows it down immediately.

---

### 3. `bookings(flightId, status)` — Flight Cancellation

**The query** (from `flights.service.ts` line 213-219):
```typescript
// When cancelling a flight, cancel all active bookings:
where: {
  flightId: id,
  status: { in: ['pending', 'accepted', 'picked_up', 'in_transit'] },
}
```

Same logic as #2 — the compound index lets PostgreSQL jump to the exact flight AND only scan matching statuses.

---

### 4. `notifications(userId, isRead, createdAt)` — Unread Badge

**The query** (from `notifications.service.ts`):
```typescript
// Mark all unread notifications as read:
where: { userId: userId, isRead: false }

// Get notifications list:
where: { userId: userId }
orderBy: { createdAt: 'desc' }
```

**Without this index (but WITH the existing `userId, createdAt` index):**
The existing index handles the "get notifications" query fine. But for "mark all as read," PostgreSQL finds ALL notifications for the user, then filters by `isRead=false` one by one.

**With `(userId, isRead, createdAt)`:**
PostgreSQL jumps to `userId=X, isRead=false` directly — reads only unread ones. If you have 500 notifications but only 3 are unread, that's 3 reads instead of 500.

---

### 5. `reviews(reviewerId)` — My Reviews Page

**The query** (from `reviews.service.ts`):
```typescript
// "My Reviews" page — find reviews I wrote:
where: { reviewerId: userId }
```

We already had `revieweeId` indexed (reviews *about* you), but not `reviewerId` (reviews *by* you). Without this index, showing "My Reviews" requires scanning every review in the system.

---

## The Golden Rules of Indexing

### Rule 1: Indexes Speed Up Reads, Slow Down Writes

Every time you INSERT or UPDATE a row, PostgreSQL must **also update every index** on that table.

```
Without indexes:  INSERT → write 1 row                    (fast)
With 5 indexes:   INSERT → write 1 row + update 5 indexes (slower)
```

**For LuggageShare:** This trade-off is worth it because:
- Users **search** flights 100x more than they **create** flights
- The notification list is loaded on **every app open**, but notifications are created occasionally
- Reads vastly outnumber writes in a marketplace

### Rule 2: Column Order Matters (A LOT)

An index on `(status, departureDate)` is NOT the same as `(departureDate, status)`.

Think of it like a phone book:

```
📕 Phone book sorted by (LastName, FirstName):
   Adams, Alice
   Adams, Bob
   Baker, Charlie
   Baker, Diana

   ✅ "Find all Adams" → easy, they're grouped together
   ❌ "Find all Alices" → Alice Adams is on page 1, Alice Baker is on page 50...
                          You have to scan the WHOLE book
```

Same with database indexes:
```
Index on (status, departureDate):
  ✅ WHERE status = 'active'                          → uses index
  ✅ WHERE status = 'active' AND departureDate > X    → uses index perfectly
  ❌ WHERE departureDate > X                           → can't use this index!
     (departureDate is scattered across status groups)
```

**The rule:** Put the **equality filters first** (`status = 'active'`), then **range filters** (`date > X`).

### Rule 3: The "Covering Index" Superpower

Normally, PostgreSQL does this:
1. Look up the index → find the row pointer
2. Go to the actual table → read the full row

But if the index **already contains all the columns you need**, PostgreSQL can skip step 2 entirely! This is called a "covering index" or "index-only scan."

```
-- Query:
SELECT userId, createdAt FROM notifications WHERE userId = 'X' ORDER BY createdAt DESC

-- Index on (userId, createdAt):
-- The index already HAS userId and createdAt!
-- PostgreSQL never needs to touch the main table. 🚀
```

### Rule 4: Don't Over-Index

Each index:
- Takes disk space (roughly 10-30% of the table size per index)
- Slows down every INSERT/UPDATE/DELETE
- Needs to be maintained by PostgreSQL's background workers

**Bad:** Adding an index for every possible query combination
**Good:** Adding indexes for queries that run **frequently** and on **large tables**

For LuggageShare, we added 5 indexes. That's conservative and focused on the hot paths.

### Rule 5: Unique Constraints Are Free Indexes

In your Prisma schema:
```prisma
model Booking {
  offerId  String?  @unique  // ← This automatically creates an index!
}

model Dispute {
  bookingId String  @unique  // ← This too!
}
```

That's why we didn't need to add indexes for `dispute.findUnique({ where: { bookingId } })` — the `@unique` constraint already created one.

Similarly, every `@id` field has an automatic index (the primary key index).

---

## What We Added vs. What We Could Still Add

### What We Added (5 indexes) ✅

| Index | Why | Frequency |
|-------|-----|-----------|
| `flights(status, departureDate)` | Home page search | Every page load |
| `offers(flightId, status)` | Accept/reject/cancel flows | Every offer action |
| `bookings(flightId, status)` | Flight cancellation | Every cancel |
| `notifications(userId, isRead, createdAt)` | Unread badge + mark read | Every app open |
| `reviews(reviewerId)` | My Reviews page | Every profile visit |

### What We Could Still Add (for later when traffic grows) 📋

| Index | Why | When to add |
|-------|-----|-------------|
| `offers(flightId, senderId, status)` | Duplicate offer check (`findFirst`) | When offer volume is high |
| `bookings(senderId, createdAt)` | My Bookings pagination + sort | When booking count per user > 50 |
| `bookings(carrierId, createdAt)` | Same for carrier view | Same |
| `messages(bookingId, senderId, isRead)` | Unread message count per chat | When chat volume is high |
| `messages(offerId, isRead, senderId)` | Offer chat unread count | Same |
| `listings(status, departureDate)` | Listing search (legacy model) | If listings stay active |

**Why not add them now?** Because the tables are small. With < 1,000 rows, PostgreSQL can scan the whole table in < 1ms anyway. Indexes help most when tables have **10,000+ rows**. Adding them prematurely just wastes disk space and slows writes for no benefit.

---

## How to Check If Your Indexes Are Actually Being Used

Once in production, you can run this query to see if PostgreSQL is using your indexes:

```sql
-- See how PostgreSQL plans to execute a query:
EXPLAIN ANALYZE
SELECT * FROM flights
WHERE status = 'active' AND "departureDate" >= NOW()
ORDER BY "departureDate" ASC
LIMIT 20;
```

**Good output** (index is working):
```
Index Scan using flights_status_departureDate_idx on flights
  Index Cond: (status = 'active' AND "departureDate" >= '2026-03-23')
  Rows: 47  |  Time: 0.3ms ✅
```

**Bad output** (index not used):
```
Seq Scan on flights
  Filter: (status = 'active' AND "departureDate" >= '2026-03-23')
  Rows Removed by Filter: 9,800
  Rows: 47  |  Time: 12ms ❌
```

If you see "Seq Scan" on a big table, that's your cue to add or fix an index.

---

## TL;DR (The Cheat Sheet)

| Concept | One-liner |
|---------|-----------|
| **What** | A sorted lookup table that points to actual rows |
| **Why** | Turns "read every row" into "jump to the right spot" |
| **Trade-off** | Faster reads, slightly slower writes |
| **Column order** | Equality filters first, then ranges, then sorts |
| **When to add** | Frequent queries on large tables (10k+ rows) |
| **When NOT to** | Small tables, rarely-run queries, write-heavy tables |
| **Free indexes** | `@id` and `@unique` already create indexes |
| **How to verify** | `EXPLAIN ANALYZE` your query |
