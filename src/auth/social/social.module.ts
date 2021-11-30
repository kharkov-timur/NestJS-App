import { forwardRef, Module } from '@nestjs/common';

import { SocialService } from './social.service';
import { TwitterModule } from './twitter/twitter.module';
import { FacebookModule } from './facebook/facebook.module';
import { GoogleModule } from './google/google.module';
import { FilesModule } from '../../files/files.module';
import { AuthModule } from '../auth.module';
import { UserModule } from '../../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '../../files/files.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    forwardRef(() => AuthModule),
    UserModule,
    TwitterModule,
    FacebookModule,
    GoogleModule,
    FilesModule,
  ],
  providers: [SocialService],
})
export class SocialModule {}
