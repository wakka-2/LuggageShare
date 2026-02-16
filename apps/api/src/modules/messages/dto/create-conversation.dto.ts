import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ description: 'The other user to start a conversation with' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Related listing ID (for pre-booking conversations)' })
  @IsOptional()
  @IsString()
  listingId?: string;

  @ApiPropertyOptional({ description: 'Related booking ID (for booking conversations)' })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({ description: 'Initial message content' })
  @IsOptional()
  @IsString()
  initialMessage?: string;
}

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: ['text', 'image', 'location'], default: 'text' })
  @IsOptional()
  @IsString()
  messageType?: string;
}
