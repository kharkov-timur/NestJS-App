import { IsString, IsDateString, IsNumber } from 'class-validator';

export class CreateUserTokenDto {
  @IsString()
  token: string;
  @IsNumber()
  userId: number;
  @IsDateString()
  expireAt: string;
}
