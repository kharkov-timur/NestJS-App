import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersEvents } from './users-events.entity';
import { UsersEventsService } from './users-events.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEvents])],
  providers: [UsersEventsService],
  exports: [UsersEventsService],
})
export class UsersEventsModule {}
