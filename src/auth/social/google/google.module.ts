import { forwardRef, Module } from '@nestjs/common';

import { UserModule } from '../../../user/user.module';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { AuthModule } from '../../auth.module';
import { FilesModule } from '../../../files/files.module';
import { SocialModule } from '../social.module';
import { SocialService } from '../social.service';
import { DeviceModule } from '../../../push-notification/device/device.module';

@Module({
  imports: [
    UserModule,
    forwardRef(() => AuthModule),
    FilesModule,
    forwardRef(() => SocialModule),
    DeviceModule,
  ],
  controllers: [GoogleController],
  providers: [GoogleService, SocialService],
})
export class GoogleModule {}
