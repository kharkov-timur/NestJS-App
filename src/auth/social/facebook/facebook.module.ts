import { forwardRef, Module } from '@nestjs/common';

import { UserModule } from '../../../user/user.module';
import { FacebookController } from './facebook.controller';
import { FacebookService } from './facebook.service';
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
  controllers: [FacebookController],
  providers: [FacebookService, SocialService],
})
export class FacebookModule {}
