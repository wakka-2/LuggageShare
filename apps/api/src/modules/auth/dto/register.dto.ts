import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  /** Optional invite code — rewards the inviter with referral credits. */
  @IsString()
  @IsOptional()
  @MaxLength(32)
  inviteCode?: string;
}
