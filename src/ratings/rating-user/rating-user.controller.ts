import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { GetUser } from '../../components/decorators/get-user.decorator';
import { RatingUserService } from './rating-user.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { UserRatingDto } from './dto/user-rating.dto';
import { User } from '../../user/user.entity';
import { IUser } from '../../user/interfaces/user.intarface';

@ApiTags('Ratings')
@Controller('ratings/user')
export class RatingUserController {
  constructor(private readonly ratingUserOwnerService: RatingUserService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async addUserRating(
    @GetUser() userInfo: User,
    @Body() userRatingDto: UserRatingDto,
  ): Promise<IUser> {
    return this.ratingUserOwnerService.addUserRating(
      userInfo.id,
      userRatingDto,
    );
  }

  @Get('/:userId')
  async getUserRatingById(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<IUser> {
    return this.ratingUserOwnerService.getUserRatingById(userId);
  }
}
