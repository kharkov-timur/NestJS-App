import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IAuthResponse } from '../../../user/interfaces/user.intarface';
import { TwitterService } from './twitter.service';
import { CreateSocialUserDto } from '../../../user/dto/create-social-user.dto';

@ApiTags('TwitterAuth')
@Controller('auth/twitter')
export class TwitterController {
  constructor(private readonly twitterService: TwitterService) {}

  @Post()
  public async twitterLogin(
    @Body() createSocialUserDto: CreateSocialUserDto,
  ): Promise<IAuthResponse> {
    return this.twitterService.twitterLogin(createSocialUserDto);
  }
}
