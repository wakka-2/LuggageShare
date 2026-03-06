-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "posterId" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,
    "departureCode" TEXT,
    "arrivalCity" TEXT NOT NULL,
    "arrivalCode" TEXT,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "transportType" TEXT NOT NULL DEFAULT 'flight',
    "flightNumber" TEXT,
    "availableWeight" DECIMAL(5,2) NOT NULL,
    "remainingWeight" DECIMAL(5,2) NOT NULL,
    "suggestedPrice" DECIMAL(8,2),
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "preferences" JSONB,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "posterId" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,
    "departureCode" TEXT,
    "arrivalCity" TEXT NOT NULL,
    "arrivalCode" TEXT,
    "neededByDate" TIMESTAMP(3) NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "budget" DECIMAL(8,2),
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "description" TEXT,
    "itemTypes" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "prohibitedItemsDeclared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "requestId" TEXT,
    "userId" TEXT NOT NULL,
    "offeredWeight" DECIMAL(5,2) NOT NULL,
    "offeredPrice" DECIMAL(8,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Make bookings.listingId nullable and add new columns
ALTER TABLE "bookings" ALTER COLUMN "listingId" DROP NOT NULL;
ALTER TABLE "bookings" ADD COLUMN "offerId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "tripId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "requestId" TEXT;

-- AlterTable: Make messages.bookingId nullable and add offerId
ALTER TABLE "messages" ALTER COLUMN "bookingId" DROP NOT NULL;
ALTER TABLE "messages" ADD COLUMN "offerId" TEXT;

-- CreateIndex
CREATE INDEX "trips_departureCity_arrivalCity_departureDate_idx" ON "trips"("departureCity", "arrivalCity", "departureDate");
CREATE INDEX "trips_posterId_idx" ON "trips"("posterId");
CREATE INDEX "trips_status_departureDate_idx" ON "trips"("status", "departureDate");

CREATE INDEX "requests_departureCity_arrivalCity_neededByDate_idx" ON "requests"("departureCity", "arrivalCity", "neededByDate");
CREATE INDEX "requests_posterId_idx" ON "requests"("posterId");
CREATE INDEX "requests_status_neededByDate_idx" ON "requests"("status", "neededByDate");

CREATE INDEX "offers_tripId_status_idx" ON "offers"("tripId", "status");
CREATE INDEX "offers_requestId_status_idx" ON "offers"("requestId", "status");
CREATE INDEX "offers_userId_idx" ON "offers"("userId");

CREATE UNIQUE INDEX "bookings_offerId_key" ON "bookings"("offerId");
CREATE INDEX "bookings_tripId_idx" ON "bookings"("tripId");
CREATE INDEX "bookings_requestId_idx" ON "bookings"("requestId");

CREATE INDEX "messages_offerId_createdAt_idx" ON "messages"("offerId", "createdAt");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "requests" ADD CONSTRAINT "requests_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "offers" ADD CONSTRAINT "offers_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
