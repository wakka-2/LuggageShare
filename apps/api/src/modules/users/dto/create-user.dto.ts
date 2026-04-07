import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  googleId?: string;

  @IsString()
  @IsOptional()
  appleId?: string;

  @IsString()
  @IsOptional()
  passwordHash?: string;

  @IsEnum(['google', 'apple', 'dev', 'email'])
  provider: 'google' | 'apple' | 'dev' | 'email';
}
