-- CreateTable: flights
CREATE TABLE "flights" (
    "id" TEXT NOT NULL,
    "posterId" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,
    "departureCode" TEXT,
    "arrivalCity" TEXT NOT NULL,
    "arrivalCode" TEXT,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "flightNumber" TEXT,
    "availableWeight" DECIMAL(5,2) NOT NULL,
    "remainingWeight" DECIMAL(5,2) NOT NULL,
    "suggestedPrice" DECIMAL(8,2),
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable: offers
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "offeredWeight" DECIMAL(5,2) NOT NULL,
    "offeredPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- AlterTable: bookings — make listingId nullable, add offerId and flightId
ALTER TABLE "bookings" ALTER COLUMN "listingId" DROP NOT NULL;
ALTER TABLE "bookings" ADD COLUMN "offerId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "flightId" TEXT;

-- AlterTable: messages — make bookingId nullable, add offerId
ALTER TABLE "messages" ALTER COLUMN "bookingId" DROP NOT NULL;
ALTER TABLE "messages" ADD COLUMN "offerId" TEXT;

-- CreateIndex
CREATE INDEX "flights_departureCity_arrivalCity_departureDate_idx" ON "flights"("departureCity", "arrivalCity", "departureDate");
CREATE INDEX "flights_posterId_idx" ON "flights"("posterId");
CREATE INDEX "offers_flightId_idx" ON "offers"("flightId");
CREATE INDEX "offers_senderId_idx" ON "offers"("senderId");
CREATE UNIQUE INDEX "bookings_offerId_key" ON "bookings"("offerId");
CREATE INDEX "bookings_flightId_idx" ON "bookings"("flightId");
CREATE INDEX "messages_offerId_createdAt_idx" ON "messages"("offerId", "createdAt");

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_posterId_fkey"
    FOREIGN KEY ("posterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_flightId_fkey"
    FOREIGN KEY ("flightId") REFERENCES "flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_offerId_fkey"
    FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_flightId_fkey"
    FOREIGN KEY ("flightId") REFERENCES "flights"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_offerId_fkey"
    FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
