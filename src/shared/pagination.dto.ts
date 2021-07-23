import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  page: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  limit: number;
}
