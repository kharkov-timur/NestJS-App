import { ApiProperty } from '@nestjs/swagger';

export class LogOutDto {
  @ApiProperty()
  authorization: string;
}
