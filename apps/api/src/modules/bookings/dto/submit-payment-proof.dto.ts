import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitPaymentProofDto {
  @ApiProperty({ description: 'URL of the uploaded payment proof image' })
  @IsString()
  @IsUrl({}, { message: 'proofImageUrl must be a valid URL' })
  proofImageUrl: string;
}
