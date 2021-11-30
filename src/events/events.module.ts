import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';
import { User } from '../user/user.entity';
import { UsersEvents } from '../users-events/users-events.entity';
import { Event } from './event.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MonitorModule } from './monitor/monitor.module';
import { UserModule } from '../user/user.module';
import { ChatsModule } from 'src/chats/chats.module';
import { File } from '../files/files.entity';
import { FilesService } from '../files/files.service';
import { ImageUtilsModule } from '../files/image/image-utils.module';
import { ImageUtilsService } from '../files/image/image-utils.service';
import { Monitor } from './monitor/monitor.entity';
import { CheckRadiusService } from '../check-radius/check-radius.service';
import { NotificationModule } from '../push-notification/notification/notification.module';
import { NotificationService } from '../push-notification/notification/notification.service';
import { EventsSubscribe } from './events-subscribe/events-subscribe.entity';
import { EventsSubscribeModule } from './events-subscribe/events-subscribe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      User,
      UsersEvents,
      File,
      EventsSubscribe,
      Monitor,
    ]),
    UserModule,
    AuthModule,
    FilesModule,
    forwardRef(() => ChatsModule),
    ImageUtilsModule,
    NotificationModule,
    forwardRef(() => EventsSubscribeModule),
    MonitorModule,
  ],
  providers: [
    EventsService,
    FilesService,
    ImageUtilsService,
    CheckRadiusService,
    NotificationService,
  ],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
