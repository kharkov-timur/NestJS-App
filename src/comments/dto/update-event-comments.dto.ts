import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateEventCommentsDto {
  @ApiProperty({ type: String })
  @MinLength(200)
  @MaxLength(1000)
  @IsString()
  text: string;

  @ApiProperty()
  @IsNumber()
  eventId: number;
}
