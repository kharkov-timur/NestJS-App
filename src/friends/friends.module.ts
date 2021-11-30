import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FriendsService } from './friends.service';
import { Friends } from './friends.entity';
import { UserModule } from '../user/user.module';
import { FriendsController } from './friends.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Friends]), UserModule],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule {}
