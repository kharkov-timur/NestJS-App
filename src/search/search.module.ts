import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Event } from '../events/event.entity';
import { CheckRadiusService } from '../check-radius/check-radius.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [SearchController],
  providers: [SearchService, CheckRadiusService],
})
export class SearchModule {}
