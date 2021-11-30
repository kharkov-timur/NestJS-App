import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class UserRatingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  eventId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  receivingUserId: number;

  @ApiProperty({
    description: 'Rating example min: 1, max: 5',
    type: Number,
    example: 4,
  })
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @IsInt()
  rating: number;
}
