import { forwardRef, Module } from '@nestjs/common';

import { UserModule } from '../../../user/user.module';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';
import { SocialService } from '../social.service';
import { AuthModule } from '../../auth.module';
import { FilesModule } from '../../../files/files.module';
import { SocialModule } from '../social.module';
import { DeviceModule } from '../../../push-notification/device/device.module';

@Module({
  imports: [
    UserModule,
    forwardRef(() => AuthModule),
    FilesModule,
    forwardRef(() => SocialModule),
    DeviceModule,
  ],
  controllers: [TwitterController],
  providers: [TwitterService, SocialService],
})
export class TwitterModule {}
