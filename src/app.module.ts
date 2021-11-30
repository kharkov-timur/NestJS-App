import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { configModule } from './configure.root';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { FilesModule } from './files/files.module';
import { FiltersModule } from './filters/filters.module';
import { SearchModule } from './search/search.module';
import { UsersEventsModule } from './users-events/users-events.module';
import { RatingsModule } from './ratings/ratings.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { ChatsGateway } from './chats/chats.gateway';
import { FriendsModule } from './friends/friends.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.env.IMG_PATH),
      serveRoot: process.env.SERVE_ROOT,
      exclude: ['/api*'],
    }),
    configModule,
    TypeOrmModule.forRoot(),
    AuthModule,
    TokenModule,
    UserModule,
    MailModule,
    EventsModule,
    FilesModule,
    FiltersModule,
    SearchModule,
    UsersEventsModule,
    RatingsModule,
    FriendsModule,
    ChatsModule,
    MessagesModule,
    PushNotificationModule,
    CommentsModule,
  ],
  providers: [ChatsGateway],
})
export class AppModule {}
