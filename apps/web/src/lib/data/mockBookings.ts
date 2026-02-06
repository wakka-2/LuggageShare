import { Booking } from '../types/booking';

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    listingId: '1',
    listingTitle: 'Trip to Dubai - 20kg Available',
    listingTitleAr: 'رحلة إلى دبي - 20 كيلو متاح',

    senderId: 'current_user',
    senderName: 'Current User',
    senderNameAr: 'المستخدم الحالي',
    carrierId: 'u1',
    carrierName: 'Ahmed Al-Rashid',
    carrierNameAr: 'أحمد الرشيد',

    from: {
      city: 'Riyadh',
      cityAr: 'الرياض',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
      code: 'RUH',
    },
    to: {
      city: 'Dubai',
      cityAr: 'دبي',
      country: 'UAE',
      countryAr: 'الإمارات',
      code: 'DXB',
    },
    travelDate: '2024-02-15T14:30:00Z',

    packageSize: 'medium',
    item: {
      category: 'electronics',
      categoryAr: 'إلكترونيات',
      description: 'Laptop and accessories for my brother',
      descriptionAr: 'لابتوب وملحقاته لأخي',
      weight: 3.5,
    },

    handoff: {
      type: 'mall_meetup',
      location: 'Riyadh Gallery Mall',
      locationAr: 'الرياض جاليري مول',
      date: '2024-02-15T10:00:00Z',
      notes: 'I will be at the main entrance',
      notesAr: 'سأكون عند المدخل الرئيسي',
    },

    senderContact: {
      name: 'Current User',
      phone: '+966501234567',
      email: 'user@example.com',
    },

    carrierContact: {
      name: 'Ahmed Al-Rashid',
      phone: '+966507654321',
      email: 'ahmed@example.com',
    },

    price: 150,
    currency: 'SAR',

    status: 'confirmed',

    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-10T10:30:00Z',
    confirmedAt: '2024-02-10T10:30:00Z',

    messages: [
      {
        id: 'm1',
        senderId: 'u1',
        senderName: 'Ahmed Al-Rashid',
        senderNameAr: 'أحمد الرشيد',
        content: 'Hi! I confirmed your booking. See you at the mall!',
        contentAr: 'مرحباً! لقد أكدت حجزك. أراك في المول!',
        timestamp: '2024-02-10T10:30:00Z',
        isRead: true,
      },
      {
        id: 'm2',
        senderId: 'current_user',
        senderName: 'Current User',
        senderNameAr: 'المستخدم الحالي',
        content: 'Great! Thank you. Looking forward to it.',
        contentAr: 'رائع! شكراً لك. متطلع للقائك.',
        timestamp: '2024-02-10T11:00:00Z',
        isRead: true,
      },
    ],
    unreadCount: 0,
  },
  {
    id: 'b2',
    listingId: '3',
    listingTitle: 'Amman Weekly Trip - Large Capacity',
    listingTitleAr: 'رحلة عمان الأسبوعية - سعة كبيرة',

    senderId: 'current_user',
    senderName: 'Current User',
    senderNameAr: 'المستخدم الحالي',
    carrierId: 'u3',
    carrierName: 'Khalid Ibrahim',
    carrierNameAr: 'خالد إبراهيم',

    from: {
      city: 'Riyadh',
      cityAr: 'الرياض',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
      code: 'RUH',
    },
    to: {
      city: 'Amman',
      cityAr: 'عمان',
      country: 'Jordan',
      countryAr: 'الأردن',
      code: 'AMM',
    },
    travelDate: '2024-02-20T19:00:00Z',

    packageSize: 'small',
    item: {
      category: 'documents',
      categoryAr: 'مستندات',
      description: 'Important family documents',
      descriptionAr: 'مستندات عائلية مهمة',
      weight: 0.5,
    },

    handoff: {
      type: 'home_pickup',
      location: 'Al Olaya District',
      locationAr: 'حي العليا',
      date: '2024-02-19T15:00:00Z',
      notes: 'Apartment 502, Building 3',
      notesAr: 'شقة 502، مبنى 3',
    },

    senderContact: {
      name: 'Current User',
      phone: '+966501234567',
      email: 'user@example.com',
    },

    price: 50,
    currency: 'SAR',

    status: 'pending',

    createdAt: '2024-02-13T14:00:00Z',
    updatedAt: '2024-02-13T14:00:00Z',

    messages: [
      {
        id: 'm3',
        senderId: 'u3',
        senderName: 'Khalid Ibrahim',
        senderNameAr: 'خالد إبراهيم',
        content: 'I received your booking request. Will confirm soon!',
        contentAr: 'استلمت طلب الحجز. سأؤكد قريباً!',
        timestamp: '2024-02-13T15:00:00Z',
        isRead: false,
      },
    ],
    unreadCount: 1,
  },
  {
    id: 'b3',
    listingId: '2',
    listingTitle: 'Cairo Trip - Documents & Small Items',
    listingTitleAr: 'رحلة القاهرة - مستندات وأغراض صغيرة',

    senderId: 'current_user',
    senderName: 'Current User',
    senderNameAr: 'المستخدم الحالي',
    carrierId: 'u2',
    carrierName: 'Fatima Mohammed',
    carrierNameAr: 'فاطمة محمد',

    from: {
      city: 'Jeddah',
      cityAr: 'جدة',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
      code: 'JED',
    },
    to: {
      city: 'Cairo',
      cityAr: 'القاهرة',
      country: 'Egypt',
      countryAr: 'مصر',
      code: 'CAI',
    },
    travelDate: '2024-01-25T09:00:00Z',

    packageSize: 'small',
    item: {
      category: 'cosmetics',
      categoryAr: 'مستحضرات تجميل',
      description: 'Beauty products for my mother',
      descriptionAr: 'مستحضرات تجميل لوالدتي',
      weight: 1.2,
    },

    handoff: {
      type: 'mall_meetup',
      location: 'Red Sea Mall',
      locationAr: 'ردسي مول',
      date: '2024-01-24T18:00:00Z',
    },

    senderContact: {
      name: 'Current User',
      phone: '+966501234567',
    },

    carrierContact: {
      name: 'Fatima Mohammed',
      phone: '+966509876543',
    },

    price: 60,
    currency: 'SAR',

    status: 'delivered',

    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-26T08:00:00Z',
    confirmedAt: '2024-01-20T12:00:00Z',
    deliveredAt: '2024-01-26T08:00:00Z',

    messages: [
      {
        id: 'm4',
        senderId: 'u2',
        senderName: 'Fatima Mohammed',
        senderNameAr: 'فاطمة محمد',
        content: 'Package delivered successfully! Have a great day.',
        contentAr: 'تم توصيل الطرد بنجاح! يوم سعيد.',
        timestamp: '2024-01-26T08:00:00Z',
        isRead: true,
      },
    ],
    unreadCount: 0,
  },
];
