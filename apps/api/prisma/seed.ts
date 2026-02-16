import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: 'ahmed@example.com' },
    update: {},
    create: {
      email: 'ahmed@example.com',
      name: 'أحمد الراشد',
      phone: '+966501234567',
      bio: 'مسافر دائم بين الرياض والقاهرة. أحب مساعدة الآخرين في نقل أغراضهم.',
      city: 'الرياض',
      isVerified: true,
      provider: 'google',
      googleId: 'google-ahmed-123',
      settings: {
        create: {
          language: 'ar',
          currency: 'SAR',
          notifications: true,
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sara@example.com' },
    update: {},
    create: {
      email: 'sara@example.com',
      name: 'سارة المحمد',
      phone: '+966509876543',
      bio: 'أعمل في مجال التقنية، أسافر كثيراً لحضور المؤتمرات.',
      city: 'جدة',
      isVerified: true,
      provider: 'google',
      googleId: 'google-sara-456',
      settings: {
        create: {
          language: 'ar',
          currency: 'SAR',
          notifications: true,
        },
      },
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'khalid@example.com' },
    update: {},
    create: {
      email: 'khalid@example.com',
      name: 'خالد العتيبي',
      phone: '+966505551234',
      bio: 'طالب ماجستير في لندن، أسافر بشكل دوري للسعودية.',
      city: 'لندن',
      isVerified: false,
      provider: 'apple',
      appleId: 'apple-khalid-789',
      settings: {
        create: {
          language: 'ar',
          currency: 'SAR',
          notifications: true,
        },
      },
    },
  });

  console.log(`Created users: ${user1.name}, ${user2.name}, ${user3.name}`);

  // Create listings
  const listing1 = await prisma.listing.create({
    data: {
      carrierId: user1.id,
      type: 'offer',
      title: 'مساحة أمتعة متوفرة - الرياض إلى القاهرة',
      titleAr: 'مساحة أمتعة متوفرة - الرياض إلى القاهرة',
      description: 'لدي 15 كجم مساحة إضافية. أقبل ملابس وإلكترونيات وهدايا.',
      descriptionAr: 'لدي 15 كجم مساحة إضافية. أقبل ملابس وإلكترونيات وهدايا.',
      departureCity: 'الرياض',
      departureCode: 'RUH',
      arrivalCity: 'القاهرة',
      arrivalCode: 'CAI',
      departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      flightNumber: 'SV317',
      availableWeight: 15,
      priceSmall: 80,
      priceMedium: 150,
      priceLarge: 250,
      negotiable: true,
      restrictions: {
        allowed: ['electronics', 'clothes', 'gifts', 'documents'],
        notAllowed: ['liquids', 'food'],
      },
      handoffOptions: [
        { type: 'airport_dropoff', location: 'مطار الملك خالد - صالة 1', locationAr: 'مطار الملك خالد - صالة 1' },
        { type: 'mall_meetup', location: 'الرياض بارك', locationAr: 'الرياض بارك' },
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      carrierId: user2.id,
      type: 'offer',
      title: 'رحلة جدة - دبي مع مساحة أمتعة',
      titleAr: 'رحلة جدة - دبي مع مساحة أمتعة',
      description: 'متوجهة لدبي لحضور مؤتمر تقني، لدي 10 كجم متاحة.',
      descriptionAr: 'متوجهة لدبي لحضور مؤتمر تقني، لدي 10 كجم متاحة.',
      departureCity: 'جدة',
      departureCode: 'JED',
      arrivalCity: 'دبي',
      arrivalCode: 'DXB',
      departureDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      availableWeight: 10,
      priceSmall: 60,
      priceMedium: 120,
      priceLarge: 200,
      negotiable: false,
      restrictions: {
        allowed: ['electronics', 'documents', 'accessories'],
        notAllowed: ['liquids', 'food', 'fragile'],
      },
      handoffOptions: [
        { type: 'airport_dropoff', location: 'مطار الملك عبدالعزيز', locationAr: 'مطار الملك عبدالعزيز' },
      ],
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      carrierId: user3.id,
      type: 'request',
      title: 'أحتاج توصيل أغراض من الرياض إلى لندن',
      titleAr: 'أحتاج توصيل أغراض من الرياض إلى لندن',
      description: 'أحتاج شخص يوصل ملابس وكتب من الرياض إلى لندن.',
      descriptionAr: 'أحتاج شخص يوصل ملابس وكتب من الرياض إلى لندن.',
      departureCity: 'الرياض',
      departureCode: 'RUH',
      arrivalCity: 'لندن',
      arrivalCode: 'LHR',
      departureDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      availableWeight: 0,
      neededWeight: 8,
      priceSmall: 100,
      priceMedium: 180,
      priceLarge: 300,
      negotiable: true,
      restrictions: {
        allowed: ['clothes', 'documents'],
        notAllowed: [],
      },
      handoffOptions: [
        { type: 'home_pickup', location: 'حي العليا، الرياض', locationAr: 'حي العليا، الرياض' },
      ],
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`Created listings: ${listing1.title}, ${listing2.title}, ${listing3.title}`);

  // Create a booking
  const booking1 = await prisma.booking.create({
    data: {
      bookingRef: 'LS-A1B2C3',
      listingId: listing1.id,
      senderId: user2.id,
      carrierId: user1.id,
      status: 'accepted',
      packageSize: 'medium',
      totalWeight: 7,
      totalPrice: 150,
      items: {
        create: [
          {
            name: 'ملابس شتوية',
            description: 'جاكيت وبنطلونات',
            weight: 4,
            value: 500,
          },
          {
            name: 'هدايا',
            description: 'هدايا للعائلة',
            weight: 3,
            value: 300,
          },
        ],
      },
    },
  });

  console.log(`Created booking: ${booking1.bookingRef}`);

  // Create a conversation for the booking
  const conversation1 = await prisma.conversation.create({
    data: {
      listingId: listing1.id,
      bookingId: booking1.id,
      participant1Id: user1.id,
      participant2Id: user2.id,
      lastMessageAt: new Date(),
      messages: {
        create: [
          {
            senderId: user2.id,
            content: 'مرحباً أحمد، أرغب بإرسال أغراض معك للقاهرة. هل المساحة لا تزال متوفرة؟',
          },
          {
            senderId: user1.id,
            content: 'أهلاً سارة! نعم المساحة متوفرة. كم وزن الأغراض تقريباً؟',
          },
          {
            senderId: user2.id,
            content: 'حوالي 7 كجم، ملابس وهدايا للعائلة.',
          },
          {
            senderId: user1.id,
            content: 'ممتاز، لا مشكلة أبداً. تم قبول الحجز!',
          },
        ],
      },
    },
  });

  console.log(`Created conversation with ${4} messages`);

  // Create a pre-booking conversation (no booking yet)
  await prisma.conversation.create({
    data: {
      listingId: listing3.id,
      participant1Id: user3.id,
      participant2Id: user1.id,
      lastMessageAt: new Date(),
      messages: {
        create: [
          {
            senderId: user1.id,
            content: 'مرحباً خالد، رأيت إعلانك. أنا مسافر لندن الأسبوع القادم ويمكنني مساعدتك.',
          },
          {
            senderId: user3.id,
            content: 'ممتاز! متى بالضبط رحلتك؟',
          },
        ],
      },
    },
  });

  console.log('Created pre-booking conversation');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        title: 'طلب حجز جديد',
        body: 'سارة تريد حجز 7 كجم على رحلتك من الرياض للقاهرة',
        data: { type: 'booking_request', bookingId: booking1.id },
        isRead: true,
      },
      {
        userId: user2.id,
        title: 'تم قبول حجزك',
        body: 'أحمد قبل طلب الحجز الخاص بك. تواصلا لتنسيق التسليم.',
        data: { type: 'booking_accepted', bookingId: booking1.id },
        isRead: false,
      },
      {
        userId: user3.id,
        title: 'رسالة جديدة',
        body: 'لديك رسالة جديدة من أحمد بخصوص إعلانك',
        data: { type: 'new_message', conversationId: conversation1.id },
        isRead: false,
      },
    ],
  });

  console.log('Created 3 notifications');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
