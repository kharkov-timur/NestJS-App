import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceService } from './device.service';
import { Device } from './device.entity';
import { Monitor } from '../../events/monitor/monitor.entity';
import { MonitorModule } from '../../events/monitor/monitor.module';
import { DeviceController } from './device.controller';
import { User } from '../../user/user.entity';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, Monitor, User]),
    MonitorModule,
    UserModule,
  ],
  providers: [DeviceService],
  exports: [DeviceService],
  controllers: [DeviceController],
})
export class DeviceModule {}
