import { Module } from '@nestjs/common';
import { DeviceModule } from './device/device.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [DeviceModule, NotificationModule],
})
export class PushNotificationModule {}
