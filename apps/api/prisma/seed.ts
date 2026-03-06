import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users ──────────────────────────────────────────────────
  // The dev user (logged-in via dev-login endpoint)
  const devUser = await prisma.user.upsert({
    where: { email: 'dev@luggageshare.com' },
    update: {},
    create: {
      email: 'dev@luggageshare.com',
      name: 'Dev User',
      phone: '+966501234567',
      city: 'Riyadh',
      bio: 'Testing the full LuggageShare cycle',
      isVerified: true,
      provider: 'dev',
      iban: 'SA0380000000608010167519',
      bankName: 'Al Rajhi Bank',
    },
  });

  const sara = await prisma.user.upsert({
    where: { email: 'sara@example.com' },
    update: {},
    create: {
      email: 'sara@example.com',
      name: 'Sara Al-Otaibi',
      phone: '+966509876543',
      city: 'Jeddah',
      bio: 'Frequent traveler between Jeddah and Dubai',
      isVerified: true,
      provider: 'google',
      googleId: 'google-sara-001',
      iban: 'SA4420000001234567891234',
      bankName: 'SNB',
    },
  });

  const mohammed = await prisma.user.upsert({
    where: { email: 'mohammed@example.com' },
    update: {},
    create: {
      email: 'mohammed@example.com',
      name: 'Mohammed Al-Dosari',
      phone: '+966551112222',
      city: 'Dammam',
      bio: 'Business traveler, happy to help carry items',
      isVerified: false,
      provider: 'google',
      googleId: 'google-mohammed-001',
    },
  });

  const fatima = await prisma.user.upsert({
    where: { email: 'fatima@example.com' },
    update: {},
    create: {
      email: 'fatima@example.com',
      name: 'Fatima Ahmed',
      phone: '+966507778888',
      city: 'Riyadh',
      bio: 'Monthly trips to Cairo',
      isVerified: true,
      provider: 'apple',
      appleId: 'apple-fatima-001',
      iban: 'SA6610000020012345678901',
      bankName: 'Alinma Bank',
    },
  });

  const omar = await prisma.user.upsert({
    where: { email: 'omar@example.com' },
    update: {},
    create: {
      email: 'omar@example.com',
      name: 'Omar Hassan',
      phone: '+966503334444',
      city: 'Medina',
      bio: 'Traveler and courier',
      isVerified: true,
      provider: 'google',
      googleId: 'google-omar-001',
      iban: 'SA3540000000001234567890',
      bankName: 'Riyad Bank',
    },
  });

  console.log('✅ Users created');

  // ── Listings (other users' listings the dev user can book) ──

  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  // Sara's listing — dev user can book this
  const listing1 = await prisma.listing.create({
    data: {
      carrierId: sara.id,
      departureCity: 'Jeddah',
      departureCode: 'JED',
      arrivalCity: 'Dubai',
      arrivalCode: 'DXB',
      departureDate: inDays(3),
      flightNumber: 'SV 553',
      availableWeight: 10,
      price: 80,
      currency: 'SAR',
      notes: 'Flying direct, can carry electronics and documents',
      status: 'active',
    },
  });

  // Mohammed's listing — dev user can book this
  const listing2 = await prisma.listing.create({
    data: {
      carrierId: mohammed.id,
      departureCity: 'Riyadh',
      departureCode: 'RUH',
      arrivalCity: 'Amman',
      arrivalCode: 'AMM',
      departureDate: inDays(5),
      availableWeight: 15,
      price: 50,
      currency: 'SAR',
      notes: 'Business trip, extra luggage space available',
      status: 'active',
    },
  });

  // Fatima's listing — dev user can book this
  const listing3 = await prisma.listing.create({
    data: {
      carrierId: fatima.id,
      departureCity: 'Riyadh',
      departureCode: 'RUH',
      arrivalCity: 'Cairo',
      arrivalCode: 'CAI',
      departureDate: inDays(7),
      flightNumber: 'MS 614',
      availableWeight: 8,
      price: 60,
      currency: 'SAR',
      notes: 'Monthly trip, no liquids please',
      status: 'active',
    },
  });

  // Omar's listing — dev user can book this
  const listing4 = await prisma.listing.create({
    data: {
      carrierId: omar.id,
      departureCity: 'Dammam',
      departureCode: 'DMM',
      arrivalCity: 'Manama',
      arrivalCode: 'BAH',
      departureDate: inDays(2),
      availableWeight: 20,
      price: 30,
      currency: 'SAR',
      notes: 'Driving across King Fahad Causeway, any items ok',
      status: 'active',
    },
  });

  // Dev user's OWN listings (so others book from them — carrier flow)
  const devListing1 = await prisma.listing.create({
    data: {
      carrierId: devUser.id,
      departureCity: 'Riyadh',
      departureCode: 'RUH',
      arrivalCity: 'Istanbul',
      arrivalCode: 'IST',
      departureDate: inDays(4),
      flightNumber: 'TK 143',
      availableWeight: 12,
      price: 70,
      currency: 'SAR',
      notes: 'Direct flight, can carry up to 12kg extra',
      status: 'active',
    },
  });

  const devListing2 = await prisma.listing.create({
    data: {
      carrierId: devUser.id,
      departureCity: 'Jeddah',
      departureCode: 'JED',
      arrivalCity: 'London',
      arrivalCode: 'LHR',
      departureDate: inDays(10),
      flightNumber: 'SV 115',
      availableWeight: 7,
      price: 100,
      currency: 'SAR',
      notes: 'Long-haul flight, documents and small parcels only',
      status: 'active',
    },
  });

  console.log('✅ Listings created');

  // ── Trips (Supply Side) ──────────────────────────────────────

  // Sara's flight trip — dev user can make an offer
  const trip1 = await prisma.trip.create({
    data: {
      posterId: sara.id,
      departureCity: 'Jeddah',
      departureCode: 'JED',
      arrivalCity: 'Dubai',
      arrivalCode: 'DXB',
      departureDate: inDays(3),
      transportType: 'flight',
      flightNumber: 'SV 553',
      availableWeight: 10,
      remainingWeight: 7, // 3kg already booked
      suggestedPrice: 80,
      currency: 'SAR',
      notes: 'Direct flight, can carry electronics and documents',
      status: 'active',
    },
  });

  // Mohammed's car trip — dev user can make an offer
  const trip2 = await prisma.trip.create({
    data: {
      posterId: mohammed.id,
      departureCity: 'Riyadh',
      departureCode: 'RUH',
      arrivalCity: 'Dammam',
      departureDate: inDays(2),
      transportType: 'car',
      availableWeight: 25,
      remainingWeight: 25,
      suggestedPrice: 20,
      currency: 'SAR',
      notes: 'Driving, can carry heavy items',
      status: 'active',
    },
  });

  // Fatima's flight trip — dev user can make an offer
  const trip3 = await prisma.trip.create({
    data: {
      posterId: fatima.id,
      departureCity: 'Riyadh',
      departureCode: 'RUH',
      arrivalCity: 'Cairo',
      arrivalCode: 'CAI',
      departureDate: inDays(7),
      transportType: 'flight',
      flightNumber: 'MS 614',
      availableWeight: 8,
      remainingWeight: 8,
      suggestedPrice: 60,
      currency: 'SAR',
      notes: 'Monthly trip, no liquids please',
      status: 'active',
    },
  });

  // Dev user's own trips (carrier flow — others can offer)
  const devTrip1 = await prisma.trip.create({
    data: {
      posterId: devUser.id,
      departureCity: 'Riyadh',
      departureCode: 'RUH',
      arrivalCity: 'Istanbul',
      arrivalCode: 'IST',
      departureDate: inDays(4),
      transportType: 'flight',
      flightNumber: 'TK 143',
      availableWeight: 12,
      remainingWeight: 9, // 3kg booked
      suggestedPrice: 70,
      currency: 'SAR',
      notes: 'Direct flight, can carry up to 12kg extra',
      status: 'active',
    },
  });

  // Omar's bus trip
  const trip4 = await prisma.trip.create({
    data: {
      posterId: omar.id,
      departureCity: 'Medina',
      arrivalCity: 'Mecca',
      departureDate: inDays(1),
      transportType: 'bus',
      availableWeight: 15,
      remainingWeight: 15,
      suggestedPrice: 15,
      currency: 'SAR',
      notes: 'Regular bus trip, documents and small parcels',
      status: 'active',
    },
  });

  console.log('✅ Trips created');

  // ── Requests (Demand Side) ──────────────────────────────────

  // Dev user's request — others can offer to carry
  const devRequest1 = await prisma.request.create({
    data: {
      posterId: devUser.id,
      departureCity: 'Jeddah',
      arrivalCity: 'London',
      neededByDate: inDays(14),
      weight: 5,
      budget: 250,
      currency: 'SAR',
      description: 'Winter clothing for my daughter studying in London',
      itemTypes: ['clothing'],
      prohibitedItemsDeclared: true,
      status: 'active',
    },
  });

  // Sara's request — dev user can offer to carry
  const request1 = await prisma.request.create({
    data: {
      posterId: sara.id,
      departureCity: 'Dubai',
      arrivalCity: 'Jeddah',
      neededByDate: inDays(10),
      weight: 3,
      budget: 150,
      currency: 'SAR',
      description: 'Returning electronics from Dubai',
      itemTypes: ['electronics'],
      prohibitedItemsDeclared: true,
      status: 'active',
    },
  });

  // Mohammed's request
  const request2 = await prisma.request.create({
    data: {
      posterId: mohammed.id,
      departureCity: 'Riyadh',
      arrivalCity: 'Amman',
      neededByDate: inDays(8),
      weight: 7,
      budget: 200,
      currency: 'SAR',
      description: 'Books and documents for university',
      itemTypes: ['documents', 'books'],
      prohibitedItemsDeclared: true,
      status: 'active',
    },
  });

  console.log('✅ Requests created');

  // ── Offers ──────────────────────────────────────────────────

  // Pending offer: dev user → Sara's trip (sender offering on a trip)
  const offer1 = await prisma.offer.create({
    data: {
      tripId: trip1.id,
      userId: devUser.id,
      offeredWeight: 3,
      offeredPrice: 240,
      currency: 'SAR',
      message: 'I need to send a package to Dubai, 3kg of electronics',
      status: 'pending',
    },
  });

  // Accepted offer: Sara → dev user's trip (created booking below)
  const offer2 = await prisma.offer.create({
    data: {
      tripId: devTrip1.id,
      userId: sara.id,
      offeredWeight: 3,
      offeredPrice: 210,
      currency: 'SAR',
      message: 'I have documents to send to Istanbul',
      status: 'accepted',
    },
  });

  // Pending offer: Omar → dev user's request (traveler offering on a request)
  const offer3 = await prisma.offer.create({
    data: {
      requestId: devRequest1.id,
      userId: omar.id,
      offeredWeight: 5,
      offeredPrice: 200,
      currency: 'SAR',
      message: "I'm flying to London next week, happy to carry your items",
      status: 'pending',
    },
  });

  // Pending offer: dev user → Mohammed's car trip
  const offer4 = await prisma.offer.create({
    data: {
      tripId: trip2.id,
      userId: devUser.id,
      offeredWeight: 8,
      offeredPrice: 160,
      currency: 'SAR',
      message: 'Need to send furniture parts to Dammam',
      status: 'pending',
    },
  });

  // Rejected offer: Fatima → dev user's request
  const offer5 = await prisma.offer.create({
    data: {
      requestId: devRequest1.id,
      userId: fatima.id,
      offeredWeight: 5,
      offeredPrice: 300,
      currency: 'SAR',
      message: 'I can carry this on my Cairo trip with a London connection',
      status: 'rejected',
    },
  });

  console.log('✅ Offers created');

  // ── Bookings at every status (full lifecycle demo) ──────────

  // 1. PENDING: Sara booked dev user's Istanbul listing (carrier flow — dev can accept/reject)
  const bookingPending = await prisma.booking.create({
    data: {
      listingId: devListing1.id,
      senderId: sara.id,
      carrierId: devUser.id,
      status: 'pending',
      totalWeight: 3,
      totalPrice: 210, // 3 * 70
      currency: 'SAR',
    },
  });

  // 2. ACCEPTED: Mohammed booked dev user's London listing (carrier flow — dev can mark picked up)
  const bookingAccepted = await prisma.booking.create({
    data: {
      listingId: devListing2.id,
      senderId: mohammed.id,
      carrierId: devUser.id,
      status: 'accepted',
      totalWeight: 2,
      totalPrice: 200, // 2 * 100
      currency: 'SAR',
    },
  });

  // 3. PICKED_UP: Fatima booked dev user's Istanbul listing (carrier flow — dev can mark in transit)
  const bookingPickedUp = await prisma.booking.create({
    data: {
      listingId: devListing1.id,
      senderId: fatima.id,
      carrierId: devUser.id,
      status: 'picked_up',
      totalWeight: 4,
      totalPrice: 280, // 4 * 70
      currency: 'SAR',
    },
  });

  // 4. IN_TRANSIT: Dev user booked Sara's listing (sender flow — waiting for delivery)
  const bookingInTransit = await prisma.booking.create({
    data: {
      listingId: listing1.id,
      senderId: devUser.id,
      carrierId: sara.id,
      status: 'in_transit',
      totalWeight: 5,
      totalPrice: 400, // 5 * 80
      currency: 'SAR',
      paymentStatus: 'confirmed',
    },
  });

  // 5. DELIVERED: Dev user booked Omar's listing (sender flow — can leave review)
  const bookingDelivered = await prisma.booking.create({
    data: {
      listingId: listing4.id,
      senderId: devUser.id,
      carrierId: omar.id,
      status: 'delivered',
      totalWeight: 2,
      totalPrice: 60, // 2 * 30
      currency: 'SAR',
      paymentStatus: 'confirmed',
    },
  });

  // 6. CANCELLED: Dev user booked Mohammed's listing then cancelled (history)
  const bookingCancelled = await prisma.booking.create({
    data: {
      listingId: listing2.id,
      senderId: devUser.id,
      carrierId: mohammed.id,
      status: 'cancelled',
      totalWeight: 3,
      totalPrice: 150, // 3 * 50
      currency: 'SAR',
      cancelledBy: devUser.id,
      cancelledAt: new Date(),
    },
  });

  // 7. REJECTED: Omar booked dev user's London listing, dev rejected
  const bookingRejected = await prisma.booking.create({
    data: {
      listingId: devListing2.id,
      senderId: omar.id,
      carrierId: devUser.id,
      status: 'rejected',
      totalWeight: 5,
      totalPrice: 500,
      currency: 'SAR',
    },
  });

  // 8. OFFER-BASED PENDING: Booking from accepted offer (Sara → Dev's Istanbul trip)
  const bookingOfferBased = await prisma.booking.create({
    data: {
      offerId: offer2.id,
      tripId: devTrip1.id,
      senderId: sara.id,
      carrierId: devUser.id,
      status: 'pending',
      totalWeight: 3,
      totalPrice: 210,
      currency: 'SAR',
    },
  });

  console.log('✅ Bookings created (all statuses)');

  // ── Items on some bookings ──────────────────────────────────

  await prisma.item.createMany({
    data: [
      {
        bookingId: bookingPending.id,
        name: 'iPhone 15 Pro',
        description: 'Brand new, sealed box',
        weight: 0.5,
        value: 4500,
        currency: 'SAR',
        imageUrls: ['https://picsum.photos/seed/iphone15/400/400'],
      },
      {
        bookingId: bookingPending.id,
        name: 'Documents folder',
        description: 'University admission papers',
        weight: 0.3,
        value: 0,
        currency: 'SAR',
        imageUrls: ['https://picsum.photos/seed/docs/400/400'],
      },
      {
        bookingId: bookingInTransit.id,
        name: 'Perfume set',
        description: 'Gift for family — 3 bottles of 50ml',
        weight: 2,
        value: 800,
        currency: 'SAR',
        imageUrls: [
          'https://picsum.photos/seed/perfume/400/400',
          'https://picsum.photos/seed/perfbox/400/400',
        ],
      },
      {
        bookingId: bookingDelivered.id,
        name: 'Chocolate box',
        description: 'Swiss chocolates — premium gift',
        weight: 1.5,
        value: 200,
        currency: 'SAR',
        imageUrls: ['https://picsum.photos/seed/chocolate/400/400'],
      },
    ],
  });

  console.log('✅ Items created');

  // ── Messages (chat conversations) ──────────────────────────

  // Conversation on the pending booking (Sara → Dev)
  await prisma.message.createMany({
    data: [
      {
        bookingId: bookingPending.id,
        senderId: sara.id,
        content: 'Hi! I need to send an iPhone and some documents to Istanbul. Is that okay?',
        isRead: true,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        bookingId: bookingPending.id,
        senderId: devUser.id,
        content: 'Sure, electronics are fine. Can you pack the phone in its original box?',
        isRead: true,
        createdAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
      },
      {
        bookingId: bookingPending.id,
        senderId: sara.id,
        content: "Yes, it's sealed in the original packaging. Thank you!",
        isRead: false,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
    ],
  });

  // Conversation on the in-transit booking (Dev → Sara)
  await prisma.message.createMany({
    data: [
      {
        bookingId: bookingInTransit.id,
        senderId: devUser.id,
        content: 'I have a perfume set I need delivered to Dubai. Is it allowed on your flight?',
        isRead: true,
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      },
      {
        bookingId: bookingInTransit.id,
        senderId: sara.id,
        content:
          "Perfume is fine as long as it's under 100ml per bottle for carry-on. I'll check it in.",
        isRead: true,
        createdAt: new Date(now.getTime() - 47 * 60 * 60 * 1000),
      },
      {
        bookingId: bookingInTransit.id,
        senderId: devUser.id,
        content: 'Perfect, the set has 3 bottles of 50ml each. When can we meet for handoff?',
        isRead: true,
        createdAt: new Date(now.getTime() - 46 * 60 * 60 * 1000),
      },
      {
        bookingId: bookingInTransit.id,
        senderId: sara.id,
        content: "Items picked up! I'm at the airport now, will update when I land in Dubai.",
        isRead: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Conversation on the accepted booking (Mohammed → Dev)
  await prisma.message.createMany({
    data: [
      {
        bookingId: bookingAccepted.id,
        senderId: mohammed.id,
        content: 'Salam! I need to send a small package to London. 2kg of books.',
        isRead: true,
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        bookingId: bookingAccepted.id,
        senderId: devUser.id,
        content:
          "Wa alaikum assalam! Books are perfect, no issues at all. I've accepted the booking.",
        isRead: true,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        bookingId: bookingAccepted.id,
        senderId: mohammed.id,
        content: 'Great! When should I bring them to you?',
        isRead: false,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
    ],
  });

  // Offer chat conversation (pre-booking: dev user ↔ Sara on trip1 offer)
  await prisma.message.createMany({
    data: [
      {
        offerId: offer1.id,
        senderId: devUser.id,
        content: 'Hi Sara! Can I send 3kg of electronics to Dubai on your flight?',
        isRead: true,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        offerId: offer1.id,
        senderId: sara.id,
        content: 'Sure! What kind of electronics? I need to make sure it fits in my luggage.',
        isRead: true,
        createdAt: new Date(now.getTime() - 5.5 * 60 * 60 * 1000),
      },
      {
        offerId: offer1.id,
        senderId: devUser.id,
        content: 'A laptop and some cables. Already packed in a padded bag.',
        isRead: false,
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
    ],
  });

  // Offer chat: Omar offering on dev user's request
  await prisma.message.createMany({
    data: [
      {
        offerId: offer3.id,
        senderId: omar.id,
        content: "I'm flying to London on the 18th. I can carry your winter clothes.",
        isRead: true,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        offerId: offer3.id,
        senderId: devUser.id,
        content: "That's great! The package is about 5kg of winter jackets. Is that okay?",
        isRead: true,
        createdAt: new Date(now.getTime() - 3.5 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Messages created');

  // ── Notifications ──────────────────────────────────────────

  await prisma.notification.createMany({
    data: [
      {
        userId: devUser.id,
        title: 'New Booking Request',
        body: 'Sara Al-Otaibi wants to send 3kg to Istanbul',
        data: { type: 'booking_created', bookingId: bookingPending.id },
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        userId: devUser.id,
        title: 'Booking Accepted',
        body: "Mohammed Al-Dosari's booking for London has been accepted",
        data: { type: 'booking_accepted', bookingId: bookingAccepted.id },
        isRead: true,
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        userId: devUser.id,
        title: 'Items In Transit',
        body: 'Your items to Dubai are now in transit with Sara',
        data: { type: 'booking_in_transit', bookingId: bookingInTransit.id },
        isRead: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        userId: devUser.id,
        title: 'Items Delivered!',
        body: 'Your items to Manama have been delivered by Omar. Please rate your experience.',
        data: { type: 'booking_delivered', bookingId: bookingDelivered.id },
        isRead: false,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        userId: devUser.id,
        title: 'New Message',
        body: 'Sara Al-Otaibi sent you a message',
        data: { type: 'new_message', bookingId: bookingPending.id },
        isRead: false,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
    ],
  });

  // Offer-related notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: devUser.id,
        title: 'New Offer on Your Request',
        body: 'Omar Hassan offered to carry your items to London for 200 SAR',
        data: { type: 'offer_received', offerId: offer3.id, requestId: devRequest1.id },
        isRead: false,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        userId: devUser.id,
        title: 'Offer Accepted',
        body: 'Sara accepted your offer on her Jeddah → Istanbul trip',
        data: { type: 'offer_accepted', offerId: offer2.id, tripId: devTrip1.id },
        isRead: true,
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      },
      {
        userId: sara.id,
        title: 'New Offer on Your Trip',
        body: 'Dev User wants to send 3kg to Dubai for 240 SAR',
        data: { type: 'offer_received', offerId: offer1.id, tripId: trip1.id },
        isRead: false,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Notifications created');

  // ── Balance History (wallet transactions) ──────────────────

  await prisma.balanceHistory.createMany({
    data: [
      {
        userId: devUser.id,
        amount: 60,
        type: 'commission',
        description: 'Delivery commission: Dammam → Manama',
        bookingId: bookingDelivered.id,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        userId: devUser.id,
        amount: 100,
        type: 'top_up',
        description: 'Wallet top-up via bank transfer',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Balance history created');

  // ── Summary ────────────────────────────────────────────────

  console.log("\n🎉 Seed complete! Here's what was created:\n");
  console.log(`  👤 Users: 5 (dev + sara + mohammed + fatima + omar)`);
  console.log(`  📋 Listings: 6 (legacy — 4 from others + 2 from dev user)`);
  console.log(`  ✈️  Trips: 5 (3 from others + 1 from dev + 1 bus trip)`);
  console.log(`  📬 Requests: 3 (1 from dev + 2 from others)`);
  console.log(`  🤝 Offers: 5 (2 pending on trips, 1 pending on request, 1 accepted, 1 rejected)`);
  console.log(`  📦 Bookings: 8 (7 legacy + 1 offer-based)`);
  console.log(`  📦 Items: 4 (on various bookings)`);
  console.log(`  💬 Messages: 15 (3 booking chats + 2 offer chats)`);
  console.log(`  🔔 Notifications: 8 (5 booking + 3 offer)`);
  console.log(`  💰 Balance entries: 2`);
  console.log(`\n  Login via dev-login endpoint to test as: dev@luggageshare.com`);
  console.log(`  Trip flow: browse trips → make offer → chat → accept → booking`);
  console.log(`  Request flow: post request → receive offers → chat → accept → booking`);
  console.log(
    `  Carrier bookings: pending (accept/reject), accepted (mark picked up), picked_up (mark in transit)`
  );
  console.log(
    `  Sender bookings: in_transit (waiting), delivered (leave review), cancelled (history)`
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
