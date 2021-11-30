import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { TYPES } from '../../../constants/constants';
import { typesValidation } from '../../../utils/enum-validation';

export class EventsMonitorDto {
  @ApiProperty({
    description: 'Search radius example',
    type: Number,
    example: 5,
  })
  @IsNumber()
  @IsOptional()
  public searchRadius: number;

  @ApiProperty({
    description: 'Monitor type example',
    type: [String],
    example: [...TYPES],
  })
  @IsEnum(TYPES, {
    each: true,
    message: typesValidation,
  })
  @IsArray()
  @IsOptional()
  public types: string[];

  @ApiProperty({
    description: 'Location example',
    type: String,
    example: '49.58277797755011, 34.56885004111345',
  })
  @IsString()
  @IsNotEmpty({ message: 'Unable to determine the location' })
  public location: string;
}
