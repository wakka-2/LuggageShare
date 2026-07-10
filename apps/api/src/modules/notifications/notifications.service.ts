import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';
import * as webpush from 'web-push';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly vapidConfigured: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject =
      this.configService.get<string>('VAPID_SUBJECT') || 'mailto:support@luggageshare.com';
    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.vapidConfigured = true;
    } else {
      this.vapidConfigured = false;
    }
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async registerToken(userId: string, token: string, platform: string) {
    // Upsert push token for user
    await this.prisma.pushToken.upsert({
      where: {
        userId_token: {
          userId,
          token,
        },
      },
      update: {
        platform,
        updatedAt: new Date(),
      },
      create: {
        userId,
        token,
        platform,
      },
    });

    return { success: true };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    // Get user's push tokens
    const pushTokens = await this.prisma.pushToken.findMany({
      where: { userId },
    });

    if (pushTokens.length === 0) {
      return;
    }

    // Create notification record
    await this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
        data: data || {},
      },
    });

    // explicit any — no generated Prisma types in CI
    const webTokens = pushTokens.filter((pt: any) => pt.platform === 'web');
    const nativeTokens = pushTokens.filter((pt: any) => pt.platform !== 'web');

    await Promise.all([
      this.sendWebPush(webTokens, title, body, data),
      this.sendExpoPush(nativeTokens, title, body, data),
    ]);
  }

  private async sendWebPush(
    tokens: any[],
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    if (tokens.length === 0 || !this.vapidConfigured) {
      return;
    }

    const payload = JSON.stringify({ title, body, url: data?.url });

    await Promise.all(
      tokens.map(async (pt: any) => {
        try {
          const subscription = JSON.parse(pt.token);
          await webpush.sendNotification(subscription, payload);
        } catch (error: any) {
          // 404/410 → subscription expired; prune it so it isn't retried.
          if (error?.statusCode === 404 || error?.statusCode === 410) {
            await this.prisma.pushToken.delete({ where: { id: pt.id } }).catch(() => undefined);
          } else {
            this.logger.error(
              'Failed to send web push notification',
              error instanceof Error ? error.stack : error
            );
          }
        }
      })
    );
  }

  private async sendExpoPush(
    tokens: any[],
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    if (tokens.length === 0) {
      return;
    }

    const expoToken = this.configService.get<string>('EXPO_ACCESS_TOKEN');

    const messages = tokens.map((pt: any) => ({
      to: pt.token,
      title,
      body,
      data,
      sound: 'default',
    }));

    try {
      await axios.post('https://exp.host/--/api/v2/push/send', messages, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(expoToken && { Authorization: `Bearer ${expoToken}` }),
        },
      });
    } catch (error) {
      this.logger.error(
        'Failed to send push notification',
        error instanceof Error ? error.stack : error
      );
    }
  }

  async sendTestNotification(userId: string) {
    await this.sendPushNotification(userId, 'حصتي', 'هذا إشعار تجريبي - الإشعارات تعمل بنجاح!');
    return { success: true };
  }
}
