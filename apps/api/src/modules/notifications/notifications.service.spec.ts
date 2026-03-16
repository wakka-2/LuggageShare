import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockPrismaService = () => ({
  notification: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
  },
  pushToken: {
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
});

const mockConfigService = () => ({
  get: jest.fn().mockReturnValue(undefined),
});

const USER_ID = 'user-111';

const makeNotification = (overrides: Record<string, unknown> = {}) => ({
  id: 'notif-111',
  userId: USER_ID,
  title: 'Test',
  body: 'Test notification',
  data: {},
  isRead: false,
  createdAt: new Date('2026-01-15'),
  ...overrides,
});

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useFactory: mockPrismaService },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNotifications', () => {
    it('should return notifications for user ordered by createdAt desc', async () => {
      const notifs = [makeNotification(), makeNotification({ id: 'notif-222' })];
      prisma.notification.findMany.mockResolvedValue(notifs);

      const result = await service.getNotifications(USER_ID);

      expect(result).toHaveLength(2);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('registerToken', () => {
    it('should upsert push token for user', async () => {
      prisma.pushToken.upsert.mockResolvedValue({});

      const result = await service.registerToken(USER_ID, 'ExponentPushToken[xxx]', 'ios');

      expect(result).toEqual({ success: true });
      expect(prisma.pushToken.upsert).toHaveBeenCalledWith({
        where: {
          userId_token: { userId: USER_ID, token: 'ExponentPushToken[xxx]' },
        },
        update: { platform: 'ios', updatedAt: expect.any(Date) },
        create: { userId: USER_ID, token: 'ExponentPushToken[xxx]', platform: 'ios' },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      prisma.notification.findUnique.mockResolvedValue(makeNotification());
      prisma.notification.update.mockResolvedValue(makeNotification({ isRead: true }));

      const result = await service.markAsRead(USER_ID, 'notif-111');

      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException when notification not found', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead(USER_ID, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when notification belongs to another user', async () => {
      prisma.notification.findUnique.mockResolvedValue(makeNotification({ userId: 'other-user' }));

      await expect(service.markAsRead(USER_ID, 'notif-111')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead(USER_ID);

      expect(result).toEqual({ success: true });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: USER_ID, isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe('sendPushNotification', () => {
    it('should send push notification via Expo API', async () => {
      prisma.pushToken.findMany.mockResolvedValue([
        { token: 'ExponentPushToken[aaa]', platform: 'ios' },
      ]);
      prisma.notification.create.mockResolvedValue({});
      mockedAxios.post.mockResolvedValue({ data: {} });

      await service.sendPushNotification(USER_ID, 'Title', 'Body', { type: 'test' });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: USER_ID,
          title: 'Title',
          body: 'Body',
          data: { type: 'test' },
        },
      });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        [
          {
            to: 'ExponentPushToken[aaa]',
            title: 'Title',
            body: 'Body',
            data: { type: 'test' },
            sound: 'default',
          },
        ],
        expect.any(Object)
      );
    });

    it('should not send when user has no push tokens', async () => {
      prisma.pushToken.findMany.mockResolvedValue([]);

      await service.sendPushNotification(USER_ID, 'Title', 'Body');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });

    it('should not throw when Expo API fails', async () => {
      prisma.pushToken.findMany.mockResolvedValue([
        { token: 'ExponentPushToken[aaa]', platform: 'ios' },
      ]);
      prisma.notification.create.mockResolvedValue({});
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(service.sendPushNotification(USER_ID, 'Title', 'Body')).resolves.toBeUndefined();
    });
  });
});
