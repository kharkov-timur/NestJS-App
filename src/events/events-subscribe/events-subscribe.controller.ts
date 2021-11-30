import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';

import { Event } from '../event.entity';
import { GetUser } from '../../components/decorators/get-user.decorator';
import { User } from '../../user/user.entity';
import { IResponseService } from '../../utils/response-service';
import { EventsSubscribeService } from './events-subscribe.service';

@ApiTags('Event subscribe')
@Controller('events')
export class EventsSubscribeController {
  constructor(private eventsSubscribeService: EventsSubscribeService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/requests/:ownerId')
  async getSubscribeRequests(
    @Param('ownerId') ownerId: number,
  ): Promise<Event[]> {
    return this.eventsSubscribeService.getSubscribeRequests(ownerId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/subscribe')
  async addSubscribeOnEvent(
    @GetUser() userInfo: User,
    @Query('eventId') eventId: number,
  ): Promise<IResponseService> {
    return this.eventsSubscribeService.addSubscribeOnEvent(
      userInfo.id,
      eventId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/requests/confirm')
  async confirmRequest(
    @GetUser() userInfo: User,
    @Query('eventId') eventId: number,
    @Query('subscriberId') subscriberId: number,
  ): Promise<IResponseService> {
    return this.eventsSubscribeService.confirmRequest(
      userInfo.id,
      subscriberId,
      eventId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/unsubscribe')
  async removeSubscribeInEvent(
    @Query('eventId') eventId: number,
    @Query('subscriberId') subscriberId: number,
  ): Promise<IResponseService> {
    return this.eventsSubscribeService.removeSubscribeOnEvent(
      subscriberId,
      eventId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/block-to-event')
  async blockUserToEvent(
    @GetUser() userInfo: User,
    @Query('eventId') eventId: number,
    @Query('blockUserId') blockUserId: number,
  ): Promise<IResponseService> {
    return this.eventsSubscribeService.blockUserToEvent(
      userInfo.id,
      blockUserId,
      eventId,
    );
  }
}
