import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { devicePlatformEnum } from '../../push-notification/device/enums/device-platform.enum';
import { enumValidationMessage } from '../../utils/enum-validation';

export class CreateSocialUserDto {
  @ApiProperty()
  @IsString()
  userID: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  userName: string;

  @ApiProperty({
    description: 'Email example',
    type: String,
    example: 'example@gmail.com',
  })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imageURL: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  accessToken: string;

  @ApiProperty({
    description: 'Device id',
    type: String,
    example: '4684648681681',
  })
  @IsString()
  @IsOptional()
  public deviceId: string;

  @ApiProperty({
    description: 'Platform name',
    type: String,
    example: 'android or ios',
  })
  @IsEnum(devicePlatformEnum, {
    message: enumValidationMessage,
  })
  @IsString()
  @IsOptional()
  public platform: devicePlatformEnum;

  @ApiProperty({
    description: 'Firebase device token',
    type: String,
    example: 'Firebase device token',
  })
  @IsString()
  @IsOptional()
  public deviceToken: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public firstLogin: boolean;
}
