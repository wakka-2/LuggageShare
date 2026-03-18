import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { containsProfanity } from '../../common/utils/content-filter';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getConversations(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [{ senderId: userId }, { carrierId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        carrier: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        listing: {
          select: {
            departureCity: true,
            arrivalCity: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const bookingIds = bookings.map((b: any) => b.id);

    const unreadCounts = await this.prisma.message.groupBy({
      by: ['bookingId'],
      where: {
        bookingId: { in: bookingIds },
        senderId: { not: userId },
        isRead: false,
      },
      _count: { id: true },
    });

    const unreadMap = new Map(unreadCounts.map((uc: any) => [uc.bookingId, uc._count.id]));

    return bookings.map((booking: any) => {
      const otherUser = booking.senderId === userId ? booking.carrier : booking.sender;
      const lastMessage = booking.messages[0];

      return {
        bookingId: booking.id,
        otherUser,
        route: `${booking.listing?.departureCity ?? ''} → ${booking.listing?.arrivalCity ?? ''}`,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isMe: lastMessage.senderId === userId,
            }
          : null,
        unreadCount: unreadMap.get(booking.id) ?? 0,
      };
    });
  }

  async getMessages(userId: string, bookingId: string, cursor?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      messages: messages.reverse(),
      nextCursor: messages.length === 50 ? messages[0].id : null,
    };
  }

  async sendMessage(userId: string, bookingId: string, content: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    if (containsProfanity(content)) {
      throw new BadRequestException('Message contains inappropriate content');
    }

    const message = await this.prisma.message.create({
      data: {
        bookingId,
        senderId: userId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update booking's updatedAt for conversation sorting
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markAsRead(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    await this.prisma.message.updateMany({
      where: {
        bookingId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }

  // ─── Offer Chat (pre-booking negotiation) ─────────────────────────────────

  private async getOfferParties(offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        flight: { select: { posterId: true, departureCity: true, arrivalCity: true } },
        sender: { select: { id: true } },
      },
    });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  private assertOfferAccess(
    userId: string,
    offer: { senderId: string; flight: { posterId: string } }
  ) {
    if (offer.senderId !== userId && offer.flight.posterId !== userId) {
      throw new ForbiddenException('You do not have access to this offer conversation');
    }
  }

  async getOfferMessages(userId: string, offerId: string, cursor?: string) {
    const offer = await this.getOfferParties(offerId);
    this.assertOfferAccess(userId, offer);

    const messages = await this.prisma.message.findMany({
      where: { offerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return {
      messages: messages.reverse(),
      nextCursor: messages.length === 50 ? messages[0].id : null,
    };
  }

  async sendOfferMessage(userId: string, offerId: string, content: string) {
    const offer = await this.getOfferParties(offerId);
    this.assertOfferAccess(userId, offer);

    if (containsProfanity(content)) {
      throw new BadRequestException('Message contains inappropriate content');
    }

    return this.prisma.message.create({
      data: {
        offerId,
        senderId: userId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async markOfferMessagesRead(userId: string, offerId: string) {
    const offer = await this.getOfferParties(offerId);
    this.assertOfferAccess(userId, offer);

    await this.prisma.message.updateMany({
      where: { offerId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }
}
