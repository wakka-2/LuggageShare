import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google OAuth2 access token from implicit flow (useGoogleLogin)',
    example: 'ya29.a0AfH6SMC...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiPropertyOptional({ description: 'Optional invite code (rewards the inviter)' })
  @IsString()
  @IsOptional()
  @MaxLength(32)
  inviteCode?: string;
}
