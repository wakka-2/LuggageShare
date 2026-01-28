import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getConversations(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { senderId: userId },
          { carrierId: userId },
        ],
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

    return bookings.map((booking) => {
      const otherUser = booking.senderId === userId ? booking.carrier : booking.sender;
      const lastMessage = booking.messages[0];

      return {
        bookingId: booking.id,
        otherUser,
        route: `${booking.listing.departureCity} → ${booking.listing.arrivalCity}`,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isMe: lastMessage.senderId === userId,
            }
          : null,
        unreadCount: 0, // TODO: Implement unread count
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
}
