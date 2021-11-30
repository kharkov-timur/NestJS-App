import { ApiProperty } from '@nestjs/swagger';
import { isBase64, IsNumber, IsString } from 'class-validator';

export class MessageDto {
  @ApiProperty()
  @IsNumber()
  public id?: number;

  @ApiProperty()
  @IsString()
  public content: string;

  @ApiProperty()
  @IsString()
  public type: string;

  @ApiProperty()
  public file?: Express.Multer.File;
}
