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
import { EventRatingDto } from './dto/event-rating.dto';
import { IEvent } from '../../events/interfaces/event.interface';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { RatingEventService } from './rating-event.service';
import { User } from '../../user/user.entity';

@ApiTags('Ratings')
@Controller('ratings/event')
export class RatingEventController {
  constructor(private readonly ratingEventService: RatingEventService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async addEventRating(
    @GetUser() userInfo: User,
    @Body() eventRatingDto: EventRatingDto,
  ): Promise<IEvent> {
    return this.ratingEventService.addEventRating(userInfo.id, eventRatingDto);
  }

  @Get('/:eventId')
  async getEventRatingById(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<IEvent> {
    return this.ratingEventService.getEventRatingById(eventId);
  }
}
