import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User display name',
    example: 'Mohammed Ahmed',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://cdn.luggageshare.com/avatars/user123.jpg',
  })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Frequent traveler between Riyadh and Cairo',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'City of residence',
    example: 'Riyadh',
  })
  @IsString()
  @IsOptional()
  city?: string;
}
