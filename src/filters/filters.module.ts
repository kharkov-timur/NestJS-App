import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FiltersService } from './filters.service';
import { FiltersController } from './filters.controller';
import { Event } from '../events/event.entity';
import { CheckRadiusService } from '../check-radius/check-radius.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [FiltersService, CheckRadiusService],
  controllers: [FiltersController],
})
export class FiltersModule {}
