import { IsString, IsUrl, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitPaymentProofDto {
  @ApiProperty({ description: 'URL of the uploaded payment proof image' })
  @IsString()
  @IsUrl(
    { protocols: ['https'], require_protocol: true },
    { message: 'proofImageUrl must be a valid HTTPS URL' }
  )
  @Matches(/\.(jpg|jpeg|png|webp)$/i, { message: 'proofImageUrl must point to an image file' })
  proofImageUrl: string;
}
