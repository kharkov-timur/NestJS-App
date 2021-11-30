import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IAuthResponse } from '../../../user/interfaces/user.intarface';
import { GoogleService } from './google.service';
import { CreateSocialUserDto } from '../../../user/dto/create-social-user.dto';

@ApiTags('GoogleAuth')
@Controller('/auth/google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Post()
  public async googleLogin(
    @Body() createSocialUserDto: CreateSocialUserDto,
  ): Promise<IAuthResponse> {
    return this.googleService.googleLogin(createSocialUserDto);
  }
}
