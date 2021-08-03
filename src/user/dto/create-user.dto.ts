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

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-ZА-Яа-яёЁЇїІіЄєҐґ ]+$/)
  public firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-ZА-Яа-яёЁЇїІіЄєҐґ ]+$/)
  public lastName: string;

  @ApiProperty()
  @IsOptional()
  // @IsPhoneNumber('UA')
  public phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    //  /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
    {
      message: 'Minimum eight characters, at least one letter and one number:',
    },
  )
  public password: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // @Match('password', { message: 'Password must match' })
  // public confirmPassword: string;
}
