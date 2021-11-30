import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { TokenModule } from '../token/token.module';
import { Event } from '../events/event.entity';
import { AuthModule } from '../auth/auth.module';
import { ImageUtilsModule } from '../files/image/image-utils.module';
import { File } from '../files/files.entity';
import { FilesService } from '../files/files.service';
import { ImageUtilsService } from '../files/image/image-utils.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event, File]),
    TokenModule,
    ImageUtilsModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, FilesService, ImageUtilsService],
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
