import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTripDto } from './create-trip.dto';

// Exclude transportType from updates — changing transport type after creation is not allowed
export class UpdateTripDto extends PartialType(
  OmitType(CreateTripDto, ['transportType'] as const)
) {}
