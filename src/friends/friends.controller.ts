import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

import { FriendsService } from './friends.service';
import { GetUser } from '../components/decorators/get-user.decorator';
import { User } from '../user/user.entity';
import { IResponseService } from '../utils/response-service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { IFriend } from './interfaces/friends.interface';

@ApiTags('Users friend')
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}

  @ApiProperty()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    description: 'Support pagination',
    example: 'friends?page=2&limit=5',
  })
  @Get()
  async getAllFollowers(
    @GetUser() userInfo: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 20,
  ): Promise<Pagination<IFriend>> {
    limit = limit > 100 ? 100 : limit;
    return this.friendService.getAllFollowers(userInfo.id, {
      page,
      limit,
      route: `${process.env.BASE_URL}/friends`,
    });
  }

  @ApiProperty()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/request')
  async getAllRequest(@GetUser() userInfo: User): Promise<IFriend[]> {
    return this.friendService.getAllRequest(userInfo.id);
  }

  @ApiProperty()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/subscribe/:id')
  async subscribeToUser(
    @GetUser() userInfo: User,
    @Param('id') followeeId: number,
  ): Promise<IResponseService> {
    return this.friendService.subscribeToUser(userInfo.id, followeeId);
  }

  @ApiProperty()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/confirm/:followerId')
  async confirmRequest(
    @GetUser() userInfo: User,
    @Param('followerId') followerId: number,
  ): Promise<IResponseService> {
    return this.friendService.confirmRequest(userInfo.id, followerId);
  }

  @ApiProperty()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/unsubscribe/:id')
  async unsubscribeToUser(
    @GetUser() userInfo: User,
    @Param('id') followerId: number,
  ): Promise<IResponseService> {
    return this.friendService.unsubscribeToUser(userInfo.id, followerId);
  }
}
