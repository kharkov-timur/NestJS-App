import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEventCommentsDto {
  @ApiProperty({ type: String, minLength: 200, maxLength: 1000 })
  @MinLength(200)
  @MaxLength(1000)
  @IsString()
  text: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  eventId: number;
}
