import { Body, Controller, Post } from '@nestjs/common';

import { IAuthResponse } from '../../../user/interfaces/user.intarface';
import { ApiTags } from '@nestjs/swagger';
import { FacebookService } from './facebook.service';
import { CreateSocialUserDto } from '../../../user/dto/create-social-user.dto';

@ApiTags('FacebookAuth')
@Controller('/auth/facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Post()
  public async facebookLogin(
    @Body() createSocialUserDto: CreateSocialUserDto,
  ): Promise<IAuthResponse> {
    return this.facebookService.facebookLogin(createSocialUserDto);
  }
}
