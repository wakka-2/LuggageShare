import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Receive push notifications', example: true })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @ApiPropertyOptional({ description: 'Preferred language', enum: ['ar', 'en'] })
  @IsOptional()
  @IsIn(['ar', 'en'])
  language?: 'ar' | 'en';
}
