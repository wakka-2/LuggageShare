import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        listing: {
          select: {
            id: true,
            departureCity: true,
            arrivalCity: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingRef: true,
            status: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    });

    // Count unread messages per conversation
    const unreadCounts = await Promise.all(
      conversations.map((conv) =>
        this.prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        }),
      ),
    );

    return conversations.map((conv, index) => {
      const otherUser =
        conv.participant1Id === userId ? conv.participant2 : conv.participant1;
      const lastMessage = conv.messages[0];
      const route = conv.listing
        ? `${conv.listing.departureCity} → ${conv.listing.arrivalCity}`
        : undefined;

      return {
        id: conv.id,
        listingId: conv.listingId,
        bookingId: conv.bookingId,
        otherUser,
        route,
        booking: conv.booking,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isMe: lastMessage.senderId === userId,
            }
          : null,
        unreadCount: unreadCounts[index],
        createdAt: conv.createdAt,
      };
    });
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    // Check if conversation already exists between these users for this listing
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: dto.userId },
          { participant1Id: dto.userId, participant2Id: userId },
        ],
        ...(dto.listingId && { listingId: dto.listingId }),
        ...(dto.bookingId && { bookingId: dto.bookingId }),
      },
    });

    if (existingConversation) {
      // Send initial message to existing conversation if provided
      if (dto.initialMessage) {
        await this.prisma.message.create({
          data: {
            conversationId: existingConversation.id,
            senderId: userId,
            content: dto.initialMessage,
            messageType: 'text',
          },
        });
        await this.prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { lastMessageAt: new Date() },
        });
      }
      return existingConversation;
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        participant1Id: userId,
        participant2Id: dto.userId,
        listingId: dto.listingId,
        bookingId: dto.bookingId,
        ...(dto.initialMessage && {
          lastMessageAt: new Date(),
          messages: {
            create: {
              senderId: userId,
              content: dto.initialMessage,
              messageType: 'text',
            },
          },
        }),
      },
      include: {
        participant1: {
          select: { id: true, name: true, avatarUrl: true },
        },
        participant2: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return conversation;
  }

  async getMessages(userId: string, conversationId: string, cursor?: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
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

  async sendMessage(
    userId: string,
    conversationId: string,
    content: string,
    messageType: string = 'text',
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        messageType,
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

    // Update conversation's lastMessageAt for sorting
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async markAsRead(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }
}
