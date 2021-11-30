import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { typesValidation } from '../../utils/enum-validation';
import { TYPES } from '../../constants/constants';

export class FilterEventDto {
  @ApiProperty({
    description: 'Event type example',
    type: String,
    example: `${TYPES.join(' or ')}`,
  })
  @IsEnum(TYPES, {
    each: true,
    message: typesValidation,
  })
  @IsString()
  @IsNotEmpty()
  public type: string;

  @ApiProperty({
    description: 'Search radius example',
    type: Number,
    example: 5,
  })
  @IsNumber()
  @IsOptional()
  public searchRadius: number;

  @ApiProperty({
    description: 'Places left example',
    type: Number,
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  public placesLeft: number;

  @ApiProperty({
    description: 'Language example',
    type: String,
    example: 'Any',
  })
  @IsString()
  @IsOptional()
  public language: string;

  @ApiProperty({
    description: 'Location example',
    type: String,
    example: '49.58277797755011, 34.56885004111345',
  })
  @IsString()
  @IsNotEmpty()
  public userLocation: string;
}
