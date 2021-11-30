import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';
import { statusEnum } from '../enums/status.enum';

export class UpdateUserDto {
  @ApiProperty({ type: String, example: 'John' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-ZА-Яа-яёЁЇїІіЄєҐґ ]+$/)
  public name: string;

  @ApiProperty({ type: String, example: 'Doe' })
  @IsString()
  @IsOptional()
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
  @IsEmail()
  @IsOptional()
  public email: string;

  public status?: statusEnum;
}
