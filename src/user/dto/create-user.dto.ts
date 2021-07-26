import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  Matches,
  IsNotEmpty,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { Match } from '../match.decorator';
import { roleEnum } from '../enums/role.enum';

export class CreateUserDto {
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

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
    { message: 'Weak password' },
  )
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Password must match' })
  confirmPassword: string;

  role: roleEnum;
}
