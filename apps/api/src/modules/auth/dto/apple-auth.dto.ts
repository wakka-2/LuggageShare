import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AppleFullName {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  givenName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  familyName?: string;
}

export class AppleAuthDto {
  @ApiProperty({
    description: 'Apple identity token from Sign in with Apple',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  identityToken: string;

  @ApiProperty({
    description: 'Apple authorization code',
    example: 'c1234567890abcdef...',
  })
  @IsString()
  @IsNotEmpty()
  authorizationCode: string;

  @ApiPropertyOptional({
    description: 'Full name (only provided on first sign-in)',
  })
  @ValidateNested()
  @Type(() => AppleFullName)
  @IsOptional()
  fullName?: AppleFullName;
}
