import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Event } from '../../events/event.entity';
import { RatingEvent } from './rating-event.entity';
import { RatingEventController } from './rating-event.controller';
import { RatingEventService } from './rating-event.service';
import { JwtAuthModule } from '../../auth/jwt/jwt-auth.module';
import { User } from '../../user/user.entity';
import { EventsSubscribe } from '../../events/events-subscribe/events-subscribe.entity';
import { UserModule } from '../../user/user.module';
import { EventsModule } from '../../events/events.module';
import { EventsSubscribeModule } from '../../events/events-subscribe/events-subscribe.module';
import { RatingsService } from '../ratings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RatingEvent, Event, User, EventsSubscribe]),
    JwtAuthModule,
    UserModule,
    EventsModule,
    EventsSubscribeModule,
  ],
  controllers: [RatingEventController],
  providers: [RatingEventService, RatingsService],
})
export class RatingEventModule {}
