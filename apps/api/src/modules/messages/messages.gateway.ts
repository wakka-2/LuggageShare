import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { containsProfanity } from '../../common/utils/content-filter';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  /** Maps userId -> Set of connected socket IDs */
  private connectedUsers = new Map<string, Set<string>>();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  // ---------------------------------------------------------------------------
  // Connection lifecycle
  // ---------------------------------------------------------------------------

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without a valid token`);
        client.disconnect(true);
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET')!;
      const payload = jwt.verify(token, secret) as { sub: string };
      const userId = payload.sub;

      client.userId = userId;

      // Track connection
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(client.id);

      this.logger.log(`User ${userId} connected (socket ${client.id})`);
    } catch (error) {
      this.logger.warn(`Authentication failed for socket ${client.id}: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.userId;
    if (!userId) return;

    const sockets = this.connectedUsers.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }

    this.logger.log(`User ${userId} disconnected (socket ${client.id})`);
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  @SubscribeMessage('joinBooking')
  async handleJoinBooking(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { bookingId: string }
  ): Promise<{ event: string; data: { success: boolean; error?: string } }> {
    const userId = client.userId;
    if (!userId) {
      return { event: 'joinBooking', data: { success: false, error: 'Not authenticated' } };
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) {
      return { event: 'joinBooking', data: { success: false, error: 'Booking not found' } };
    }

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      return { event: 'joinBooking', data: { success: false, error: 'Access denied' } };
    }

    const room = `booking:${data.bookingId}`;
    client.join(room);
    this.logger.debug(`User ${userId} joined room ${room}`);

    return { event: 'joinBooking', data: { success: true } };
  }

  @SubscribeMessage('leaveBooking')
  handleLeaveBooking(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { bookingId: string }
  ): { event: string; data: { success: boolean } } {
    const room = `booking:${data.bookingId}`;
    client.leave(room);
    this.logger.debug(`User ${client.userId} left room ${room}`);

    return { event: 'leaveBooking', data: { success: true } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { bookingId: string; content: string }
  ): Promise<{
    event: string;
    data: { success: boolean; message?: any; error?: string };
  }> {
    const userId = client.userId;
    if (!userId) {
      return {
        event: 'sendMessage',
        data: { success: false, error: 'Not authenticated' },
      };
    }

    const { bookingId, content } = data;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return {
        event: 'sendMessage',
        data: { success: false, error: 'Message content is required' },
      };
    }

    if (content.length > 1000) {
      return {
        event: 'sendMessage',
        data: { success: false, error: 'Message exceeds 1000 characters' },
      };
    }

    // Verify booking access
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        event: 'sendMessage',
        data: { success: false, error: 'Booking not found' },
      };
    }

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      return {
        event: 'sendMessage',
        data: { success: false, error: 'Access denied' },
      };
    }

    // Profanity check
    if (containsProfanity(content)) {
      return {
        event: 'sendMessage',
        data: { success: false, error: 'Message contains inappropriate content' },
      };
    }

    // Persist message (same logic as MessagesService.sendMessage)
    const message = await this.prisma.message.create({
      data: {
        bookingId,
        senderId: userId,
        content: content.trim(),
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

    // Update booking timestamp for conversation sorting
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { updatedAt: new Date() },
    });

    // Broadcast to the room
    const room = `booking:${bookingId}`;
    this.server.to(room).emit('newMessage', message);

    this.logger.debug(`Message ${message.id} sent to room ${room} by user ${userId}`);

    return { event: 'sendMessage', data: { success: true, message } };
  }

  @SubscribeMessage('joinOffer')
  async handleJoinOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { offerId: string }
  ): Promise<{ event: string; data: { success: boolean; error?: string } }> {
    const userId = client.userId;
    if (!userId) {
      return { event: 'joinOffer', data: { success: false, error: 'Not authenticated' } };
    }

    const offer = await this.prisma.offer.findUnique({
      where: { id: data.offerId },
      include: { trip: true, request: true },
    });

    if (!offer) {
      return { event: 'joinOffer', data: { success: false, error: 'Offer not found' } };
    }

    const posterUserId = offer.trip?.posterId ?? offer.request?.posterId;
    if (offer.userId !== userId && posterUserId !== userId) {
      return { event: 'joinOffer', data: { success: false, error: 'Access denied' } };
    }

    const room = `offer:${data.offerId}`;
    client.join(room);
    this.logger.debug(`User ${userId} joined room ${room}`);

    return { event: 'joinOffer', data: { success: true } };
  }

  @SubscribeMessage('leaveOffer')
  handleLeaveOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { offerId: string }
  ): { event: string; data: { success: boolean } } {
    const room = `offer:${data.offerId}`;
    client.leave(room);
    this.logger.debug(`User ${client.userId} left room ${room}`);

    return { event: 'leaveOffer', data: { success: true } };
  }

  @SubscribeMessage('sendOfferMessage')
  async handleSendOfferMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { offerId: string; content: string }
  ): Promise<{
    event: string;
    data: { success: boolean; message?: any; error?: string };
  }> {
    const userId = client.userId;
    if (!userId) {
      return { event: 'sendOfferMessage', data: { success: false, error: 'Not authenticated' } };
    }

    const { offerId, content } = data;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return {
        event: 'sendOfferMessage',
        data: { success: false, error: 'Message content is required' },
      };
    }

    if (content.length > 1000) {
      return {
        event: 'sendOfferMessage',
        data: { success: false, error: 'Message exceeds 1000 characters' },
      };
    }

    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { trip: true, request: true },
    });

    if (!offer) {
      return { event: 'sendOfferMessage', data: { success: false, error: 'Offer not found' } };
    }

    const posterUserId = offer.trip?.posterId ?? offer.request?.posterId;
    if (offer.userId !== userId && posterUserId !== userId) {
      return { event: 'sendOfferMessage', data: { success: false, error: 'Access denied' } };
    }

    if (containsProfanity(content)) {
      return {
        event: 'sendOfferMessage',
        data: { success: false, error: 'Message contains inappropriate content' },
      };
    }

    const message = await this.prisma.message.create({
      data: {
        offerId,
        senderId: userId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const room = `offer:${offerId}`;
    this.server.to(room).emit('newMessage', message);

    this.logger.debug(`Offer message ${message.id} sent to room ${room} by user ${userId}`);

    return { event: 'sendOfferMessage', data: { success: true, message } };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { bookingId?: string; offerId?: string }
  ): void {
    const userId = client.userId;
    if (!userId) return;

    if (data.bookingId) {
      const room = `booking:${data.bookingId}`;
      client.to(room).emit('userTyping', { userId, bookingId: data.bookingId });
    } else if (data.offerId) {
      const room = `offer:${data.offerId}`;
      client.to(room).emit('userTyping', { userId, offerId: data.offerId });
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Extract JWT from the Socket.IO handshake.
   * Checks `auth.token` first (recommended), then falls back to the
   * Authorization header.
   */
  private extractToken(client: Socket): string | null {
    const authToken = client.handshake?.auth?.token;
    if (authToken) {
      return authToken;
    }

    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return null;
  }

  /**
   * Check whether a given user is currently online (has at least one connected socket).
   */
  isUserOnline(userId: string): boolean {
    const sockets = this.connectedUsers.get(userId);
    return !!sockets && sockets.size > 0;
  }
}
