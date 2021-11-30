import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { HOBBIES } from '../../constants/constants';
import { hobbiesValidation } from '../../utils/enum-validation';

export class UserHobbiesDto {
  @ApiProperty({
    description: 'Hobbies example',
    type: [String],
    example: [...HOBBIES],
  })
  @IsEnum(HOBBIES, { each: true, message: hobbiesValidation })
  @IsOptional()
  public hobbies: string[];
}
