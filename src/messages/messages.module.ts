import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModule } from 'src/chats/chats.module';
import { UserModule } from 'src/user/user.module';
import { Message } from './messages.entity';
import { MessagesService } from './messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), ChatsModule, UserModule],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
