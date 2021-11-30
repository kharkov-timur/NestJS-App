import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventCommentsController } from './event-comments.controller';
import { EventCommentsService } from './event-comments.service';
import { EventComments } from './event-comments.entity';
import { Event } from '../../events/event.entity';
import { User } from '../../user/user.entity';
import { UserModule } from '../../user/user.module';
import { EventsModule } from '../../events/events.module';
import { EventsSubscribe } from '../../events/events-subscribe/events-subscribe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event, EventComments, EventsSubscribe]),
    UserModule,
    EventsModule,
  ],
  controllers: [EventCommentsController],
  providers: [EventCommentsService],
})
export class EventCommentsModule {}
