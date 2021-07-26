import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class CreateUserDto extends BaseUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-ZА-Яа-яёЁЇїІіЄєҐґ ]+$/)
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-ZА-Яа-яёЁЇїІіЄєҐґ ]+$/)
  lastName: string;

  @ApiProperty()
  @IsOptional()
  // @IsPhoneNumber('UA')
  phoneNumber: string;
}
