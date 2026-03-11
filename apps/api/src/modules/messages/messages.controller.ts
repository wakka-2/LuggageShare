import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  @ApiResponse({ status: 200, description: 'Returns user conversations' })
  async getConversations(@CurrentUser() user: any) {
    return this.messagesService.getConversations(user.id);
  }

  @Get('conversations/:bookingId')
  @ApiOperation({ summary: 'Get messages for a booking' })
  @ApiResponse({ status: 200, description: 'Returns messages' })
  async getMessages(
    @CurrentUser() user: any,
    @Param('bookingId') bookingId: string,
    @Query('cursor') cursor?: string
  ) {
    return this.messagesService.getMessages(user.id, bookingId, cursor);
  }

  @Post('conversations/:bookingId')
  @Throttle({ medium: { ttl: 60000, limit: 60 } })
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(
    @CurrentUser() user: any,
    @Param('bookingId') bookingId: string,
    @Body() sendMessageDto: SendMessageDto
  ) {
    return this.messagesService.sendMessage(user.id, bookingId, sendMessageDto.content);
  }

  @Post('conversations/:bookingId/read')
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markAsRead(@CurrentUser() user: any, @Param('bookingId') bookingId: string) {
    return this.messagesService.markAsRead(user.id, bookingId);
  }

  // ─── Offer chat REST endpoints ──────────────────────────────────────────────

  @Get('offers/:offerId')
  @ApiOperation({ summary: 'Get messages for an offer (pre-booking chat)' })
  async getOfferMessages(
    @CurrentUser() user: any,
    @Param('offerId') offerId: string,
    @Query('cursor') cursor?: string
  ) {
    return this.messagesService.getOfferMessages(user.id, offerId, cursor);
  }

  @Post('offers/:offerId')
  @Throttle({ medium: { ttl: 60000, limit: 60 } })
  @ApiOperation({ summary: 'Send a message on an offer thread' })
  async sendOfferMessage(
    @CurrentUser() user: any,
    @Param('offerId') offerId: string,
    @Body() dto: SendMessageDto
  ) {
    return this.messagesService.sendOfferMessage(user.id, offerId, dto.content);
  }

  @Post('offers/:offerId/read')
  @ApiOperation({ summary: 'Mark offer messages as read' })
  async markOfferMessagesRead(@CurrentUser() user: any, @Param('offerId') offerId: string) {
    return this.messagesService.markOfferMessagesRead(user.id, offerId);
  }
}
