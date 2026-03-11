import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateFlightDto } from './create-flight.dto';

// Cannot change availableWeight or departureDate once offers exist (enforced in service)
export class UpdateFlightDto extends PartialType(
  OmitType(CreateFlightDto, ['availableWeight'] as const)
) {}
