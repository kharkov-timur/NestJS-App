import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { roleEnum } from '../enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ type: String, example: 'John' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-ZА-Яа-яёЁЇїІіЄєҐґ ]+$/)
  public name: string;

  @ApiProperty({ type: String, example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-ZА-Яа-яёЁЇїІіЄєҐґ ]+$/)
  public surname: string;

  @ApiProperty({
    description: 'Phone number example',
    type: String,
    example: '+38050*****23',
  })
  @IsOptional()
  // @IsPhoneNumber('UA')
  public phoneNumber: string;

  @ApiProperty({
    description: 'Email example',
    type: String,
    example: 'example@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,

    {
      message: 'Minimum eight characters, at least one letter and one number:',
    },
  )
  public password: string;

  role: roleEnum;
}
