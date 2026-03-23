-- Performance indexes for common query patterns

-- Flight: search always filters on status + departureDate
CREATE INDEX "flights_status_departureDate_idx" ON "flights"("status", "departureDate");

-- Offer: accept/reject queries filter by flightId + status
CREATE INDEX "offers_flightId_status_idx" ON "offers"("flightId", "status");

-- Booking: flight cancel queries filter by flightId + status
CREATE INDEX "bookings_flightId_status_idx" ON "bookings"("flightId", "status");

-- Notification: unread notifications query pattern
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");

-- Review: lookup by reviewer (my reviews page)
CREATE INDEX "reviews_reviewerId_idx" ON "reviews"("reviewerId");
