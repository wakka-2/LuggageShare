import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty({
    description: 'Reason for the dispute',
    example: 'damaged_item',
    enum: ['damaged_item', 'missing_item', 'wrong_item', 'late_delivery', 'no_delivery', 'other'],
  })
  @IsString()
  @IsIn(['damaged_item', 'missing_item', 'wrong_item', 'late_delivery', 'no_delivery', 'other'])
  reason: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the dispute',
    example: 'My item arrived with visible damage to the packaging and contents.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
