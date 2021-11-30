import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../user/user.entity';
import { RatingUser } from './rating-user.entity';
import { RatingUserController } from './rating-user.controller';
import { RatingUserService } from './rating-user.service';
import { JwtAuthModule } from '../../auth/jwt/jwt-auth.module';
import { Event } from '../../events/event.entity';
import { EventsSubscribe } from '../../events/events-subscribe/events-subscribe.entity';
import { UserModule } from '../../user/user.module';
import { EventsModule } from '../../events/events.module';
import { EventsSubscribeModule } from '../../events/events-subscribe/events-subscribe.module';
import { RatingsService } from '../ratings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RatingUser, User, Event, EventsSubscribe]),
    JwtAuthModule,
    UserModule,
    EventsModule,
    EventsSubscribeModule,
  ],
  controllers: [RatingUserController],
  providers: [RatingUserService, RatingsService],
})
export class RatingUserModule {}
