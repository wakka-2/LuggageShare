import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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

  @Post('conversations')
  @ApiOperation({ summary: 'Create or find a conversation (supports pre-booking messaging)' })
  @ApiResponse({ status: 201, description: 'Conversation created or found' })
  async createConversation(
    @CurrentUser() user: any,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagesService.createConversation(user.id, dto);
  }

  @Get('conversations/:conversationId')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiResponse({ status: 200, description: 'Returns messages' })
  async getMessages(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.messagesService.getMessages(user.id, conversationId, cursor);
  }

  @Post('conversations/:conversationId')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(
    @CurrentUser() user: any,
    @Param('bookingId') bookingId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.id, bookingId, sendMessageDto.content);
  }

  @Post('conversations/:conversationId/read')
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markAsRead(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagesService.markAsRead(user.id, conversationId);
  }
}
