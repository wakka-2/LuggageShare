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
    // Booking-based conversations
    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [{ senderId: userId }, { carrierId: userId }],
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
        carrier: {
          select: { id: true, name: true, avatarUrl: true },
        },
        listing: {
          select: { departureCity: true, arrivalCity: true },
        },
        trip: {
          select: { departureCity: true, arrivalCity: true },
        },
        request: {
          select: { departureCity: true, arrivalCity: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const bookingIds = bookings.map((b) => b.id);

    const unreadCounts = await this.prisma.message.groupBy({
      by: ['bookingId'],
      where: {
        bookingId: { in: bookingIds },
        senderId: { not: userId },
        isRead: false,
      },
      _count: { id: true },
    });

    const unreadMap = new Map(unreadCounts.map((uc) => [uc.bookingId, uc._count.id]));

    const bookingConversations = bookings.map((booking) => {
      const otherUser = booking.senderId === userId ? booking.carrier : booking.sender;
      const lastMessage = booking.messages[0];

      // Route from trip/request/listing (whichever is set)
      const routeSource = booking.trip || booking.request || booking.listing;
      const route = routeSource
        ? `${routeSource.departureCity} → ${routeSource.arrivalCity}`
        : 'Unknown route';

      return {
        bookingId: booking.id,
        offerId: null as string | null,
        otherUser,
        route,
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

    // Offer-based conversations (pre-booking negotiation)
    const offerMessages = await this.prisma.offer.findMany({
      where: {
        messages: { some: {} },
        booking: null, // Only pre-booking offers (no booking yet)
        OR: [{ userId: userId }, { trip: { posterId: userId } }, { request: { posterId: userId } }],
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        trip: {
          select: {
            departureCity: true,
            arrivalCity: true,
            poster: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        request: {
          select: {
            departureCity: true,
            arrivalCity: true,
            poster: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const offerIds = offerMessages.map((o) => o.id);
    const offerUnreadCounts = await this.prisma.message.groupBy({
      by: ['offerId'],
      where: {
        offerId: { in: offerIds },
        senderId: { not: userId },
        isRead: false,
      },
      _count: { id: true },
    });
    const offerUnreadMap = new Map(offerUnreadCounts.map((uc) => [uc.offerId, uc._count.id]));

    const offerConversations = offerMessages.map((offer) => {
      const isOfferMaker = offer.userId === userId;
      const poster = offer.trip?.poster || offer.request?.poster;
      const otherUser = isOfferMaker ? poster : offer.user;
      const routeSource = offer.trip || offer.request;
      const route = routeSource
        ? `${routeSource.departureCity} → ${routeSource.arrivalCity}`
        : 'Unknown route';
      const lastMessage = offer.messages[0];

      return {
        bookingId: null as string | null,
        offerId: offer.id,
        otherUser,
        route,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isMe: lastMessage.senderId === userId,
            }
          : null,
        unreadCount: offerUnreadMap.get(offer.id) ?? 0,
      };
    });

    // Merge and sort by last message time
    return [...bookingConversations, ...offerConversations].sort((a, b) => {
      const aTime = a.lastMessage?.createdAt?.getTime() ?? 0;
      const bTime = b.lastMessage?.createdAt?.getTime() ?? 0;
      return bTime - aTime;
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

  async getOfferMessages(userId: string, offerId: string, cursor?: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { trip: true, request: true },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Access: offer maker OR trip/request poster
    const posterUserId = offer.trip?.posterId ?? offer.request?.posterId;
    if (offer.userId !== userId && posterUserId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: { offerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
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

  async sendOfferMessage(userId: string, offerId: string, content: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { trip: true, request: true },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const posterUserId = offer.trip?.posterId ?? offer.request?.posterId;
    if (offer.userId !== userId && posterUserId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

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
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
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

  async markOfferAsRead(userId: string, offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { trip: true, request: true },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const posterUserId = offer.trip?.posterId ?? offer.request?.posterId;
    if (offer.userId !== userId && posterUserId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    await this.prisma.message.updateMany({
      where: {
        offerId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }
}
