import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeMainImgDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  eventId: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  imgName: string;
}
