import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerificationRequestDto {
  @ApiProperty({
    description: 'Type of ID document',
    enum: ['national_id', 'passport', 'driving_license'],
  })
  @IsString()
  @IsIn(['national_id', 'passport', 'driving_license'])
  documentType: string;

  @ApiProperty({ description: 'Document number' })
  @IsString()
  documentNumber: string;

  @ApiPropertyOptional({ description: 'Full name as it appears on the document' })
  @IsOptional()
  @IsString()
  fullName?: string;
}
