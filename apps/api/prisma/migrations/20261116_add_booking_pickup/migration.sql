-- Pickup meeting point chosen by the sender on the booking map. Additive only.
ALTER TABLE "bookings" ADD COLUMN "pickupAddress" TEXT;
ALTER TABLE "bookings" ADD COLUMN "pickupLat" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN "pickupLng" DOUBLE PRECISION;
