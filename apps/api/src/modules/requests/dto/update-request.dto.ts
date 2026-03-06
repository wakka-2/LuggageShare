import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRequestDto } from './create-request.dto';

// Cannot change prohibited items declaration after creation
export class UpdateRequestDto extends PartialType(
  OmitType(CreateRequestDto, ['prohibitedItemsDeclared'] as const)
) {}
