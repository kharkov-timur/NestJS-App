import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';
import { Monitor } from './monitor.entity';
import { User } from '../../user/user.entity';
import { Device } from '../../push-notification/device/device.entity';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Monitor, Device]), UserModule],
  controllers: [MonitorController],
  providers: [MonitorService],
})
export class MonitorModule {}
