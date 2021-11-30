import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventsSubscribe } from './events-subscribe.entity';
import { EventsSubscribeService } from './events-subscribe.service';
import { EventsSubscribeController } from './events-subscribe.controller';
import { Event } from '../event.entity';
import { EventsModule } from '../events.module';
import { UserModule } from '../../user/user.module';
import { ChatsModule } from '../../chats/chats.module';
import { User } from '../../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event, EventsSubscribe]),
    forwardRef(() => EventsModule),
    UserModule,
    ChatsModule,
  ],
  providers: [EventsSubscribeService],
  controllers: [EventsSubscribeController],
  exports: [EventsSubscribeService],
})
export class EventsSubscribeModule {}
