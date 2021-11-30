import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  enumValidationMessage,
  typesValidation,
} from '../../utils/enum-validation';
import { eventStatusEnum } from '../enums/event-status.enum';
import { TYPES } from '../../constants/constants';

export class UpdateEventDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  public name: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  public description: string;

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

  @IsEnum(eventStatusEnum, {
    message: enumValidationMessage,
  })
  @IsString()
  @IsOptional()
  public status: eventStatusEnum;

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
    description: 'Time example',
    type: Date,
    example: '2021-09-27T07:33:34.619Z',
  })
  @IsDate()
  @IsOptional()
  public time: Date;

  @ApiProperty({
    description: 'Language example',
    type: String,
    example: 'Any',
  })
  @IsString()
  @IsOptional()
  public language: string;

  @ApiProperty({
    description: 'Address example',
    type: String,
    example: 'Poltava, Poltava Oblast, 36000',
  })
  @IsString()
  @IsOptional()
  public address: string;

  @ApiProperty({
    description: 'Location example',
    type: String,
    example: '49.58277797755011, 34.56885004111345',
  })
  @IsString()
  @IsOptional()
  public location: string;

  @ApiProperty({
    description: 'Places example',
    type: Number,
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  public places: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public joinOnConfirmation: boolean;
}
