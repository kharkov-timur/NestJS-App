import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { typesValidation } from '../../utils/enum-validation';
import { TYPES } from '../../constants/constants';

export class SearchEventsDto {
  @ApiProperty({
    description: 'Event name example',
    type: String,
    example: 'Jetpack',
  })
  @IsString()
  @IsOptional()
  public name: string;

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
  @IsOptional()
  public type: string;

  @ApiProperty({
    description: 'Start date example',
    type: Date,
    example: '2021-09-27T07:33:34.619Z',
  })
  @IsDate()
  @IsOptional()
  public startDate: Date;

  @ApiProperty({
    description: 'End date example',
    type: Date,
    example: '2021-09-27T07:33:34.619Z',
  })
  @IsDate()
  @IsOptional()
  public endDate: Date;

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
  @IsOptional()
  public userLocation: string;
}
