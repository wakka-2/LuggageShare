import { IsEmail, IsString, MinLength, MaxLength, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Cannot access my wallet' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ enum: ['general', 'bug', 'billing', 'account', 'safety'] })
  @IsIn(['general', 'bug', 'billing', 'account', 'safety'])
  category: string;

  @ApiProperty({ example: 'I tried to withdraw but got an error...' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;
}
