import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}
