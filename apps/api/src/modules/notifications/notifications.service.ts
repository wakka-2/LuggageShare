import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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
    data?: Record<string, any>,
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

    // Send via Expo Push Notifications
    const expoToken = this.configService.get<string>('EXPO_ACCESS_TOKEN');

    const messages = pushTokens.map((pt) => ({
      to: pt.token,
      title,
      body,
      data,
      sound: 'default',
    }));

    try {
      await axios.post(
        'https://exp.host/--/api/v2/push/send',
        messages,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(expoToken && { 'Authorization': `Bearer ${expoToken}` }),
          },
        },
      );
    } catch (error) {
      this.logger.error('Failed to send push notification', error instanceof Error ? error.stack : error);
    }
  }
}
