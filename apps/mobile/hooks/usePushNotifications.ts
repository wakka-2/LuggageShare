import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(isAuthenticated: boolean) {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications();

    // Listen for incoming notifications while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Notification received in foreground — no action needed,
      // the handler above shows the alert
    });

    // Listen for notification taps (background + killed state)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      navigateToScreen(data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated]);

  async function registerForPushNotifications() {
    // Push notifications only work on physical devices
    if (!Device.isDevice) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    // Android needs a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      // Register token with API
      await apiClient.post('/notifications/register-token', {
        token: tokenData.data,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  function navigateToScreen(data: Record<string, unknown>) {
    if (!data?.type) return;

    switch (data.type) {
      case 'booking_created':
      case 'booking_accepted':
      case 'booking_rejected':
      case 'booking_delivered':
      case 'payment_proof':
        if (data.bookingId) {
          router.push(`/booking/${data.bookingId}` as any);
        }
        break;
      case 'new_message':
        if (data.bookingId) {
          router.push(`/chat/${data.bookingId}` as any);
        }
        break;
      default:
        router.push('/notifications' as any);
    }
  }
}
