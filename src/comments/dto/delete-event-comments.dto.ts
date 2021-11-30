import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeleteEventCommentsDto {
  @ApiProperty()
  @IsNumber()
  eventId: number;
}
