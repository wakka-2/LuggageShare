# LuggageShare Push Notifications Specification

> **Service**: Expo Push Notifications (Free)
> **Platforms**: iOS, Android
> **Languages**: Arabic (primary), English

---

## Table of Contents

1. [Implementation Overview](#1-implementation-overview)
2. [Notification Types](#2-notification-types)
3. [Notification Templates](#3-notification-templates)
4. [Trigger Conditions](#4-trigger-conditions)
5. [Saudi Arabia Considerations](#5-saudi-arabia-considerations)
6. [Technical Setup](#6-technical-setup)

---

## 1. Implementation Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NOTIFICATION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Event Trigger                                               │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Backend   │───▶│ Expo Push   │───▶│   Device    │      │
│  │   Event     │    │   Server    │    │   (iOS/     │      │
│  │   Handler   │    │             │    │   Android)  │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│       │                                       │              │
│       ▼                                       ▼              │
│  ┌─────────────┐                      ┌─────────────┐       │
│  │  Database   │                      │  In-App     │       │
│  │  (Log)      │                      │  Handler    │       │
│  └─────────────┘                      └─────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Why Expo Push Notifications?

| Factor | Benefit |
|--------|---------|
| **Cost** | Free (unlimited) |
| **Simplicity** | Single API for iOS + Android |
| **Reliability** | Managed service, high deliverability |
| **Integration** | Native Expo SDK support |
| **No FCM/APNs Setup** | Expo handles credentials |

---

## 2. Notification Types

### Type Enumeration

```typescript
enum NotificationType {
  // Booking Lifecycle
  BOOKING_REQUEST = 'booking_request',
  BOOKING_ACCEPTED = 'booking_accepted',
  BOOKING_REJECTED = 'booking_rejected',
  BOOKING_CANCELLED = 'booking_cancelled',

  // Items
  ITEMS_SUBMITTED = 'items_submitted',
  ITEMS_APPROVED = 'items_approved',
  ITEMS_REJECTED = 'items_rejected',

  // Payment
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PAYMENT_ISSUE = 'payment_issue',

  // Handoff
  PICKUP_REMINDER = 'pickup_reminder',
  PICKUP_CONFIRMED = 'pickup_confirmed',
  DELIVERY_REMINDER = 'delivery_reminder',
  DELIVERY_CONFIRMED = 'delivery_confirmed',

  // Reviews
  REVIEW_REQUEST = 'review_request',
  REVIEW_RECEIVED = 'review_received',

  // Messages
  NEW_MESSAGE = 'new_message',

  // Balance (Carrier)
  BALANCE_LOW = 'balance_low',
  BALANCE_RESTRICTED = 'balance_restricted',
  TOPUP_VERIFIED = 'topup_verified',
  TOPUP_REJECTED = 'topup_rejected',

  // System
  LISTING_EXPIRING = 'listing_expiring',
  FLIGHT_REMINDER = 'flight_reminder',
  ACCOUNT_VERIFIED = 'account_verified',
  PROMO_ANNOUNCEMENT = 'promo_announcement'
}
```

### Priority Levels

| Priority | Types | Behavior |
|----------|-------|----------|
| **Critical** | `pickup_reminder`, `delivery_reminder`, `balance_restricted` | Sound + vibrate, bypass DND |
| **High** | `booking_request`, `booking_accepted`, `payment_*`, `items_*` | Sound + vibrate |
| **Medium** | `new_message`, `review_*`, `balance_low` | Sound only |
| **Low** | `promo_announcement`, `listing_expiring` | Silent, badge only |

---

## 3. Notification Templates

### Booking Notifications

#### BOOKING_REQUEST (To Carrier)

```json
{
  "type": "booking_request",
  "title": {
    "ar": "طلب حجز جديد",
    "en": "New Booking Request"
  },
  "body": {
    "ar": "{sender_name} يريد حجز {weight} كجم على رحلتك {route}",
    "en": "{sender_name} wants to book {weight}kg on your {route} flight"
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "booking_detail"
  }
}
```

**Example:**
- AR: "محمد يريد حجز 5 كجم على رحلتك الرياض → القاهرة"
- EN: "Mohammed wants to book 5kg on your Riyadh → Cairo flight"

---

#### BOOKING_ACCEPTED (To Sender)

```json
{
  "type": "booking_accepted",
  "title": {
    "ar": "تم قبول حجزك! ✅",
    "en": "Booking Accepted! ✅"
  },
  "body": {
    "ar": "{carrier_name} قبل حجزك. أضف أغراضك الآن.",
    "en": "{carrier_name} accepted your booking. Add your items now."
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "add_items"
  }
}
```

---

#### BOOKING_REJECTED (To Sender)

```json
{
  "type": "booking_rejected",
  "title": {
    "ar": "تم رفض الحجز",
    "en": "Booking Declined"
  },
  "body": {
    "ar": "{carrier_name} لم يتمكن من قبول حجزك. ابحث عن ناقل آخر.",
    "en": "{carrier_name} couldn't accept your booking. Find another carrier."
  },
  "data": {
    "screen": "search"
  }
}
```

---

#### BOOKING_CANCELLED (To Both)

```json
{
  "type": "booking_cancelled",
  "title": {
    "ar": "تم إلغاء الحجز",
    "en": "Booking Cancelled"
  },
  "body": {
    "ar": "تم إلغاء الحجز #{booking_ref}. {reason}",
    "en": "Booking #{booking_ref} has been cancelled. {reason}"
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "booking_detail"
  }
}
```

---

### Items Notifications

#### ITEMS_SUBMITTED (To Carrier)

```json
{
  "type": "items_submitted",
  "title": {
    "ar": "أغراض جاهزة للمراجعة",
    "en": "Items Ready for Review"
  },
  "body": {
    "ar": "{sender_name} أضاف {item_count} أغراض. راجعها الآن.",
    "en": "{sender_name} added {item_count} items. Review them now."
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "approve_items"
  }
}
```

---

#### ITEMS_APPROVED (To Sender)

```json
{
  "type": "items_approved",
  "title": {
    "ar": "تمت الموافقة على أغراضك! ✅",
    "en": "Items Approved! ✅"
  },
  "body": {
    "ar": "{carrier_name} وافق على جميع الأغراض. أكمل الدفع الآن.",
    "en": "{carrier_name} approved all items. Complete payment now."
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "payment"
  }
}
```

---

#### ITEMS_REJECTED (To Sender)

```json
{
  "type": "items_rejected",
  "title": {
    "ar": "بعض الأغراض مرفوضة",
    "en": "Some Items Rejected"
  },
  "body": {
    "ar": "{carrier_name} رفض {rejected_count} من أغراضك. راجع التفاصيل.",
    "en": "{carrier_name} rejected {rejected_count} items. Review details."
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "items_review"
  }
}
```

---

### Payment Notifications

#### PAYMENT_RECEIVED (To Carrier)

```json
{
  "type": "payment_received",
  "title": {
    "ar": "إثبات دفع جديد",
    "en": "Payment Proof Received"
  },
  "body": {
    "ar": "{sender_name} أرسل إثبات الدفع. تحقق من حسابك البنكي.",
    "en": "{sender_name} submitted payment proof. Check your bank account."
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "confirm_payment"
  }
}
```

---

#### PAYMENT_CONFIRMED (To Sender)

```json
{
  "type": "payment_confirmed",
  "title": {
    "ar": "تم تأكيد الدفع! ✅",
    "en": "Payment Confirmed! ✅"
  },
  "body": {
    "ar": "{carrier_name} أكد استلام الدفع. جاهز للاستلام!",
    "en": "{carrier_name} confirmed payment. Ready for pickup!"
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "booking_detail"
  }
}
```

---

### Handoff Notifications

#### PICKUP_REMINDER (To Both) - CRITICAL

```json
{
  "type": "pickup_reminder",
  "title": {
    "ar": "تذكير: الاستلام بعد {hours} ساعات",
    "en": "Reminder: Pickup in {hours} hours"
  },
  "body": {
    "ar": "موعد الاستلام: {pickup_time} في {location}",
    "en": "Pickup at {pickup_time} at {location}"
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "booking_detail"
  },
  "priority": "critical"
}
```

**Trigger Times:** 24 hours, 2 hours before pickup

---

#### PICKUP_CONFIRMED (To Sender)

```json
{
  "type": "pickup_confirmed",
  "title": {
    "ar": "تم الاستلام بنجاح! ✅",
    "en": "Pickup Successful! ✅"
  },
  "body": {
    "ar": "أغراضك الآن مع {carrier_name}. في الطريق إلى {destination}.",
    "en": "Your items are now with {carrier_name}. On the way to {destination}."
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "tracking"
  }
}
```

---

#### DELIVERY_REMINDER (To Both) - CRITICAL

```json
{
  "type": "delivery_reminder",
  "title": {
    "ar": "تذكير: التسليم بعد {hours} ساعات",
    "en": "Reminder: Delivery in {hours} hours"
  },
  "body": {
    "ar": "موعد التسليم: {delivery_time} في {location}",
    "en": "Delivery at {delivery_time} at {location}"
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "booking_detail"
  },
  "priority": "critical"
}
```

---

#### DELIVERY_CONFIRMED (To Both)

```json
{
  "type": "delivery_confirmed",
  "title": {
    "ar": "تم التسليم بنجاح! 🎉",
    "en": "Delivery Complete! 🎉"
  },
  "body": {
    "ar": "رحلة ناجحة! لا تنسى تقييم {other_party}.",
    "en": "Successful trip! Don't forget to review {other_party}."
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "leave_review"
  }
}
```

---

### Message Notifications

#### NEW_MESSAGE

```json
{
  "type": "new_message",
  "title": {
    "ar": "رسالة من {sender_name}",
    "en": "Message from {sender_name}"
  },
  "body": {
    "ar": "{message_preview}",
    "en": "{message_preview}"
  },
  "data": {
    "conversationId": "{conversation_id}",
    "screen": "chat"
  }
}
```

**Note:** Message preview limited to 100 characters

---

### Balance Notifications (Carrier)

#### BALANCE_LOW

```json
{
  "type": "balance_low",
  "title": {
    "ar": "رصيدك منخفض",
    "en": "Balance Running Low"
  },
  "body": {
    "ar": "رصيدك الحالي {balance} ريال. اشحن قبل الوصول للحد ({threshold} ريال).",
    "en": "Your balance is {balance} SAR. Top up before reaching limit ({threshold} SAR)."
  },
  "data": {
    "screen": "wallet"
  }
}
```

---

#### BALANCE_RESTRICTED - CRITICAL

```json
{
  "type": "balance_restricted",
  "title": {
    "ar": "⚠️ حسابك مقيد",
    "en": "⚠️ Account Restricted"
  },
  "body": {
    "ar": "رصيدك تجاوز الحد. اشحن {amount} ريال للاستمرار.",
    "en": "Balance below threshold. Top up {amount} SAR to continue."
  },
  "data": {
    "screen": "wallet"
  },
  "priority": "critical"
}
```

---

#### TOPUP_VERIFIED

```json
{
  "type": "topup_verified",
  "title": {
    "ar": "تم شحن رصيدك! ✅",
    "en": "Balance Topped Up! ✅"
  },
  "body": {
    "ar": "تم إضافة {amount} ريال. رصيدك الجديد: {new_balance} ريال.",
    "en": "{amount} SAR added. New balance: {new_balance} SAR."
  },
  "data": {
    "screen": "wallet"
  }
}
```

---

### Review Notifications

#### REVIEW_REQUEST (24 hours after delivery)

```json
{
  "type": "review_request",
  "title": {
    "ar": "كيف كانت تجربتك؟",
    "en": "How was your experience?"
  },
  "body": {
    "ar": "شارك رأيك عن {other_party}. ساعد المجتمع!",
    "en": "Share your feedback about {other_party}. Help the community!"
  },
  "data": {
    "bookingId": "{booking_id}",
    "screen": "leave_review"
  }
}
```

---

#### REVIEW_RECEIVED

```json
{
  "type": "review_received",
  "title": {
    "ar": "لديك تقييم جديد! ⭐",
    "en": "You got a new review! ⭐"
  },
  "body": {
    "ar": "{reviewer_name} أعطاك {rating} نجوم.",
    "en": "{reviewer_name} gave you {rating} stars."
  },
  "data": {
    "screen": "my_reviews"
  }
}
```

---

## 4. Trigger Conditions

### Automatic Triggers

| Event | Notification | Recipient | Delay |
|-------|--------------|-----------|-------|
| Booking created | `booking_request` | Carrier | Immediate |
| Booking accepted | `booking_accepted` | Sender | Immediate |
| Booking rejected | `booking_rejected` | Sender | Immediate |
| Booking cancelled | `booking_cancelled` | Both | Immediate |
| Items submitted | `items_submitted` | Carrier | Immediate |
| Items approved | `items_approved` | Sender | Immediate |
| Items rejected | `items_rejected` | Sender | Immediate |
| Payment proof uploaded | `payment_received` | Carrier | Immediate |
| Payment confirmed | `payment_confirmed` | Sender | Immediate |
| Pickup completed | `pickup_confirmed` | Sender | Immediate |
| Delivery completed | `delivery_confirmed` | Both | Immediate |
| New message | `new_message` | Recipient | 30 seconds* |
| Review submitted | `review_received` | Reviewee | Immediate |

*\*30-second delay to batch rapid messages*

### Scheduled Triggers

| Trigger | Notification | Timing |
|---------|--------------|--------|
| Flight approaching | `pickup_reminder` | 24h, 2h before departure |
| Landing expected | `delivery_reminder` | 2h, 30min after arrival |
| Post-delivery | `review_request` | 24h after delivery confirmation |
| Balance threshold | `balance_low` | When balance < -5 SAR |
| Balance exceeded | `balance_restricted` | When balance < -10 SAR |
| Listing expiring | `listing_expiring` | 24h before flight if no bookings |

### Suppression Rules

| Rule | Logic |
|------|-------|
| **Message batching** | Max 1 message notification per conversation per 5 minutes |
| **Review reminder** | Only send once per booking |
| **Balance alerts** | Max 1 per day |
| **User preference** | Respect notification settings |

---

## 5. Saudi Arabia Considerations

### Prayer Time Handling

```typescript
// Prayer times vary by city and date
// Use Aladhan API or similar for accurate times

const PRAYER_BUFFER_MINUTES = 30; // Before and after prayer

function shouldDelayNotification(city: string, priority: string): boolean {
  if (priority === 'critical') return false; // Never delay critical

  const now = new Date();
  const prayerTimes = getPrayerTimes(city, now);

  for (const prayer of prayerTimes) {
    const start = subMinutes(prayer, PRAYER_BUFFER_MINUTES);
    const end = addMinutes(prayer, PRAYER_BUFFER_MINUTES);
    if (isWithinInterval(now, { start, end })) {
      return true;
    }
  }
  return false;
}

// If delayed, queue for after prayer buffer
```

### Language Selection

```typescript
function getNotificationLanguage(user: User): 'ar' | 'en' {
  // Priority:
  // 1. User's preferred language setting
  // 2. Device locale
  // 3. Default to Arabic (Saudi market)

  return user.preferredLanguage ||
         user.deviceLocale?.startsWith('ar') ? 'ar' : 'ar';
}
```

### Quiet Hours

```typescript
const QUIET_HOURS = {
  start: 23, // 11 PM
  end: 7,    // 7 AM
};

// Low priority notifications delayed until morning
// Critical notifications still sent
```

---

## 6. Technical Setup

### Expo Push Notification Setup

#### 1. Install Dependencies

```bash
npx expo install expo-notifications expo-device expo-constants
```

#### 2. Configure app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#2E5A8F",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ],
    "android": {
      "useNextNotificationsApi": true
    }
  }
}
```

#### 3. Register for Push Notifications

```typescript
// hooks/usePushNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  // Get Expo push token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-project-id', // From app.json
  });

  // Android-specific channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E5A8F',
    });

    await Notifications.setNotificationChannelAsync('critical', {
      name: 'Critical Alerts',
      importance: Notifications.AndroidImportance.MAX,
      bypassDnd: true,
      sound: 'critical.wav',
    });
  }

  return token.data;
}
```

#### 4. Handle Notifications

```typescript
// hooks/useNotificationHandler.ts
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

export function useNotificationHandler() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Handle notification received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // Could show in-app toast
      }
    );

    // Handle notification tap (opens app)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        // Navigate based on notification type
        switch (data.screen) {
          case 'booking_detail':
            router.push(`/booking/${data.bookingId}`);
            break;
          case 'chat':
            router.push(`/chat/${data.conversationId}`);
            break;
          case 'wallet':
            router.push('/profile/wallet');
            break;
          case 'leave_review':
            router.push(`/booking/${data.bookingId}/review`);
            break;
          default:
            router.push('/');
        }
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}
```

#### 5. Backend: Send Push Notification

```typescript
// services/notification.service.ts
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  data?: Record<string, any>;
  priority?: 'default' | 'high' | 'critical';
}

export async function sendPushNotification(params: SendNotificationParams) {
  // 1. Get user's push tokens and language preference
  const user = await getUserWithPushTokens(params.userId);

  if (!user.pushTokens?.length || !user.push_notifications_enabled) {
    return; // User has no tokens or disabled notifications
  }

  const language = user.preferredLanguage || 'ar';
  const title = language === 'ar' ? params.titleAr : params.titleEn;
  const body = language === 'ar' ? params.bodyAr : params.bodyEn;

  // 2. Build messages for all user's devices
  const messages: ExpoPushMessage[] = user.pushTokens
    .filter((token) => Expo.isExpoPushToken(token))
    .map((token) => ({
      to: token,
      sound: params.priority === 'critical' ? 'critical.wav' : 'default',
      title,
      body,
      data: {
        ...params.data,
        type: params.type,
      },
      priority: params.priority === 'critical' ? 'high' : 'default',
      channelId: params.priority === 'critical' ? 'critical' : 'default',
    }));

  // 3. Send in chunks (Expo recommends max 100 per request)
  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      // Handle receipts, track delivery
      await logNotificationDelivery(params.userId, params.type, receipts);
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }

  // 4. Save to notifications table for in-app history
  await saveNotificationToDatabase({
    userId: params.userId,
    type: params.type,
    title,
    body,
    data: params.data,
  });
}
```

---

## Notification Settings UI

Users can control notifications in **Profile > Settings > Notifications**:

```
┌─────────────────────────────────────────┐
│   إعدادات الإشعارات                      │
│   Notification Settings                 │
├─────────────────────────────────────────┤
│                                         │
│   🔔 إشعارات الدفع / Push Notifications │
│   ┌───────────────────────────────┐     │
│   │                           [ON]│     │
│   └───────────────────────────────┘     │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   📦 الحجوزات / Bookings           [ON] │
│   💳 المدفوعات / Payments          [ON] │
│   💬 الرسائل / Messages            [ON] │
│   ⭐ التقييمات / Reviews           [ON] │
│   💰 الرصيد / Balance (Carrier)    [ON] │
│   📢 العروض / Promotions          [OFF] │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   🌙 الوضع الهادئ / Quiet Hours         │
│   ┌───────────────────────────────┐     │
│   │ 11:00 PM - 7:00 AM       [ON]│     │
│   └───────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

---

*Notifications Specification v1.0*
*LuggageShare - حصتي*
