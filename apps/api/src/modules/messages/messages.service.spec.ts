import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('../../common/utils/content-filter', () => ({
  containsProfanity: jest.fn().mockReturnValue(false),
}));

import { containsProfanity } from '../../common/utils/content-filter';

const mockPrismaService = () => ({
  booking: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  message: {
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    groupBy: jest.fn(),
  },
});

const SENDER_ID = 'user-sender-111';
const CARRIER_ID = 'user-carrier-222';
const BOOKING_ID = 'booking-aaa-111';

const makeBooking = (overrides: Record<string, unknown> = {}) => ({
  id: BOOKING_ID,
  senderId: SENDER_ID,
  carrierId: CARRIER_ID,
  status: 'accepted',
  ...overrides,
});

const makeMessage = (overrides: Record<string, unknown> = {}) => ({
  id: 'msg-111',
  bookingId: BOOKING_ID,
  senderId: SENDER_ID,
  content: 'Hello',
  isRead: false,
  createdAt: new Date('2026-01-15'),
  sender: { id: SENDER_ID, name: 'Sender', avatarUrl: null },
  ...overrides,
});

describe('MessagesService', () => {
  let service: MessagesService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesService, { provide: PrismaService, useFactory: mockPrismaService }],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMessages', () => {
    it('should return messages for a valid booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      const msgs = [makeMessage(), makeMessage({ id: 'msg-222' })];
      prisma.message.findMany.mockResolvedValue(msgs);

      const result = await service.getMessages(SENDER_ID, BOOKING_ID);

      expect(result.messages).toHaveLength(2);
    });

    it('should throw NotFoundException when booking not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.getMessages(SENDER_ID, 'nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when user not part of booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(service.getMessages('other-user', BOOKING_ID)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should return null nextCursor when fewer than 50 messages', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.message.findMany.mockResolvedValue([makeMessage()]);

      const result = await service.getMessages(SENDER_ID, BOOKING_ID);

      expect(result.nextCursor).toBeNull();
    });
  });

  describe('sendMessage', () => {
    it('should create a message for a valid booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.message.create.mockResolvedValue(makeMessage({ content: 'Hi' }));
      prisma.booking.update.mockResolvedValue({});

      const result = await service.sendMessage(SENDER_ID, BOOKING_ID, 'Hi');

      expect(result.content).toBe('Hi');
      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            bookingId: BOOKING_ID,
            senderId: SENDER_ID,
            content: 'Hi',
          },
        })
      );
    });

    it('should throw NotFoundException when booking not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.sendMessage(SENDER_ID, 'nonexistent', 'Hi')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when user not part of booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(service.sendMessage('other-user', BOOKING_ID, 'Hi')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw BadRequestException when message contains profanity', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      (containsProfanity as jest.Mock).mockReturnValueOnce(true);

      await expect(service.sendMessage(SENDER_ID, BOOKING_ID, 'bad word')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should update booking updatedAt for conversation sorting', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.message.create.mockResolvedValue(makeMessage());
      prisma.booking.update.mockResolvedValue({});

      await service.sendMessage(SENDER_ID, BOOKING_ID, 'Hello');

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: BOOKING_ID },
        data: { updatedAt: expect.any(Date) },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark unread messages from other user as read', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.message.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAsRead(SENDER_ID, BOOKING_ID);

      expect(result).toEqual({ success: true });
      expect(prisma.message.updateMany).toHaveBeenCalledWith({
        where: {
          bookingId: BOOKING_ID,
          senderId: { not: SENDER_ID },
          isRead: false,
        },
        data: { isRead: true },
      });
    });

    it('should throw NotFoundException when booking not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead(SENDER_ID, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user not part of booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(service.markAsRead('other-user', BOOKING_ID)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('getConversations', () => {
    it('should return conversations with unread counts', async () => {
      prisma.booking.findMany.mockResolvedValue([
        {
          ...makeBooking(),
          sender: { id: SENDER_ID, name: 'Sender', avatarUrl: null },
          carrier: { id: CARRIER_ID, name: 'Carrier', avatarUrl: null },
          listing: { departureCity: 'Riyadh', arrivalCity: 'Jeddah' },
          messages: [
            {
              content: 'Last message',
              createdAt: new Date(),
              senderId: CARRIER_ID,
            },
          ],
        },
      ]);
      prisma.message.groupBy.mockResolvedValue([{ bookingId: BOOKING_ID, _count: { id: 2 } }]);

      const result = await service.getConversations(SENDER_ID);

      expect(result).toHaveLength(1);
      expect(result[0].bookingId).toBe(BOOKING_ID);
      expect(result[0].unreadCount).toBe(2);
      expect(result[0].route).toBe('Riyadh → Jeddah');
    });
  });
});
