import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RatingEventModule } from './rating-event/rating-event.module';
import { RatingUserModule } from './rating-user/rating-user.module';
import { RatingsService } from './ratings.service';
import { Event } from '../events/event.entity';
import { User } from '../user/user.entity';
import { EventsSubscribe } from '../events/events-subscribe/events-subscribe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event, EventsSubscribe]),
    RatingEventModule,
    RatingUserModule,
  ],
  providers: [RatingsService],
})
export class RatingsModule {}
